/**
 * Zaileys HTML Apps & Interactive Card Helper for Casileys
 * 
 * Based on Zaileys Official Documentation:
 * https://zaileys.kejaa.id/messaging/html-app
 * 
 * Implements Android In-Chat HTML Apps matching reference screenshots:
 * - Cyber Purple & Black theme (#0e0719 / #1e1035 / #581c87 / #c084fc)
 * - Animated rotating neon gear/spark icon
 * - Centered Category Header & "Tap to copy!" subtitle
 * - 2-Column Command Card grid with title, description, and monospace capsule badge
 * - 1-Tap Clipboard Copy with animated toast & visual haptic feedback
 * - bypassDownload: false support for the "Verify security / Download" prompt
 */

import crypto from 'crypto';
import { proto, generateWAMessageFromContent, AIRich } from '@kaels/casileys';
import { EMBEDDED_BRAND_LOGO_BASE64, EMBEDDED_HEADER_BG_BASE64 } from './embeddedLogo';

export interface CommandCardItem {
  name: string;
  desc: string;
  capsule: string;
}

export interface HtmlAppOptions {
  title?: string;
  height?: number;
  quoted?: any;
  bypassDownload?: boolean;
  additionalAttributes?: Record<string, string>;
}

/**
 * HTML Escaping utility
 */
export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Builds the exact Protobuf message payload for WhatsApp Android HTML App card
 */
export function buildHtmlAppPayload(
  markup: string,
  options: { title?: string; height?: number } = {}
): proto.IMessage {
  const height = options.height || 980;
  const title = options.title || 'YASHI HALLS MINI';

  const stylePrefix = `<style>
html,body{margin:0;padding:0;height:${height}px;max-height:${height}px;overflow-x:hidden;overflow-y:auto;background:#10111b;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-user-select:none;user-select:none}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:#10111b}
::-webkit-scrollbar-thumb{background:#581c87;border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:#7c3aed}
</style>`;

  // Strip DOCTYPE, html, head, body tags if present while strictly preserving internal <style> and <script> contents
  let sanitizedMarkup = markup.trim()
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<\/?(html|head|body)[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .trim();

  const cleanPayload = stylePrefix + sanitizedMarkup;
  const responseId = crypto.randomUUID();
  const botResponseId = crypto.randomUUID();

  const sectionData = {
    __typename: 'GenAIUnifiedResponse',
    response_id: responseId,
    sections: [
      {
        __typename: 'GenAIUnifiedResponseSection',
        view_model: {
          __typename: 'GenAISingleLayoutViewModel',
          primitive: {
            __typename: 'GenAIaeacdsnwHtmlPrimitive',
            payload: cleanPayload,
            trusted_sources: [],
          },
        },
      },
    ],
  };

  const base64Data = Buffer.from(JSON.stringify(sectionData), 'utf8').toString('base64');

  const verificationMetadata = typeof (AIRich as any)?.generateVerificationMetadata === 'function'
    ? (AIRich as any).generateVerificationMetadata()
    : {
        proofs: [
          {
            version: 1,
            useCase: 1,
            signature: crypto.randomBytes(64).toString('base64'),
            certificateChain: [
              crypto.randomBytes(684).toString('base64'),
              crypto.randomBytes(892).toString('base64'),
            ],
          },
        ],
      };

  const payload: proto.IMessage = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      messageSecret: crypto.randomBytes(32),
      botMetadata: {
        messageDisclaimerText: title,
        botResponseId,
        verificationMetadata,
        richResponseSourcesMetadata: {
          sources: [],
        },
      },
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1, // GenAI rich response
          submessages: [],
          unifiedResponse: {
            data: Buffer.from(JSON.stringify(sectionData), 'utf-8'),
          },
          originalRecipientMetadata: {
            data: Buffer.from(JSON.stringify(sectionData), 'utf-8'),
          },
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: {
              botJid: '867051314767696@bot',
            },
            forwardOrigin: 4,
          },
        },
      },
    },
  };

  return payload;
}

/**
 * Sends an HTML App card via Casileys socket.
 * Executes Protocol 14 (MESSAGE_EDIT) bypass automatically unless bypassDownload is explicitly false,
 * expanding the rendered HTML card UI directly in the WhatsApp Android chat bubble.
 */
export async function sendHtmlApp(
  sock: any,
  jid: string,
  markup: string,
  options: HtmlAppOptions = {}
): Promise<{ success: boolean; messageId: string; error?: string }> {
  if (!sock) {
    throw new Error('Casileys socket is not initialized');
  }

  const userJid = sock.authState?.creds?.me?.id || sock.user?.id || '';
  const height = options.height || 980;
  const title = options.title || 'YASHI HALLS MINI';

  const rawPayload = buildHtmlAppPayload(markup, { title, height });

  try {
    const fullMsg = generateWAMessageFromContent(
      jid,
      rawPayload,
      {
        userJid,
        logger: sock.logger,
      }
    );

    const messageId = fullMsg.key?.id || ('YASHI_' + crypto.randomBytes(8).toString('hex').toUpperCase());

    // 1. Initial relay of forwarded HTML message
    await sock.relayMessage(jid, fullMsg.message, {
      messageId,
      additionalAttributes: {
        ...(options.additionalAttributes || {}),
      },
    });

    // 2. Protocol 14 (MESSAGE_EDIT) bypassDownload trick
    // Executes in background so response returns instantly without stalling the caller
    if (options.bypassDownload !== false) {
      setTimeout(async () => {
        try {
          const editContent = {
            botForwardedMessage: {
              message: {
                protocolMessage: {
                  key: {
                    remoteJid: jid,
                    fromMe: true,
                    id: messageId,
                  },
                  type: 14, // proto.Message.ProtocolMessage.Type.MESSAGE_EDIT
                  editedMessage: fullMsg.message,
                },
              },
            },
          };

          const editMsg = generateWAMessageFromContent(
            jid,
            editContent,
            {
              userJid,
              logger: sock.logger,
            }
          );

          if (editMsg.key?.id) {
            await sock.relayMessage(jid, editMsg.message, {
              messageId: editMsg.key.id,
            });
          }
        } catch (editErr: any) {
          console.warn('[HTML APP] Protocol 14 bypass edit notice:', editErr?.message || editErr);
        }
      }, 35);
    }

    return { success: true, messageId };
  } catch (err: any) {
    console.error('[HTML APP] Failed to relay HTML App:', err?.message || err);
    return { success: false, messageId: '', error: err?.message || String(err) };
  }
}

/**
 * Edits an existing HTML App Card using WhatsApp Protocol 14 (MESSAGE_EDIT)
 */
export async function editHtmlApp(
  sock: any,
  jid: string,
  messageId: string,
  markup: string,
  options: { title?: string; height?: number } = {}
): Promise<boolean> {
  if (!sock || !messageId) return false;
  const userJid = sock.authState?.creds?.me?.id || sock.user?.id || '';
  const height = options.height || 360;
  const title = options.title || 'YASHI HALLS MEDIA';

  try {
    const rawPayload = buildHtmlAppPayload(markup, { title, height });
    const fullMsg = generateWAMessageFromContent(jid, rawPayload, { userJid, logger: sock.logger });

    const editContent = {
      botForwardedMessage: {
        message: {
          protocolMessage: {
            key: {
              remoteJid: jid,
              fromMe: true,
              id: messageId,
            },
            type: 14, // proto.Message.ProtocolMessage.Type.MESSAGE_EDIT
            editedMessage: fullMsg.message,
          },
        },
      },
    };

    const editMsg = generateWAMessageFromContent(jid, editContent, { userJid, logger: sock.logger });
    if (editMsg.key?.id) {
      await sock.relayMessage(jid, editMsg.message, { messageId: editMsg.key.id });
      return true;
    }
  } catch (err: any) {
    console.warn('[EDIT HTML APP] Protocol 14 edit notice:', err?.message || err);
  }
  return false;
}

export interface DownloadStatusOptions {
  botName?: string;
  type?: 'AUDIO' | 'VIDEO' | 'FILE';
  query: string;
  title?: string;
  status: 'SEARCHING' | 'DOWNLOADING' | 'SUCCESS' | 'ERROR';
  progress?: number;
  duration?: string;
  bitrate?: string;
  quality?: string;
  fileSize?: string;
  errorMessage?: string;
  prefix?: string;
  height?: number;
}

export function generateDownloadStatusHtml(options: DownloadStatusOptions): string {
  const height = Math.max(380, options.height || 390);
  const botName = (options.botName || 'YASHI HALLS').toUpperCase();
  const query = escapeHtml(options.query || 'Media');
  const title = escapeHtml(options.title || options.query || 'Media Stream');
  const status = options.status || 'SEARCHING';
  const type = options.type || 'AUDIO';
  const pct = Math.min(100, Math.max(0, options.progress ?? (status === 'SEARCHING' ? 30 : status === 'DOWNLOADING' ? 75 : 100)));
  const icon = type === 'VIDEO' ? '🎬' : '🎵';
  const mediaLabel = type === 'VIDEO' ? 'Video' : 'Audio MP3';

  return `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes spinSlow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes spinDisc { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes radarSweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes radarPulse { 0% { transform: scale(0.6); opacity: 0.9; } 70% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(1.3); opacity: 0; } }
  @keyframes eqBounce { 0%, 100% { height: 4px; } 50% { height: 26px; } }
  @keyframes shimmerBeam { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
  @keyframes arrowDrop { 0% { transform: translateY(-6px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(6px); opacity: 0; } }
  @keyframes popBounce { 0% { transform: scale(0.6); opacity: 0; } 70% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes rippleGreen { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 14px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
  @keyframes liveDotGlow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
  @keyframes dispatchSlide { 0%, 100% { transform: translateX(0); opacity: 0.85; } 50% { transform: translateX(4px); opacity: 1; } }

  .dl-card-root {
    width: 100%;
    height: ${height}px;
    max-height: ${height}px;
    background: ${status === 'SUCCESS' ? 'linear-gradient(145deg, #061812 0%, #0c271e 50%, #05140f 100%)' : status === 'ERROR' ? 'linear-gradient(145deg, #1f080c 0%, #290a10 50%, #150407 100%)' : status === 'DOWNLOADING' ? 'linear-gradient(145deg, #100624 0%, #1b0a38 50%, #0a0318 100%)' : 'linear-gradient(145deg, #071124 0%, #0e1d3d 50%, #050b18 100%)'};
    color: #f8fafc;
    padding: 14px 14px 12px;
    border: 1px solid ${status === 'SUCCESS' ? '#10b981' : status === 'ERROR' ? '#ef4444' : status === 'DOWNLOADING' ? '#a855f7' : '#38bdf8'};
    border-radius: 18px;
    position: relative;
    overflow: hidden;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-shadow: 0 0 25px ${status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.25)' : status === 'ERROR' ? 'rgba(239, 68, 68, 0.25)' : status === 'DOWNLOADING' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(56, 189, 248, 0.25)'};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Header Bar */
  .dl-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 9px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .dl-brand-box {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .dl-brand-icon {
    font-size: 15px;
    display: inline-block;
  }
  .dl-brand-title {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1px;
    color: #e2e8f0;
    text-transform: uppercase;
  }
  .dl-status-badge {
    font-size: 9.5px;
    font-weight: 800;
    padding: 3px 9px;
    border-radius: 20px;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .badge-searching {
    background: rgba(56, 189, 248, 0.18);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.4);
  }
  .badge-downloading {
    background: rgba(168, 85, 247, 0.22);
    color: #d8b4fe;
    border: 1px solid rgba(168, 85, 247, 0.5);
  }
  .badge-success {
    background: rgba(16, 185, 129, 0.22);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.5);
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  }
  .badge-error {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.4);
  }

  /* Step Indicator Bar */
  .dl-steps-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 4px;
    margin-top: 4px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .dl-step-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 9px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.4px;
  }
  .dl-step-item.active {
    color: #38bdf8;
    text-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
  }
  .dl-step-item.active-dl {
    color: #c084fc;
    text-shadow: 0 0 8px rgba(192, 132, 252, 0.5);
  }
  .dl-step-item.completed {
    color: #34d399;
  }
  .dl-step-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #475569;
  }
  .dl-step-dot.active-cyan {
    background: #38bdf8;
    box-shadow: 0 0 8px #38bdf8;
    animation: liveDotGlow 1s infinite;
  }
  .dl-step-dot.active-purple {
    background: #c084fc;
    box-shadow: 0 0 8px #c084fc;
    animation: liveDotGlow 1s infinite;
  }
  .dl-step-dot.completed-green {
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
  }
  .dl-step-arrow {
    color: #475569;
    font-size: 8px;
  }

  /* Main Stage Container */
  .dl-stage-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 6px 2px;
  }

  /* STAGE 1: SEARCHING RADAR */
  .radar-box {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 4px auto 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .radar-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(56, 189, 248, 0.3);
  }
  .radar-ring-pulse {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid #38bdf8;
    animation: radarPulse 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }
  .radar-sweep {
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, rgba(56, 189, 248, 0.45) 0deg, rgba(56, 189, 248, 0) 90deg, transparent 360deg);
    animation: radarSweep 2.2s linear infinite;
  }
  .radar-center-icon {
    position: relative;
    z-index: 2;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #0b1e3b;
    border: 2px solid #38bdf8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 0 14px rgba(56, 189, 248, 0.6);
  }

  /* STAGE 2: DOWNLOADING VINYL & EQUALIZER */
  .dl-active-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin: 4px 0 8px;
  }
  .vinyl-disc {
    width: 66px;
    height: 66px;
    border-radius: 50%;
    background: radial-gradient(circle, #0e0719 28%, #1f1133 30%, #0e0719 45%, #25143d 48%, #0e0719 62%, #18092a 70%);
    border: 2px solid #a855f7;
    box-shadow: 0 0 16px rgba(168, 85, 247, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: spinDisc 5s linear infinite;
    position: relative;
    flex-shrink: 0;
  }
  .vinyl-center {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ec4899, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    box-shadow: 0 0 8px #ec4899;
  }
  .dl-portal-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .dl-arrow-box {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(168, 85, 247, 0.2);
    border: 1px solid #c084fc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #e9d5ff;
    box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
  }
  .dl-arrow-icon {
    animation: arrowDrop 1.2s ease-in-out infinite;
  }
  .dl-eq-wrap {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 3px;
    height: 28px;
  }
  .dl-eq-bar {
    width: 3.5px;
    background: linear-gradient(180deg, #38bdf8, #c084fc, #ec4899);
    border-radius: 3px;
    animation: eqBounce 0.85s ease-in-out infinite;
  }
  .dl-eq-bar:nth-child(1) { animation-delay: 0.05s; }
  .dl-eq-bar:nth-child(2) { animation-delay: 0.18s; }
  .dl-eq-bar:nth-child(3) { animation-delay: 0.32s; }
  .dl-eq-bar:nth-child(4) { animation-delay: 0.12s; }
  .dl-eq-bar:nth-child(5) { animation-delay: 0.45s; }
  .dl-eq-bar:nth-child(6) { animation-delay: 0.22s; }
  .dl-eq-bar:nth-child(7) { animation-delay: 0.38s; }
  .dl-eq-bar:nth-child(8) { animation-delay: 0.15s; }
  .dl-eq-bar:nth-child(9) { animation-delay: 0.29s; }
  .dl-eq-bar:nth-child(10) { animation-delay: 0.48s; }

  /* Progress Bar */
  .dl-progress-box {
    margin: 6px 0 4px;
  }
  .dl-progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    font-weight: 800;
    color: #cbd5e1;
    margin-bottom: 3px;
  }
  .dl-track {
    width: 100%;
    height: 7px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
  }
  .dl-fill {
    height: 100%;
    width: ${pct}%;
    background: ${status === 'SUCCESS' ? 'linear-gradient(90deg, #059669, #10b981, #34d399)' : status === 'DOWNLOADING' ? 'linear-gradient(90deg, #9333ea, #c084fc, #38bdf8)' : 'linear-gradient(90deg, #0284c7, #38bdf8, #818cf8)'};
    border-radius: 6px;
    position: relative;
    overflow: hidden;
    transition: width 0.4s ease;
    box-shadow: 0 0 10px ${status === 'SUCCESS' ? '#10b981' : status === 'DOWNLOADING' ? '#c084fc' : '#38bdf8'};
  }
  .dl-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
    animation: shimmerBeam 1.8s infinite;
  }

  /* STAGE 3: SUCCESS CELEBRATION & STEP DETAILS */
  .dl-success-hero {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.35);
    border-radius: 12px;
    margin-bottom: 7px;
  }
  .dl-check-shield {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    border: 2px solid #34d399;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #ffffff;
    flex-shrink: 0;
    animation: popBounce 0.5s ease-out, rippleGreen 2s infinite;
  }
  .dl-hero-content {
    flex: 1;
    overflow: hidden;
  }
  .dl-hero-badge {
    font-size: 11px;
    font-weight: 900;
    color: #34d399;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .dl-hero-sub {
    font-size: 9.5px;
    color: #94a3b8;
    margin-top: 1px;
  }

  /* Song / Video Name Banner */
  .dl-media-banner {
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    margin-bottom: 7px;
  }
  .dl-media-tag {
    font-size: 8.5px;
    font-weight: 800;
    color: #a78bfa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1px;
  }
  .dl-media-name {
    font-size: 12.5px;
    font-weight: 800;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* 4-Pill Metadata Grid */
  .dl-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 2px;
  }
  .dl-meta-pill {
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 9px;
    padding: 5px 8px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .dl-meta-pill:hover {
    border-color: rgba(52, 211, 153, 0.4);
  }
  .dl-meta-label {
    font-size: 8px;
    font-weight: 800;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .dl-meta-val {
    font-size: 11px;
    font-weight: 800;
    color: #f1f5f9;
  }
  .val-green {
    color: #34d399;
  }
  .val-purple {
    color: #d8b4fe;
  }
  .val-cyan {
    color: #38bdf8;
  }

  /* Dispatch Notification Banner */
  .dl-dispatch-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    margin-top: 6px;
    background: rgba(16, 185, 129, 0.08);
    border: 1px dashed rgba(52, 211, 153, 0.4);
    border-radius: 10px;
    font-size: 9.5px;
    color: #cbd5e1;
  }
  .dl-dispatch-text {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 700;
  }
  .dl-dispatch-arrow {
    color: #34d399;
    font-size: 12px;
    animation: dispatchSlide 1.2s infinite;
  }

  /* STAGE ERROR */
  .dl-error-box {
    padding: 12px 10px;
    text-align: center;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    margin: 8px 0;
  }
  .dl-error-icon {
    font-size: 26px;
    margin-bottom: 4px;
  }
  .dl-error-title {
    font-size: 13px;
    font-weight: 800;
    color: #f87171;
    margin-bottom: 4px;
  }
  .dl-error-msg {
    font-size: 10.5px;
    color: #fca5a5;
    line-height: 1.4;
  }

  /* Footer */
  .dl-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 7px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 9.5px;
    color: #94a3b8;
  }
  .dl-footer-brand {
    color: #c084fc;
    font-weight: 800;
    letter-spacing: 0.5px;
  }
</style>

<div class="dl-card-root">
  <!-- TOP HEADER -->
  <div class="dl-header">
    <div class="dl-brand-box">
      <span class="dl-brand-icon">⚡</span>
      <span class="dl-brand-title">${botName} • CLOUD STREAM</span>
    </div>
    ${status === 'SEARCHING' ? `
      <div class="dl-status-badge badge-searching">🔍 SEARCHING</div>
    ` : status === 'DOWNLOADING' ? `
      <div class="dl-status-badge badge-downloading">📥 DOWNLOADING • ${pct}%</div>
    ` : status === 'SUCCESS' ? `
      <div class="dl-status-badge badge-success">✅ DOWNLOAD READY</div>
    ` : `
      <div class="dl-status-badge badge-error">❌ FAILED</div>
    `}
  </div>

  <!-- STEP PROGRESS TRACKER -->
  <div class="dl-steps-bar">
    <div class="dl-step-item ${status === 'SEARCHING' ? 'active' : status === 'DOWNLOADING' || status === 'SUCCESS' ? 'completed' : ''}">
      <span class="dl-step-dot ${status === 'SEARCHING' ? 'active-cyan' : status === 'DOWNLOADING' || status === 'SUCCESS' ? 'completed-green' : ''}"></span>
      <span>1. සෙවීම</span>
    </div>
    <span class="dl-step-arrow">➔</span>
    <div class="dl-step-item ${status === 'DOWNLOADING' ? 'active-dl' : status === 'SUCCESS' ? 'completed' : ''}">
      <span class="dl-step-dot ${status === 'DOWNLOADING' ? 'active-purple' : status === 'SUCCESS' ? 'completed-green' : ''}"></span>
      <span>2. බාගත කිරීම</span>
    </div>
    <span class="dl-step-arrow">➔</span>
    <div class="dl-step-item ${status === 'SUCCESS' ? 'completed' : ''}">
      <span class="dl-step-dot ${status === 'SUCCESS' ? 'completed-green' : ''}"></span>
      <span>3. රෙඩි (Ready)</span>
    </div>
  </div>

  <!-- STAGE 1: SEARCHING ANIMATION -->
  ${status === 'SEARCHING' ? `
  <div class="dl-stage-container">
    <div class="radar-box">
      <div class="radar-ring"></div>
      <div class="radar-ring-pulse"></div>
      <div class="radar-sweep"></div>
      <div class="radar-center-icon">🔍</div>
    </div>
    <div style="text-align: center; margin-bottom: 6px;">
      <div style="font-size: 13px; font-weight: 800; color: #ffffff; margin-bottom: 2px;">
        ${icon} ${mediaLabel} සොයමින් පවතී...
      </div>
      <div style="font-size: 11px; font-weight: 700; color: #38bdf8;">
        "${query}"
      </div>
    </div>
    <div class="dl-progress-box">
      <div class="dl-progress-labels">
        <span>⚡ YouTube & Cloud Stream Scan</span>
        <span>${pct}%</span>
      </div>
      <div class="dl-track">
        <div class="dl-fill"><div class="dl-shimmer"></div></div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- STAGE 2: DOWNLOADING ANIMATION -->
  ${status === 'DOWNLOADING' ? `
  <div class="dl-stage-container">
    <div class="dl-media-banner" style="margin-bottom: 6px;">
      <div class="dl-media-tag">EXTRACTING ${mediaLabel.toUpperCase()}</div>
      <div class="dl-media-name">${icon} ${title}</div>
    </div>

    <div class="dl-active-row">
      <div class="vinyl-disc">
        <div class="vinyl-center">${icon}</div>
      </div>
      <div class="dl-portal-col">
        <div class="dl-arrow-box">
          <span class="dl-arrow-icon">⬇️</span>
        </div>
        <div class="dl-eq-wrap">
          <div class="dl-eq-bar"></div>
          <div class="dl-eq-bar"></div>
          <div class="dl-eq-bar"></div>
          <div class="dl-eq-bar"></div>
          <div class="dl-eq-bar"></div>
          <div class="dl-eq-bar"></div>
          <div class="dl-eq-bar"></div>
          <div class="dl-eq-bar"></div>
          <div class="dl-eq-bar"></div>
          <div class="dl-eq-bar"></div>
        </div>
      </div>
    </div>

    <div class="dl-progress-box">
      <div class="dl-progress-labels">
        <span style="color: #c084fc;">📥 Extracting High Quality Stream</span>
        <span style="color: #f1f5f9;">${pct}%</span>
      </div>
      <div class="dl-track">
        <div class="dl-fill"><div class="dl-shimmer"></div></div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- STAGE 3: DOWNLOAD READY CELEBRATION & DETAILED METADATA -->
  ${status === 'SUCCESS' ? `
  <div class="dl-stage-container">
    <!-- HERO READY BANNER -->
    <div class="dl-success-hero">
      <div class="dl-check-shield">✓</div>
      <div class="dl-hero-content">
        <div class="dl-hero-badge">✨ DOWNLOAD READY!</div>
        <div class="dl-hero-sub">බාගත කිරීම සාර්ථකයි • ගොනුව සූදානම්</div>
      </div>
    </div>

    <!-- TITLE CARD -->
    <div class="dl-media-banner">
      <div class="dl-media-tag">${mediaLabel.toUpperCase()} DETAILS</div>
      <div class="dl-media-name">${icon} ${title}</div>
    </div>

    <!-- 4-GRID STEP-BY-STEP DETAILS -->
    <div class="dl-meta-grid">
      <div class="dl-meta-pill">
        <span class="dl-meta-label">⏱️ Duration (කාලය)</span>
        <span class="dl-meta-val val-purple">${escapeHtml(options.duration || '03:45')}</span>
      </div>
      <div class="dl-meta-pill">
        <span class="dl-meta-label">📦 File Size (ප්‍රමාණය)</span>
        <span class="dl-meta-val val-cyan">${escapeHtml(options.fileSize || 'Direct Stream')}</span>
      </div>
      <div class="dl-meta-pill">
        <span class="dl-meta-label">🔊 Quality / Bitrate</span>
        <span class="dl-meta-val val-green">${escapeHtml(options.bitrate || options.quality || (type === 'VIDEO' ? '720p HD MP4' : '320kbps MP3'))}</span>
      </div>
      <div class="dl-meta-pill">
        <span class="dl-meta-label">⚡ Direct Delivery</span>
        <span class="dl-meta-val val-green" style="display: flex; align-items: center; gap: 4px;">
          <span style="width: 5px; height: 5px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
          Direct Stream ✅
        </span>
      </div>
    </div>

    <!-- DISPATCH STEP -->
    <div class="dl-dispatch-banner">
      <div class="dl-dispatch-text">
        <span>📤 ගොනුව දැන් WhatsApp Chat එකට ලැබෙනු ඇත...</span>
      </div>
      <span class="dl-dispatch-arrow">➔</span>
    </div>
  </div>
  ` : ''}

  <!-- STAGE 4: ERROR HANDLING -->
  ${status === 'ERROR' ? `
  <div class="dl-stage-container">
    <div class="dl-error-box">
      <div class="dl-error-icon">⚠️</div>
      <div class="dl-error-title">බාගත කිරීම අසාර්ථක විය</div>
      <div class="dl-error-msg">${escapeHtml(options.errorMessage || 'නැවත උත්සාහ කරන්න හෝ නම/Link එක පරීක්ෂා කරන්න')}</div>
    </div>
  </div>
  ` : ''}

  <!-- BOTTOM FOOTER -->
  <div class="dl-footer">
    <span>💡 Ultra-Fast Cloud Engine</span>
    <span class="dl-footer-brand">YASHI HALLS ⚡</span>
  </div>
</div>
`;
}

/**
 * 60 Text Tools catalog exactly as seen in reference screenshots
 */
export const TEXT_TOOLS_CATALOG: CommandCardItem[] = [
  { name: 'UPPERTEXT', desc: 'Transform or analyze t..', capsule: '.uppertext' },
  { name: 'LOWERTEXT', desc: 'Transform or analyze t..', capsule: '.lowertext' },
  { name: 'TITLETEXT', desc: 'Transform or analyze t..', capsule: '.titletext' },
  { name: 'REVERSEWORDS', desc: 'Transform or analyze t..', capsule: '.reversewords' },
  { name: 'REVERSECHARS', desc: 'Transform or analyze t..', capsule: '.reversechars' },
  { name: 'TRIMTEXT', desc: 'Transform or analyze t..', capsule: '.trimtext' },
  { name: 'COUNTLETTERS', desc: 'Transform or analyze t..', capsule: '.countletters' },
  { name: 'COUNTWORDS', desc: 'Transform or analyze t..', capsule: '.countwords' },
  { name: 'COUNTLINES', desc: 'Transform or analyze t..', capsule: '.countlines' },
  { name: 'REMOVESPACES', desc: 'Delete every space fro..', capsule: '.removespaces' },
  { name: 'JSONMINIFY', desc: 'Format or organize tex..', capsule: '.jsonminify' },
  { name: 'SLUGIFY', desc: 'Convert text to kebab-..', capsule: '.slugify' },
  { name: 'CAMELCASE', desc: 'Convert text to camelCase', capsule: '.camelcase' },
  { name: 'KEBABCASE', desc: 'Convert text to kebab-..', capsule: '.kebabcase' },
  { name: 'SNAKECASE', desc: 'Convert text to snake_..', capsule: '.snakecase' },
  { name: 'HASHTAG', desc: 'Format or organize tex..', capsule: '.hashtag' },
  { name: 'INITIALS', desc: 'Build an acronym from ..', capsule: '.initials' },
  { name: 'WORDSHUFFLE', desc: 'Format or organize tex..', capsule: '.wordshuffle' },
  { name: 'SORTWORDS', desc: 'Format or organize tex..', capsule: '.sortwords' },
  { name: 'TITLECASE', desc: 'Capitalise The First L..', capsule: '.titlecase' },
  { name: 'SENTENCECASE', desc: 'Fix capitalisation sen..', capsule: '.sentencecase' },
  { name: 'TOGGLECASE', desc: 'Swap upper and lower case', capsule: '.togglecase' },
  { name: 'RANDOMCASE', desc: 'rAnDoM mOcKiNg CaSe', capsule: '.randomcase' },
  { name: 'PASCALCASE', desc: 'Convert text to Pascal..', capsule: '.pascalcase' },
  { name: 'CONSTCASE', desc: 'Convert text to CONSTA..', capsule: '.constcase' },
  { name: 'SORTLINES', desc: 'Sort every line alphab..', capsule: '.sortlines' },
  { name: 'DEDUPE', desc: 'Remove duplicate lines', capsule: '.dedupe' },
  { name: 'SHUFFLELINES', desc: 'Randomly shuffle the l..', capsule: '.shufflelines' },
  { name: 'NUMBERLINES', desc: 'Add a number to every ..', capsule: '.numberlines' },
  { name: 'REVERSELINE', desc: 'Reverse the order of t..', capsule: '.reverselines' },
  { name: 'CLEANTEXT', desc: 'Strip extra spaces and..', capsule: '.cleantext' },
  { name: 'SPACEOUT', desc: 'P u t  s p a c e  b..', capsule: '.spaceout' },
  { name: 'WRAPTEXT', desc: 'Wrap text at a given l..', capsule: '.wraptext' },
  { name: 'REPEAT', desc: 'Repeat text N times', capsule: '.repeat' },
  { name: 'EXTRACTURLS', desc: 'Pull every link out of..', capsule: '.extracturls' },
  { name: 'EXTRACTEMAILS', desc: 'Pull every e-mail addr..', capsule: '.extractemails' },
  { name: 'EXTRACTNUMBERS', desc: 'Pull every number out ..', capsule: '.extractnumbers' },
  { name: 'FINDREPLACE', desc: 'Find and replace insid..', capsule: '.findreplace' },
  { name: 'GREP', desc: 'Keep only the lines co..', capsule: '.grep' },
  { name: 'WORDFREQ', desc: 'Most frequently used w..', capsule: '.wordfreq' },
  { name: 'CHARFREQ', desc: 'Most frequently used l..', capsule: '.charfreq' },
  { name: 'READTIME', desc: 'Estimate how long a te..', capsule: '.readtime' },
  { name: 'PALINDROME', desc: 'Check whether a text i..', capsule: '.palindrome' },
  { name: 'ANAGRAM', desc: 'Check if two words are..', capsule: '.anagram' },
  { name: 'ACRONYM', desc: 'Build an acronym from ..', capsule: '.acronym' },
  { name: 'VOWELS', desc: 'Count vowels and conso..', capsule: '.vowels' },
  { name: 'ROT13', desc: 'Encode or decode ROT13', capsule: '.rot13' },
  { name: 'CAESAR', desc: 'Caesar cipher with a c..', capsule: '.caesar' },
  { name: 'ATBASH', desc: 'Atbash cipher (a<->z m..', capsule: '.atbash' },
  { name: 'LEETSPEAK', desc: 'Convert text to l33t s..', capsule: '.leetspeak' },
  { name: 'UPSIDEDOWN', desc: 'Flip text upside down', capsule: '.upsidedown' },
  { name: 'BUBBLETEXT', desc: 'Ⓑⓤⓑⓑⓛⓔ ⓣⓔⓧⓣ', capsule: '.bubbletext' },
  { name: 'SQUARETEXT', desc: '🅂🅀🅄🄰🅁🄴 🅃🄴🅇🅃', capsule: '.squaretext' },
  { name: 'FULLWIDTH', desc: 'ｆｕｌｌｗｉｄｔｈ', capsule: '.fullwidth' },
  { name: 'STRIKETHROUGH', desc: 'Cross out t..', capsule: '.strikethrough' },
  { name: 'UNDERLINETEXT', desc: 'Underline t..', capsule: '.underlinetext' },
  { name: 'ZALGO', desc: 'C̴u̴r̴s̴e̴d̴ glitch text', capsule: '.zalgo' },
  { name: 'CLAP', desc: 'Put 👏 between 👏 ever..', capsule: '.clap' },
  { name: 'EMOJIFY', desc: 'Turn text into emoji l..', capsule: '.emojify' },
  { name: 'LOREM', desc: 'Generate placeholder l..', capsule: '.lorem' },
];

/**
 * Downloads category catalog - 12 High Quality Commands
 */
export const DOWNLOADS_CATALOG: CommandCardItem[] = [
  { name: '📁 MEDIAFIRE', desc: 'Direct high-speed zip/rar download', capsule: '.mediafire' },
  { name: '🎵 TIKTOK HD', desc: 'Watermark-free full HD video', capsule: '.tiktok' },
  { name: '📘 FACEBOOK', desc: 'Full HD 1080p video downloader', capsule: '.fb' },
  { name: '📸 INSTAGRAM', desc: 'Reels, stories & carousel photos', capsule: '.ig' },
  { name: '🎧 YOUTUBE MP3', desc: 'Crystal clear 320kbps audio song', capsule: '.song' },
  { name: '🎬 YOUTUBE MP4', desc: 'High definition 1080p MP4 video', capsule: '.video' },
  { name: '🐦 TWITTER / X', desc: 'Direct HD video & animated GIF', capsule: '.twitter' },
  { name: '☁️ GOOGLE DRIVE', desc: 'Direct high-speed GDrive downloader', capsule: '.gdrive' },
  { name: '📱 APK DOWNLOAD', desc: 'Android pure APK package install', capsule: '.apk' },
  { name: '📌 PINTEREST', desc: 'High-resolution photo & board download', capsule: '.pinterest' },
  { name: '🟢 SPOTIFY TRACK', desc: 'Direct high quality Spotify music', capsule: '.spotify' },
  { name: '☁️ SOUNDCLOUD', desc: 'Direct high-bitrate audio stream', capsule: '.soundcloud' },
];

/**
 * AI tools category catalog - 10 Smart AI Tools
 */
export const AI_CATALOG: CommandCardItem[] = [
  { name: '🤖 GEMINI PRO', desc: 'Google Gemini 2.5 Flash / Pro AI', capsule: '.ai' },
  { name: '💬 SMART CHAT', desc: 'Multi-turn conversational smart AI', capsule: '.gemini' },
  { name: '❓ ASK QUESTION', desc: 'Instant factual answers & logic', capsule: '.ask' },
  { name: '💻 CODE WRITER', desc: 'Full-stack code generator & bug fixer', capsule: '.code' },
  { name: '📝 AI SUMMARIZE', desc: 'Bullet-point instant summary', capsule: '.summarize' },
  { name: '🌐 TRANSLATOR', desc: 'Sinhala, Tamil & 100+ languages', capsule: '.tr' },
  { name: '🎨 IMAGINE AI', desc: 'Photorealistic AI image generator', capsule: '.imagine' },
  { name: '✍️ GRAMMAR FIX', desc: 'Syntax check & professional phrasing', capsule: '.grammar' },
  { name: '📄 ESSAY WRITER', desc: 'Academic essays, speeches & letters', capsule: '.essay' },
  { name: '🎙️ AUDIO TO TEXT', desc: 'Voice note speech transcription', capsule: '.transcribe' },
];

/**
 * Movies category catalog - 8 Movie & Subtitle Tools
 */
export const MOVIES_CATALOG: CommandCardItem[] = [
  { name: '🎬 CINERU SEARCH', desc: 'Cineru.lk Sinhala subtitles & links', capsule: '.cineru' },
  { name: '⭐ MOVIE INFO', desc: 'IMDb rating, full plot, actors & director', capsule: '.movie' },
  { name: '🇱🇰 SINHALA DUBS', desc: 'Sinhala dubbed movies & animations', capsule: '.filmdub' },
  { name: '📄 SUBTITLE DL', desc: 'Direct .SRT Sinhala & English subs', capsule: '.subdl' },
  { name: '📺 TV SERIES', desc: 'Season bundles & episode downloads', capsule: '.series' },
  { name: '🔥 TRENDING', desc: 'Top box-office trending movies', capsule: '.trending' },
  { name: '⛩️ ANIME SEARCH', desc: 'Anime episodes, synopsis & air dates', capsule: '.anime' },
  { name: '🎥 TRAILERS', desc: 'Official HD YouTube movie trailers', capsule: '.trailer' },
];

/**
 * Music category catalog - 10 Audio & Music Tools
 */
export const MUSIC_CATALOG: CommandCardItem[] = [
  { name: '🎵 SONG MP3', desc: 'Ultra HQ 320kbps MP3 audio download', capsule: '.song' },
  { name: '▶️ PLAY VIDEO', desc: 'Instant YouTube music video download', capsule: '.play' },
  { name: '🔊 DIRECT AUDIO', desc: 'WhatsApp voice note audio format', capsule: '.audio' },
  { name: '🟢 SPOTIFY MUSIC', desc: 'Direct track & album download', capsule: '.spotify' },
  { name: '🔍 SHAZAM SONG', desc: 'Identify song from short audio sample', capsule: '.shazam' },
  { name: '📜 SONG LYRICS', desc: 'Complete verified lyrics with chords', capsule: '.lyrics' },
  { name: '🎧 8D BASS BOOST', desc: '8D surround sound bass-boosted audio', capsule: '.bass' },
  { name: '📈 TOP TRACKS', desc: 'Sri Lanka & Global trending hit tracks', capsule: '.toptracks' },
  { name: '🌙 SLOWED+REVERB', desc: 'Aesthetic chill remix audio stream', capsule: '.slowed' },
  { name: '🔔 RINGTONE', desc: 'Catchy 30-sec ringtone cut from song', capsule: '.ringtone' },
];

/**
 * Group tools category catalog - 14 Group Admin Tools
 */
export const GROUPS_CATALOG: CommandCardItem[] = [
  { name: '📢 TAG ALL', desc: 'Mention all group participants in 1-tap', capsule: '.tagall' },
  { name: '👻 GHOST TAG', desc: 'Invisible broadcast mention to all', capsule: '.hidetag' },
  { name: '⛔ KICK USER', desc: 'Remove participant from group chat', capsule: '.kick' },
  { name: '➕ ADD USER', desc: 'Add phone number directly to group', capsule: '.add' },
  { name: '⭐ PROMOTE ADMIN', desc: 'Make participant a group administrator', capsule: '.promote' },
  { name: '⬇️ DEMOTE ADMIN', desc: 'Revoke group administrator status', capsule: '.demote' },
  { name: '🚨 ANTI-DELETE', desc: 'Monitor & recover deleted messages', capsule: '.antidelete' },
  { name: '👁️ ANTI VIEW-ONCE', desc: 'Capture 1-time view photos & videos', capsule: '.antiviewonce' },
  { name: '👋 WELCOME BANNER', desc: 'Custom welcome message on join', capsule: '.welcome' },
  { name: '🚪 GOODBYE BANNER', desc: 'Farewell alert when members leave', capsule: '.goodbye' },
  { name: '🛡️ ANTI BAD WORDS', desc: 'Filter toxic insults & auto-warn', capsule: '.antibadword' },
  { name: '🤖 AI CHATBOT', desc: 'Gemini automated group conversation', capsule: '.chatbot' },
  { name: '🔗 INVITE LINK', desc: 'Fetch current group invitation link', capsule: '.link' },
  { name: '🔄 REVOKE LINK', desc: 'Reset & invalidate old invite link', capsule: '.revoke' },
  { name: '🔇 MUTE GROUP', desc: 'Admins-only messaging mode', capsule: '.mute' },
  { name: '🔊 UNMUTE GROUP', desc: 'All participants can send messages', capsule: '.unmute' },
  { name: '⚠️ WARN USER', desc: 'Issue official strike to member', capsule: '.warn' },
  { name: '🛡️ ANTI-LINK', desc: 'Auto-kick spam links & link sharers', capsule: '.antilink' },
];

/**
 * Games category catalog - 10 Games & Fun Tools
 */
export const GAMES_CATALOG: CommandCardItem[] = [
  { name: '⭕ TIC TAC TOE', desc: 'Interactive 2-player grid game in chat', capsule: '.tictactoe' },
  { name: '🧠 TRIVIA QUIZ', desc: 'Multiple-choice general knowledge quiz', capsule: '.quiz' },
  { name: '🎰 SLOT MACHINE', desc: 'Casino lucky 777 jackpot spinner', capsule: '.slot' },
  { name: '🎲 ROLL DICE', desc: 'Random 6-sided dice roll with odds', capsule: '.roll' },
  { name: '🪙 FLIP COIN', desc: 'Heads or Tails coin toss generator', capsule: '.flip' },
  { name: '😂 DAD JOKE', desc: 'Hilarious clean joke of the day', capsule: '.joke' },
  { name: '💡 FUN FACT', desc: 'Mind-blowing real science & world facts', capsule: '.fact' },
  { name: '❤️ LOVE TESTER', desc: 'Calculate compatibility score %', capsule: '.lovecalc' },
  { name: '🔮 MAGIC 8-BALL', desc: 'Ask a question for mystical fortunes', capsule: '.8ball' },
  { name: '🔥 ROAST USER', desc: 'Savage & hilarious roast generator', capsule: '.roast' },
];

/**
 * Utilities & Converters category catalog - 10 Tools
 */
export const UTILITIES_CATALOG: CommandCardItem[] = [
  { name: '🔢 MATH CALC', desc: 'Instant arithmetic, algebra & formulas', capsule: '.calc' },
  { name: '📊 PERCENTAGE', desc: 'Calculate discount, markup & %', capsule: '.percent' },
  { name: '⚖️ BMI CALCULATE', desc: 'Body Mass Index & fitness category', capsule: '.bmi' },
  { name: '💱 CURRENCY FX', desc: 'Real-time USD, LKR, EUR forex rates', capsule: '.currency' },
  { name: '🌡️ TEMP CONVERT', desc: 'Celsius to Fahrenheit converter', capsule: '.c2f' },
  { name: '📏 KM TO MILES', desc: 'Distance unit converter (km/miles)', capsule: '.km2miles' },
  { name: '🏋️ KG TO LBS', desc: 'Mass converter (kg/pounds)', capsule: '.kg2lbs' },
  { name: '💾 DATA SIZE', desc: 'Storage converter (MB <-> GB <-> TB)', capsule: '.mb2gb' },
  { name: '🔐 PASS GENERATOR', desc: 'Generate military-grade strong password', capsule: '.passgen' },
  { name: '🆔 UUID V4', desc: 'Generate cryptographic UUID token', capsule: '.uuid' },
];

/**
 * Search category catalog - 8 Search Tools
 */
export const SEARCH_CATALOG: CommandCardItem[] = [
  { name: '📖 DICTIONARY', desc: 'English word meanings & definitions', capsule: '.define' },
  { name: '🛹 URBAN SLANG', desc: 'Modern street slang & memes dictionary', capsule: '.urban' },
  { name: '🌐 IP LOOKUP', desc: 'IP address geolocation & ISP info', capsule: '.ipinfo' },
  { name: '🥇 GOLD RATES', desc: 'Sri Lanka 22k & 24k gold gram prices', capsule: '.gold' },
  { name: '⛅ WEATHER', desc: 'Current temperature, humidity & rain', capsule: '.weather' },
  { name: '📚 WIKIPEDIA', desc: 'Encyclopedia summary of any topic', capsule: '.wiki' },
  { name: '🔍 GOOGLE SEARCH', desc: 'Top search result links & snippets', capsule: '.google' },
  { name: '🪙 CRYPTO RATES', desc: 'Bitcoin, Ethereum & USDT real-time', capsule: '.crypto' },
];

/**
 * System tools category catalog - 8 System Tools
 */
export const SYSTEM_CATALOG: CommandCardItem[] = [
  { name: '⚡ SPEED PING', desc: 'Measure server response speed latency', capsule: '.ping' },
  { name: '🟢 ALIVE STATUS', desc: 'Bot uptime, RAM usage & status report', capsule: '.alive' },
  { name: '🤖 BOT DETAILS', desc: 'Engine versions, platform & system info', capsule: '.botinfo' },
  { name: '⏱️ UPTIME STATS', desc: 'Continuous 24/7 uptime counter', capsule: '.uptime' },
  { name: '🩺 HEALTH CHECK', desc: 'Real-time node health & socket check', capsule: '.status' },
  { name: '🔄 RESTART ENGINE', desc: 'Safe reload & socket reconnect', capsule: '.restart' },
  { name: '🎫 DAILY QUOTAS', desc: 'Check daily free commands & coins', capsule: '.quota' },
  { name: '👑 OWNER CONTACT', desc: 'Direct owner contact & WhatsApp channel', capsule: '.owner' },
];

/**
 * Sri Lanka Local Services Catalog - 8 Tools
 */
export const SL_SERVICES_CATALOG: CommandCardItem[] = [
  { name: '🇱🇰 BREAKING NEWS', desc: 'Ada Derana & Hiru live headlines', capsule: '.news' },
  { name: '🚆 TRAIN SCHEDULE', desc: 'Railway timetable Fort, Kandy, Galle', capsule: '.train' },
  { name: '⛽ FUEL PRICES', desc: 'Ceypetco & LIOC petrol & diesel rates', capsule: '.fuel' },
  { name: '⚡ CEB BILL CALC', desc: 'Electricity tariff & units estimate', capsule: '.ceb' },
  { name: '🥇 GOLD SOVEREIGN', desc: '24K & 22K Sri Lanka pawn rates', capsule: '.goldrate' },
  { name: '🚌 HIGHWAY BUS', desc: 'Expressway Makumbura, Kadawatha, Galle', capsule: '.bus' },
  { name: '📝 PAST PAPERS', desc: 'A/L & O/L exam papers & schemes', capsule: '.pastpapers' },
  { name: '🏖️ PUBLIC HOLIDAYS', desc: 'Sri Lanka mercantile & poya calendar', capsule: '.slholiday' },
];

/**
 * Sticker & Photo Studio Catalog - 8 Tools
 */
export const STICKER_CATALOG: CommandCardItem[] = [
  { name: '🖼️ CREATE STICKER', desc: 'Convert image or video to sticker', capsule: '.sticker' },
  { name: '🏷️ STICKER STEALER', desc: 'Rebrand pack name & author info', capsule: '.take' },
  { name: '🔮 EMOJI KITCHEN', desc: 'Blend 2 emojis into custom sticker', capsule: '.emojimix' },
  { name: '📸 STICKER TO PHOTO', desc: 'Extract JPG photo from sticker', capsule: '.toimg' },
  { name: '🎥 STICKER TO VIDEO', desc: 'Extract animated sticker to MP4', capsule: '.tovideo' },
  { name: '✂️ REMOVE BG', desc: 'Instant AI transparent cutouts', capsule: '.removebg' },
  { name: '💎 HD ENHANCER', desc: 'AI 4K photo restoration & upscale', capsule: '.hd' },
  { name: '✨ NEON TEXT STICKER', desc: 'Animated glowing rainbow sticker', capsule: '.attp' },
];

/**
 * Audio FX & DJ Catalog - 6 Tools
 */
export const AUDIO_FX_CATALOG: CommandCardItem[] = [
  { name: '🌌 SLOWED + REVERB', desc: 'Aesthetic chill lofi ambient reverb', capsule: '.slowed' },
  { name: '⚡ NIGHTCORE', desc: 'Sped-up pitch & boosted tempo beats', capsule: '.nightcore' },
  { name: '🔊 BASS BOOST', desc: 'Subwoofer heavy bass equalizer', capsule: '.bass' },
  { name: '🎤 VOCAL REMOVER', desc: 'Split vocals & karaoke instrumental', capsule: '.vocalremover' },
  { name: '⏪ REVERSE AUDIO', desc: 'Backward audio playback effect', capsule: '.reverse' },
  { name: '🤖 ROBOT VOCODER', desc: 'Electronic metallic vocoder filter', capsule: '.robot' },
];

/**
 * Astrology & Fun Catalog - 8 Tools
 */
export const ASTROLOGY_FUN_CATALOG: CommandCardItem[] = [
  { name: '🪐 LAGNA PALAPALA', desc: 'Daily Sinhala horoscope for 12 signs', capsule: '.lagna' },
  { name: '💘 LOVE MATCH', desc: 'True compatibility percentage calculator', capsule: '.love' },
  { name: '🔥 TRUTH OR DARE', desc: 'Party dare challenge generator', capsule: '.dare' },
  { name: '🗣️ TRUTH QUESTION', desc: 'Deep reveal party question', capsule: '.truth' },
  { name: '🧞 AKINATOR GENIE', desc: 'Guess the character in your mind', capsule: '.akinator' },
  { name: '🎭 SINHALA MEMES', desc: 'Trending FB & TikTok viral memes', capsule: '.sinhalameme' },
  { name: '😂 COMEDY JOKES', desc: 'Hilarious Sinhala & English jokes', capsule: '.joke' },
  { name: '💭 DAILY QUOTE', desc: 'Inspirational motivational quote', capsule: '.quote' },
];

/**
 * Tech & Web Suite Catalog - 6 Tools
 */
export const TECH_WEB_CATALOG: CommandCardItem[] = [
  { name: '📬 TEMP EMAIL', desc: 'Disposable inbox & OTP code receiver', capsule: '.tempmail' },
  { name: '🔗 URL SHORTENER', desc: 'TinyURL quick link generator', capsule: '.shorturl' },
  { name: '🖥️ WEB SCREENSHOT', desc: 'Full webpage preview snapshot', capsule: '.ssweb' },
  { name: '🪙 CRYPTO BINANCE', desc: 'Live BTC, ETH & USDT to LKR rates', capsule: '.crypto' },
  { name: '🌐 DOMAIN WHOIS', desc: 'Domain registration & nameservers', capsule: '.whois' },
  { name: '📶 SPEED BENCHMARK', desc: 'Server bandwidth & latency test', capsule: '.speedtest' },
];

export const YASHI_HALLS_DEFAULT_LOGO_BASE64 = EMBEDDED_BRAND_LOGO_BASE64;

/**
 * Generates the YASHI HALLS Premium Download HTML Menu App.
 * Matches user specified dark purple/black neon design (#090510, #1a0c29, #7136a5)
 * with embedded logo, 12 commands, copy buttons, clipboard fallback & toast.
 */
export function generateDownloadMenuHtml(options: {
  botName?: string;
  prefix?: string;
  logoUrl?: string;
} = {}): string {
  const p = options.prefix || '.';
  const botName = (options.botName || 'YASHI HALLS').toUpperCase();
  const logoSrc = options.logoUrl || YASHI_HALLS_DEFAULT_LOGO_BASE64;

  return `<style>
* { box-sizing: border-box; }
.dl-menu-root {
  padding: 10px 8px 16px;
  background: #090510;
  color: white;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.menu {
  max-width: 420px;
  margin: auto;
  padding: 14px;
  border: 1px solid #7136a5;
  border-radius: 18px;
  background: linear-gradient(145deg,#1a0c29,#090510);
  box-shadow: 0 0 20px #8425c944;
}
.header {
  text-align: center;
  padding: 4px 0 12px;
}
.logo {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid #c084fc;
  box-shadow: 0 0 16px #a855f7;
  object-fit: cover;
}
.brand {
  font-size: 20px;
  font-weight: 900;
  color: #e9c5ff;
  margin-top: 8px;
  letter-spacing: 1.5px;
  text-shadow: 0 0 10px #a855f7;
}
.subtitle {
  color: #b78bd5;
  font-size: 10.5px;
  margin-top: 3px;
  font-weight: 700;
  letter-spacing: 0.8px;
}
.online {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 20px;
  background: #153321;
  color: #55f59b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  border: 1px solid #22c55e44;
}
.heading {
  color: #e8c8ff;
  font-size: 12px;
  font-weight: 800;
  margin: 10px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #583276;
  letter-spacing: 0.8px;
}
.command-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.command {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 11px;
  background: #241631;
  border: 1px solid #49305f;
  border-radius: 11px;
}
.command:active {
  border-color: #c084fc;
}
.name {
  font-weight: 800;
  font-size: 11.5px;
  color: #f0dcff;
}
.code {
  color: #c99bf5;
  font-size: 10.5px;
  margin-top: 2px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
.copy {
  border: 0;
  border-radius: 7px;
  padding: 7px 11px;
  color: white;
  font-weight: 900;
  background: linear-gradient(135deg,#9333ea,#6b21a8);
  font-size: 10px;
  flex-shrink: 0;
  cursor: pointer;
  letter-spacing: 0.8px;
  box-shadow: 0 0 8px #9333ea44;
}
.copy:active {
  background: #a855f7;
}
.back {
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 11px;
  border-radius: 11px;
  border: 1px solid #a855f7;
  background: #35194d;
  color: white;
  font-size: 11.5px;
  font-weight: 900;
  cursor: pointer;
  text-align: center;
  letter-spacing: 0.8px;
}
.footer {
  text-align: center;
  color: #a887bd;
  font-size: 9px;
  margin-top: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
}
#toast {
  display: none;
  text-align: center;
  background: #173d2a;
  color: #69ffad;
  border-radius: 10px;
  padding: 7px;
  margin-top: 8px;
  font-size: 11px;
  font-weight: 800;
  border: 1px solid #22c55e55;
}
</style>

<div class="dl-menu-root">
<div class="menu">
  <div class="header">
    <img class="logo" src="${logoSrc}" alt="${botName}" onerror="this.style.display='none'">
    <div class="brand">${botName}</div>
    <div class="subtitle">MINI BOT • DOWNLOAD MENU</div>
    <div class="online">● ONLINE</div>
  </div>

  <div class="heading">📥 DOWNLOAD COMMANDS</div>

  <div class="command-list">
    <div class="command">
      <div>
        <div class="name">🎵 SONG</div>
        <div class="code">${p}song &lt;title&gt;</div>
      </div>
      <button class="copy" data-copy="${p}song ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">🎬 VIDEO</div>
        <div class="code">${p}video &lt;title&gt;</div>
      </div>
      <button class="copy" data-copy="${p}video ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">▶️ PLAY</div>
        <div class="code">${p}play &lt;title&gt;</div>
      </div>
      <button class="copy" data-copy="${p}play ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">🔊 AUDIO</div>
        <div class="code">${p}audio &lt;title&gt;</div>
      </div>
      <button class="copy" data-copy="${p}audio ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">🔎 YTSEARCH</div>
        <div class="code">${p}ytsearch &lt;query&gt;</div>
      </div>
      <button class="copy" data-copy="${p}ytsearch ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">📁 MEDIAFIRE</div>
        <div class="code">${p}mf &lt;url&gt;</div>
      </div>
      <button class="copy" data-copy="${p}mf ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">🎵 TIKTOK</div>
        <div class="code">${p}tt &lt;url&gt;</div>
      </div>
      <button class="copy" data-copy="${p}tt ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">📘 FACEBOOK</div>
        <div class="code">${p}fb &lt;url&gt;</div>
      </div>
      <button class="copy" data-copy="${p}fb ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">📸 INSTAGRAM</div>
        <div class="code">${p}ig &lt;url&gt;</div>
      </div>
      <button class="copy" data-copy="${p}ig ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">🐦 TWITTER / X</div>
        <div class="code">${p}twitter &lt;url&gt;</div>
      </div>
      <button class="copy" data-copy="${p}twitter ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">📦 APK</div>
        <div class="code">${p}apk &lt;app&gt;</div>
      </div>
      <button class="copy" data-copy="${p}apk ">COPY</button>
    </div>

    <div class="command">
      <div>
        <div class="name">🎤 LYRICS</div>
        <div class="code">${p}lyrics &lt;song&gt;</div>
      </div>
      <button class="copy" data-copy="${p}lyrics ">COPY</button>
    </div>
  </div>

  <div id="toast">✓ COMMAND COPIED!</div>

  <button class="back" id="backButton">
    ↩ BACK TO PANEL
  </button>

  <div class="footer">
    ⚡ POWERED BY YASHI HALLS ⚡
  </div>
</div>
</div>

<script>
(function() {
  const toast = document.getElementById("toast");
  document.querySelectorAll(".copy").forEach(button => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy;
      let copied = false;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
          copied = true;
        }
      } catch (e) {}

      if (!copied) {
        try {
          const ta = document.createElement("textarea");
          ta.value = value;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          copied = true;
        } catch (e) {}
      }

      if (toast) {
        toast.textContent = copied ? "✓ COMMAND COPIED!" : "Select command text to copy";
        toast.style.display = "block";
        setTimeout(() => { toast.style.display = "none"; }, 1800);
      }
    });
  });

  const backBtn = document.getElementById("backButton");
  if (backBtn && toast) {
    backBtn.addEventListener("click", () => {
      toast.textContent = "Tap ↩ BACK TO PANEL button below";
      toast.style.display = "block";
      setTimeout(() => { toast.style.display = "none"; }, 2000);
    });
  }
})();
</script>`;
}

/**
 * Generates the In-Chat Submenu HTML App matching the user's reference screenshots.
 * 
 * Specs:
 * - Dark purple background: #0e0719
 * - Glowing animated top gear/spark icon
 * - Uppercase Bold Header (e.g. TEXT TOOLS MENU)
 * - Subtitle: Tap to copy!
 * - 2-Column Grid of command cards
 * - Monospace capsule badge (.uppertext)
 * - Click-to-copy with animated toast feedback
 * - Footer branding: YASHI HALLS X MINI
 */
export function generateCategorySubmenuHtml(options: {
  title: string;
  cards: CommandCardItem[];
  botName?: string;
  prefix?: string;
  height?: number;
}): string {
  const botName = (options.botName || 'YASHI HALLS').toUpperCase();
  const title = options.title.toUpperCase();
  const height = options.height || 560;
  const p = options.prefix || '.';

  const cardsHtml = options.cards
    .map((item) => {
      // Ensure command has current prefix
      const cmd = item.capsule.startsWith('.')
        ? `${p}${item.capsule.slice(1)}`
        : item.capsule.startsWith(p)
        ? item.capsule
        : `${p}${item.capsule}`;

      return `
    <div class="cmd-card" onclick="copyCmd('${cmd}', this)">
      <div class="cmd-title">${escapeHtml(item.name)}</div>
      <div class="cmd-desc">${escapeHtml(item.desc)}</div>
      <div class="cmd-capsule">${escapeHtml(cmd)}</div>
    </div>`;
    })
    .join('\n');

  return `
<style>
  @keyframes spinGlow {
    0% { transform: rotate(0deg); filter: drop-shadow(0 0 3px #a855f7); }
    50% { filter: drop-shadow(0 0 8px #d946ef); }
    100% { transform: rotate(360deg); filter: drop-shadow(0 0 3px #a855f7); }
  }
  @keyframes toastPop {
    0% { opacity: 0; transform: translate(-50%, -8px) scale(0.9); }
    15% { opacity: 1; transform: translate(-50%, 0) scale(1); }
    85% { opacity: 1; transform: translate(-50%, 0) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -10px) scale(0.95); }
  }
  .app-container {
    box-sizing: border-box;
    width: 100%;
    height: ${height}px;
    max-height: ${height}px;
    background: #0e0719;
    color: #f8fafc;
    padding: 14px 10px 18px 10px;
    border: 1px solid rgba(168, 85, 247, 0.35);
    border-radius: 14px;
    position: relative;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    box-shadow: inset 0 0 16px rgba(147, 51, 234, 0.2);
  }
  .top-icon-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 6px;
  }
  .top-icon-svg {
    width: 30px;
    height: 30px;
    animation: spinGlow 9s linear infinite;
  }
  .menu-title {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #e9d5ff;
    text-align: center;
    margin: 0 0 3px 0;
    text-shadow: 0 0 10px rgba(192, 132, 252, 0.55);
  }
  .menu-subtitle {
    font-size: 11px;
    font-weight: 600;
    color: #a855f7;
    text-align: center;
    margin: 0 0 12px 0;
  }
  .cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 2px;
  }
  .cmd-card {
    background: #1e1035;
    border: 1px solid #581c87;
    border-radius: 10px;
    padding: 9px 6px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.1s ease, border-color 0.15s ease, background 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .cmd-card:active {
    background: #2b144b;
    border-color: #d946ef;
    transform: scale(0.96);
  }
  .cmd-title {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: #f8fafc;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cmd-desc {
    font-size: 8.5px;
    color: #a855f7;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cmd-capsule {
    display: inline-block;
    background: #0f071d;
    border: 1px solid #7c3aed;
    color: #c084fc;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    border-radius: 6px;
    padding: 2.5px 8px;
    font-size: 10px;
    font-weight: 600;
  }
  .menu-footer {
    text-align: center;
    font-size: 9.5px;
    letter-spacing: 1.5px;
    color: #7c3aed;
    margin-top: 14px;
    margin-bottom: 4px;
    font-weight: 700;
    text-transform: uppercase;
  }
  #toast {
    display: none;
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: #2e1065;
    border: 1px solid #d946ef;
    box-shadow: 0 0 15px rgba(217, 70, 239, 0.55);
    color: #fae8ff;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    z-index: 9999;
    pointer-events: none;
    white-space: nowrap;
  }
</style>

<div class="app-container" id="container">
  <!-- Toast alert -->
  <div id="toast">Copied!</div>
  <textarea id="clipSink" style="position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;"></textarea>

  <!-- Top Animated Icon -->
  <div class="top-icon-wrap">
    <svg class="top-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#d8b4fe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  </div>

  <!-- Header Title & Subtitle -->
  <div class="menu-title">${escapeHtml(title)}</div>
  <div class="menu-subtitle">Tap to copy!</div>

  <!-- 2-Column Command Cards Grid -->
  <div class="cards-grid">
    ${cardsHtml}
  </div>

  <!-- Footer Branding -->
  <div class="menu-footer">${escapeHtml(botName)} X MINI</div>
</div>

<script>
  var toastTimer = null;

  function showToast(text) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.innerText = text;
    t.style.display = 'block';
    t.style.animation = 'none';
    void t.offsetHeight; // force reflow
    t.style.animation = 'toastPop 1.6s ease forwards';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      t.style.display = 'none';
    }, 1600);
  }

  function copyCmd(cmd, el) {
    if (el) {
      el.style.borderColor = '#d946ef';
      el.style.background = '#2b144b';
      setTimeout(function() {
        el.style.borderColor = '#581c87';
        el.style.background = '#1e1035';
      }, 300);
    }

    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd).then(function() {
        showToast('Copied: ' + cmd + '!');
      }).catch(function() {
        fallbackCopy(cmd);
      });
    } else {
      fallbackCopy(cmd);
    }
  }

  function fallbackCopy(cmd) {
    try {
      var sink = document.getElementById('clipSink');
      if (sink) {
        sink.value = cmd;
        sink.select();
        sink.setSelectionRange(0, 99999);
        var success = document.execCommand('copy');
        showToast(success ? ('Copied: ' + cmd + '!') : ('Command: ' + cmd));
      } else {
        showToast('Command: ' + cmd);
      }
    } catch(e) {
      showToast('Command: ' + cmd);
    }
  }
</script>
`;
}


/**
 * Master In-Chat Interactive Android HTML App Menu
 * Renders complete Multi-Category Animated In-Chat Applet with Tab Switching & 1-Tap Copy
 */
export function generateMasterInteractiveMenuHtml(data: {
  botName?: string;
  prefix?: string;
  plan?: string;
  ownerNumber?: string;
  uptime?: string;
  logoUrl?: string;
  headerBgUrl?: string;
  initialTab?: string;
  height?: number;
} = {}): string {
  const p = data.prefix || '.';
  const botName = (data.botName || 'YASHI HALLS MINI').toUpperCase();
  const plan = (data.plan || 'MINI PLAN').toUpperCase();
  const height = data.height || 980;
  const logoSrc = (data.logoUrl && !data.logoUrl.includes('ibb.co')) ? data.logoUrl : EMBEDDED_BRAND_LOGO_BASE64;
  const headerBgSrc = (data.headerBgUrl && !data.headerBgUrl.includes('ibb.co')) ? data.headerBgUrl : EMBEDDED_HEADER_BG_BASE64;
  const initTab = (data.initialTab || 'hub').toLowerCase();

  const categoriesData: Record<string, { name: string; icon: string; shortLabel: string; desc: string; cards: CommandCardItem[] }> = {
    sl: {
      name: '🇱🇰 Sri Lanka Services',
      icon: '🇱🇰',
      shortLabel: 'SL Services',
      desc: 'Ada Derana, Trains, Fuel Rates, CEB & Buses',
      cards: SL_SERVICES_CATALOG
    },
    stickers: {
      name: '🎨 Sticker & Media Studio',
      icon: '🎨',
      shortLabel: 'Stickers',
      desc: 'Sticker Maker, Stealer, Emojimix & HD Enhancer',
      cards: STICKER_CATALOG
    },
    downloads: {
      name: '📥 Downloads',
      icon: '📥',
      shortLabel: 'Downloads',
      desc: 'Music, Videos & Social Media HD Downloaders',
      cards: DOWNLOADS_CATALOG
    },
    ai: {
      name: '🤖 AI Tools',
      icon: '🤖',
      shortLabel: 'AI Tools',
      desc: 'Gemini 2.5 Flash, Code Generator & Smart Chat',
      cards: AI_CATALOG
    },
    movies: {
      name: '🎬 Movies & TV',
      icon: '🎬',
      shortLabel: 'Movies & TV',
      desc: 'Cineru.lk Subtitles, Series & Film Dubs',
      cards: MOVIES_CATALOG
    },
    music: {
      name: '🎵 Music & Audio',
      icon: '🎵',
      shortLabel: 'Music & Audio',
      desc: 'Ultra HQ 320kbps MP3, Spotify & Lyrics',
      cards: MUSIC_CATALOG
    },
    audiofx: {
      name: '🎧 Audio FX & DJ Tools',
      icon: '🎧',
      shortLabel: 'Audio FX',
      desc: 'Slowed + Reverb, Nightcore, Bass & Vocal Remover',
      cards: AUDIO_FX_CATALOG
    },
    group: {
      name: '👥 Group Admin & Security',
      icon: '👥',
      shortLabel: 'Group Admin',
      desc: 'Tagall, Anti-delete, Anti-viewonce, Welcome & Chatbot',
      cards: GROUPS_CATALOG
    },
    games: {
      name: '🎮 Games & Entertainment',
      icon: '🎮',
      shortLabel: 'Games & Fun',
      desc: 'Tic-Tac-Toe, Trivia Quiz, Slot Machine & Jokes',
      cards: GAMES_CATALOG
    },
    astro: {
      name: '🔮 Astrology & Party Fun',
      icon: '🔮',
      shortLabel: 'Astro & Fun',
      desc: 'Daily Lagna Palapala, Love Compatibility & Akinator',
      cards: ASTROLOGY_FUN_CATALOG
    },
    tech: {
      name: '⚡ Tech & Crypto Suite',
      icon: '⚡',
      shortLabel: 'Tech & Crypto',
      desc: 'Temp Email, URL Shortener, Web Screenshot & Binance',
      cards: TECH_WEB_CATALOG
    },
    utilities: {
      name: '🧮 Utilities',
      icon: '🧮',
      shortLabel: 'Utilities',
      desc: 'Scientific Calculators, Forex & Converters',
      cards: UTILITIES_CATALOG
    },
    text: {
      name: '🛠️ Text Tools',
      icon: '🛠️',
      shortLabel: 'Text Tools',
      desc: 'Text Manipulation, Ciphers & Fonts',
      cards: TEXT_TOOLS_CATALOG.slice(0, 24)
    },
    search: {
      name: '🔎 Search & Info',
      icon: '🔎',
      shortLabel: 'Search & Info',
      desc: 'Dictionary, Urban, IP Info & Gold Rates',
      cards: SEARCH_CATALOG
    },
    system: {
      name: '⚙️ System',
      icon: '⚙️',
      shortLabel: 'System Info',
      desc: 'Speed Benchmark, Telemetry & Controls',
      cards: SYSTEM_CATALOG
    }
  };

  const categoriesJson = JSON.stringify(categoriesData).replace(/</g, '\\u003c');

  return `
<style>
  @keyframes cyberAura {
    0% {
      border-color: #8b5cf6;
      box-shadow: 0 8px 30px rgba(0,0,0,0.8), 0 0 18px rgba(139, 92, 246, 0.4), inset 0 0 25px rgba(139, 92, 246, 0.25);
    }
    33% {
      border-color: #38bdf8;
      box-shadow: 0 8px 32px rgba(0,0,0,0.85), 0 0 24px rgba(56, 189, 248, 0.5), inset 0 0 25px rgba(56, 189, 248, 0.3);
    }
    66% {
      border-color: #ec4899;
      box-shadow: 0 8px 32px rgba(0,0,0,0.85), 0 0 22px rgba(236, 72, 153, 0.45), inset 0 0 25px rgba(236, 72, 153, 0.25);
    }
    100% {
      border-color: #8b5cf6;
      box-shadow: 0 8px 30px rgba(0,0,0,0.8), 0 0 18px rgba(139, 92, 246, 0.4), inset 0 0 25px rgba(139, 92, 246, 0.25);
    }
  }
  @keyframes logoPulse {
    0%, 100% {
      transform: translateY(0) scale(1);
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.7), 0 0 32px rgba(168, 85, 247, 0.35);
      border-color: #38bdf8;
    }
    50% {
      transform: translateY(-3px) scale(1.04);
      box-shadow: 0 0 26px rgba(168, 85, 247, 0.85), 0 0 45px rgba(56, 189, 248, 0.55);
      border-color: #c084fc;
    }
  }
  @keyframes titleShine {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes radarRipple {
    0% {
      transform: scale(0.9);
      box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.85);
    }
    70% {
      transform: scale(1.15);
      box-shadow: 0 0 0 8px rgba(74, 222, 128, 0);
    }
    100% {
      transform: scale(0.9);
      box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
    }
  }
  @keyframes activePillPulse {
    0%, 100% {
      box-shadow: 0 0 12px rgba(168, 85, 247, 0.7);
      border-color: #38bdf8;
    }
    50% {
      box-shadow: 0 0 22px rgba(56, 189, 248, 0.9), 0 0 35px rgba(168, 85, 247, 0.5);
      border-color: #c084fc;
    }
  }
  @keyframes cardEntrance {
    0% {
      opacity: 0;
      transform: translateY(18px) scale(0.94);
    }
    70% {
      opacity: 1;
      transform: translateY(-2px) scale(1.01);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  @keyframes footerGlow {
    0%, 100% {
      opacity: 0.85;
      text-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
    }
    50% {
      opacity: 1;
      text-shadow: 0 0 16px rgba(56, 189, 248, 0.85), 0 0 24px rgba(168, 85, 247, 0.7);
    }
  }
  @keyframes toastPop {
    0% { opacity: 0; transform: translate(-50%, -15px) scale(0.85); }
    18% { opacity: 1; transform: translate(-50%, 0) scale(1.05); }
    26% { transform: translate(-50%, 0) scale(1); }
    80% { opacity: 1; transform: translate(-50%, 0) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -12px) scale(0.9); }
  }
  .app-master {
    box-sizing: border-box;
    width: 100%;
    height: ${height}px;
    max-height: ${height}px;
    min-height: 480px;
    background: linear-gradient(180deg, #0e051d 0%, #16082b 30%, #0a0314 100%);
    color: #f8fafc;
    padding: 12px 10px 14px 10px;
    border: 2px solid #8b5cf6;
    border-radius: 18px;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    overscroll-behavior-y: contain;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: #a855f7 rgba(15, 6, 30, 0.5);
    box-shadow: 0 8px 30px rgba(0,0,0,0.7), inset 0 0 25px rgba(139, 92, 246, 0.25);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    animation: cyberAura 6s ease-in-out infinite;
  }
  .app-master::-webkit-scrollbar {
    width: 5px;
  }
  .app-master::-webkit-scrollbar-track {
    background: rgba(14, 5, 29, 0.6);
    border-radius: 6px;
  }
  .app-master::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #a855f7, #38bdf8);
    border-radius: 6px;
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
  }
  .header-card {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(14, 5, 29, 0.70) 0%, rgba(22, 8, 43, 0.88) 100%), url('${headerBgSrc}') center/cover no-repeat;
    border: 1.5px solid #a855f7;
    border-radius: 14px;
    padding: 12px 8px 10px 8px;
    text-align: center;
    margin-bottom: 7px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.65), inset 0 0 20px rgba(139, 92, 246, 0.25);
  }
  .header-logo {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid #38bdf8;
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.75), 0 0 30px rgba(168, 85, 247, 0.45);
    object-fit: cover;
    margin: 0 auto 6px auto;
    display: block;
    background: #110624;
    animation: logoPulse 3.5s ease-in-out infinite;
  }
  .header-brand {
    font-size: 17.5px;
    font-weight: 900;
    letter-spacing: 0.8px;
    background: linear-gradient(90deg, #ffffff 0%, #f3e8ff 25%, #38bdf8 50%, #f3e8ff 75%, #ffffff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: titleShine 3.5s linear infinite;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(192, 132, 252, 0.75));
  }
  .header-sub {
    font-size: 10.5px;
    color: #e9d5ff;
    font-weight: 800;
    margin-top: 2px;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.95);
  }
  .header-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #0d281a;
    border: 1.5px solid #22c55e;
    color: #4ade80;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 9.5px;
    font-weight: 800;
    margin-top: 5px;
    letter-spacing: 0.6px;
  }
  .dot-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: radarRipple 1.6s ease-out infinite;
  }
  .stats-row {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    margin: 5px 0 7px 0;
  }
  .stat-badge {
    flex: 1;
    background: #1c0a34;
    border: 1.5px solid #581c87;
    border-radius: 8px;
    padding: 5px 3px;
    text-align: center;
  }
  .stat-num {
    font-size: 12px;
    font-weight: 900;
    color: #ffffff;
  }
  .stat-lbl {
    font-size: 8px;
    color: #c084fc;
    margin-top: 1px;
    font-weight: 800;
    text-transform: uppercase;
  }
  /* Category Hub Grid (App Drawer View) */
  .hub-container {
    margin: 2px 0 8px 0;
  }
  .hub-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 4px 2px 7px 2px;
  }
  .hub-title {
    font-size: 11.5px;
    font-weight: 900;
    color: #f3e8ff;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    text-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
  }
  .hub-subtitle {
    font-size: 9px;
    color: #38bdf8;
    font-weight: 800;
    letter-spacing: 0.5px;
  }
  .hub-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 0 1px;
  }
  .hub-tile {
    position: relative;
    overflow: hidden;
    background: linear-gradient(145deg, #270f4a, #130628);
    border: 1.5px solid #8b5cf6;
    border-radius: 13px;
    padding: 11px 4px 9px 4px;
    text-align: center;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.55);
    transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    -webkit-tap-highlight-color: transparent;
    animation: cardEntrance 0.35s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }
  .hub-tile::before {
    content: '';
    position: absolute;
    top: 0;
    left: -130%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.09), transparent);
    transform: skewX(-20deg);
    pointer-events: none;
    transition: left 0.5s ease;
  }
  .hub-tile:active {
    background: #33155e;
    border-color: #38bdf8;
    transform: scale(0.94);
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.65);
  }
  .hub-tile:active::before {
    left: 140%;
    transition: left 0.25s ease;
  }
  .hub-icon {
    font-size: 25px;
    line-height: 1.1;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
  }
  .hub-name {
    font-size: 11px;
    font-weight: 800;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    letter-spacing: 0.3px;
  }
  .hub-badge {
    background: #2b0e4f;
    border: 1px solid #a855f7;
    color: #38bdf8;
    border-radius: 10px;
    padding: 2px 7px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.4px;
    font-family: ui-monospace, SFMono-Regular, monospace;
  }
  .hub-tile-all {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #4c0d80, #220b3d);
    border: 1.8px solid #a855f7;
    flex-direction: row;
    gap: 10px;
    padding: 12px 14px;
    box-shadow: 0 4px 16px rgba(168, 85, 247, 0.35);
  }
  .hub-tile-all .hub-icon {
    font-size: 22px;
  }
  .hub-tile-all .hub-name {
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.6px;
  }
  .hub-tile-all .hub-badge {
    margin-left: auto;
    background: #0284c7;
    border-color: #38bdf8;
    color: #ffffff;
    font-size: 9.5px;
    padding: 3px 9px;
    font-weight: 900;
  }

  /* Detail Navigation Bar & Back Button */
  .detail-nav-bar {
    margin: 4px 0 10px 0;
  }
  .back-hub-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #2b0e4f, #180730);
    border: 1.5px solid #38bdf8;
    color: #38bdf8;
    border-radius: 12px;
    padding: 8px 14px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.5px;
    cursor: pointer;
    margin-bottom: 6px;
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .back-hub-btn:active {
    background: #0284c7;
    color: #ffffff;
    transform: scale(0.96);
  }
  .active-page-pill {
    background: #2b0e4f;
    border: 1.2px solid #38bdf8;
    color: #38bdf8;
    border-radius: 10px;
    padding: 4px 10px;
    font-size: 9.5px;
    font-weight: 800;
    font-family: ui-monospace, SFMono-Regular, monospace;
    letter-spacing: 0.5px;
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.3);
  }
  .search-box-wrap {
    margin: 2px 0 10px 0;
  }
  .search-input {
    width: 100%;
    box-sizing: border-box;
    background: #18092d;
    border: 1.5px solid #6b21a8;
    border-radius: 12px;
    padding: 10px 13px;
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .search-input::placeholder {
    color: #c084fc;
  }
  .search-input:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
  }
  .active-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 6px 2px 10px 2px;
  }
  .active-title {
    font-size: 14px;
    font-weight: 900;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    text-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
  }
  .active-hint {
    font-size: 10px;
    color: #38bdf8;
    font-weight: 800;
  }
  .cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    padding: 0 1px;
  }
  .cmd-card {
    position: relative;
    overflow: hidden;
    background: linear-gradient(145deg, #240f44, #130728);
    border: 1.5px solid #7c3aed;
    border-radius: 13px;
    padding: 12px 9px 11px 9px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    animation: cardEntrance 0.3s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }
  .cmd-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -130%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: skewX(-20deg);
    pointer-events: none;
    transition: left 0.5s ease;
  }
  .cmd-card:active {
    background: #33155e;
    border-color: #38bdf8;
    transform: scale(0.95);
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.65);
  }
  .cmd-card:active::before {
    left: 140%;
    transition: left 0.25s ease;
  }
  .cmd-title {
    font-size: 12.5px;
    font-weight: 900;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: #ffffff;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 0 6px rgba(192, 132, 252, 0.5);
  }
  .cmd-desc {
    font-size: 10px;
    font-weight: 600;
    color: #d8b4fe;
    margin-bottom: 8px;
    line-height: 1.35;
    min-height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cmd-capsule {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: #2b0e4f;
    border: 1.5px solid #c084fc;
    color: #ffffff;
    font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace;
    border-radius: 9px;
    padding: 5px 10px;
    font-size: 11.5px;
    font-weight: 800;
    box-shadow: 0 0 8px rgba(192, 132, 252, 0.35);
    transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .cmd-card:active .cmd-capsule {
    background: #0284c7;
    border-color: #38bdf8;
    transform: scale(1.02);
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
  }
  .section-divider {
    grid-column: 1 / -1;
    margin: 14px 0 6px 0;
    padding: 8px 12px;
    background: linear-gradient(90deg, #3b0764, #1e0a36);
    border-left: 4px solid #38bdf8;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 900;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  }

  /* Option 1: Pagination Bar Controls */
  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding: 6px 8px;
    background: linear-gradient(135deg, #1f0b3b, #110624);
    border: 1.5px solid #7c3aed;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }
  .page-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background: linear-gradient(135deg, #3b0764, #1e0a36);
    border: 1.5px solid #38bdf8;
    color: #38bdf8;
    border-radius: 9px;
    padding: 8px 14px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .page-btn:active:not(:disabled) {
    background: #0284c7;
    color: #ffffff;
    transform: scale(0.95);
  }
  .page-btn:disabled {
    opacity: 0.35;
    border-color: #4b5563;
    color: #6b7280;
    cursor: not-allowed;
    background: #140824;
  }
  .page-indicator {
    font-size: 10.5px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.5px;
    text-align: center;
    text-shadow: 0 0 8px rgba(168, 85, 247, 0.8);
    font-family: ui-monospace, SFMono-Regular, monospace;
  }

  /* Footer Quick Actions */
  .footer-actions {
    margin-top: 10px;
    margin-bottom: 6px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding-bottom: 0;
  }
  .footer-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 11.5px;
    font-weight: 800;
    cursor: pointer;
    letter-spacing: 0.5px;
    border: 1.5px solid;
    transition: all 0.15s ease;
    box-shadow: 0 3px 10px rgba(0,0,0,0.4);
  }
  .btn-copy-all {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    border-color: #a855f7;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(124, 58, 237, 0.45);
    padding: 11px 14px;
    font-size: 12px;
    font-weight: 900;
  }
  .btn-row {
    display: flex;
    gap: 7px;
  }
  .btn-ping {
    flex: 1;
    background: linear-gradient(135deg, #1e0b38, #120624);
    border-color: #38bdf8;
    color: #38bdf8;
  }
  .btn-owner {
    flex: 1;
    background: linear-gradient(135deg, #1e0b38, #120624);
    border-color: #eab308;
    color: #facc15;
  }
  .footer-btn:active {
    transform: scale(0.97);
    filter: brightness(1.2);
  }

  /* Large Cyber Footer Branding */
  .footer-branding-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 4px;
  }
  .footer-branding {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    text-align: center;
    font-size: 12px;
    font-weight: 900;
    color: #f3e8ff;
    letter-spacing: 2px;
    padding: 7px 18px;
    border-radius: 20px;
    background: linear-gradient(90deg, rgba(139, 92, 246, 0.25), rgba(56, 189, 248, 0.3), rgba(139, 92, 246, 0.25));
    border: 1.5px solid rgba(168, 85, 247, 0.6);
    box-shadow: 0 0 16px rgba(139, 92, 246, 0.4);
    text-transform: uppercase;
    animation: footerGlow 3s ease-in-out infinite;
  }
  #toast {
    display: none;
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: #3b0764;
    border: 1.5px solid #38bdf8;
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.7);
    color: #ffffff;
    padding: 8px 18px;
    border-radius: 24px;
    font-size: 11.5px;
    font-weight: 800;
    z-index: 9999;
    pointer-events: none;
    white-space: nowrap;
    text-shadow: 0 0 6px #38bdf8;
  }
</style>

<div class="app-master" id="masterApp">
  <!-- Toast alert -->
  <div id="toast">Copied!</div>
  <textarea id="clipSink" style="position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;"></textarea>

  <!-- Bot Header Card -->
  <div class="header-card">
    <img class="header-logo" src="${logoSrc}" alt="${botName}" loading="eager" onerror="this.onerror=null; this.src='${EMBEDDED_BRAND_LOGO_BASE64}';">
    <div class="header-brand">👑 ${escapeHtml(botName)} 👑</div>
    <div class="header-sub">⚡ ${escapeHtml(plan)}</div>
    <div class="header-pill">
      <span class="dot-pulse"></span>
      <span>24/7h ONLINE</span>
    </div>
  </div>

  <!-- Telemetry Statistics -->
  <div class="stats-row">
    <div class="stat-badge">
      <div class="stat-num">15+</div>
      <div class="stat-lbl">Categories</div>
    </div>
    <div class="stat-badge">
      <div class="stat-num">160+</div>
      <div class="stat-lbl">Commands</div>
    </div>
    <div class="stat-badge">
      <div class="stat-num">1-TAP</div>
      <div class="stat-lbl">Fast Copy</div>
    </div>
  </div>

  <!-- Quick Filter Search Input -->
  <div class="search-box-wrap">
    <input type="text" class="search-input" id="searchBox" placeholder="🔍 Search all 160+ commands (e.g. song, tiktok, gemini)..." oninput="filterActiveCommands(this.value)">
  </div>

  <!-- VIEW 1: CATEGORY HUB (Smart App Drawer Grid) -->
  <div id="categoryHubView" class="hub-container">
    <div class="hub-header">
      <div class="hub-title">📁 SELECT A CATEGORY</div>
      <div class="hub-subtitle">⚡ 15 SECTIONS AVAILABLE</div>
    </div>
    <div class="hub-grid" id="hubGrid"></div>

    <!-- Main Menu Quick Actions (Shown ONLY in Main Category Hub) -->
    <div class="footer-actions">
      <button class="footer-btn btn-copy-all" onclick="copyAllCommands()">
        <span>📋 COPY COMPLETE COMMANDS DIRECTORY</span>
      </button>
      <div class="btn-row">
        <button class="footer-btn btn-ping" onclick="copyCmd('${p}ping')">
          <span>⚡ SPEED PING (.ping)</span>
        </button>
        <button class="footer-btn btn-owner" onclick="copyCmd('${p}owner')">
          <span>👑 CONTACT OWNER (.owner)</span>
        </button>
      </div>
    </div>
  </div>

  <!-- VIEW 2: CATEGORY DETAIL & COMMAND CARDS (Option 1: Paginated 8/page) -->
  <div id="categoryDetailView" style="display:none;">
    <div class="detail-nav-bar">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <button class="back-hub-btn" onclick="showCategoryHub()" style="margin-bottom:0;">
          <span>⬅️ BACK TO CATEGORIES</span>
        </button>
        <div class="active-page-pill" id="topPagePill">PAGE 1/1</div>
      </div>
      <div class="active-header" style="margin-top:2px; margin-bottom:6px;">
        <div class="active-title" id="activeCategoryTitle">📥 DOWNLOADS (12 COMMANDS)</div>
        <div class="active-hint" id="activeCategoryHint">⚡ 1-Tap Copy Commands</div>
      </div>
    </div>

    <!-- 2-Column Command Cards Grid (8 items per page) -->
    <div class="cards-grid" id="cardsGrid"></div>

    <!-- Option 1: Pagination Navigation Controls -->
    <div class="pagination-bar" id="paginationBar" style="display:none;">
      <button class="page-btn" id="btnPrevPage" onclick="prevCategoryPage()">
        <span>◀️ PREV</span>
      </button>
      <div class="page-indicator" id="pageIndicatorText">
        PAGE 1 OF 1
      </div>
      <button class="page-btn" id="btnNextPage" onclick="nextCategoryPage()">
        <span>NEXT ▶️</span>
      </button>
    </div>

    <!-- Return to Categories Hub -->
    <div style="margin-top:8px; margin-bottom:4px;">
      <button class="back-hub-btn" onclick="showCategoryHub()" style="width:100%; justify-content:center; margin-bottom:0;">
        <span>⬅️ ALL CATEGORIES DIRECTORY</span>
      </button>
    </div>
  </div>

  <!-- Footer Branding -->
  <div class="footer-branding-wrap">
    <div class="footer-branding">⚡ POWERED BY YASHI HALLS ⚡</div>
  </div>
</div>

<script>
  var categories = ${categoriesJson};
  var currentPrefix = "${p}";
  var currentCatKey = "${initTab}";
  var toastTimer = null;
  var currentCategoryPage = 1;
  var pageSize = 8;
  var currentFilteredCards = [];
  var currentQueryText = '';

  function showToast(text) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.innerText = text;
    t.style.display = 'block';
    t.style.animation = 'none';
    void t.offsetHeight;
    t.style.animation = 'toastPop 1.8s ease forwards';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      t.style.display = 'none';
    }, 1800);
  }

  function copyCmd(cmd, el) {
    if (el) {
      el.style.borderColor = '#38bdf8';
      el.style.background = '#33155e';
      setTimeout(function() {
        el.style.borderColor = '#7c3aed';
        el.style.background = 'linear-gradient(145deg, #240f44, #130728)';
      }, 350);
    }

    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd).then(function() {
        showToast('✓ Copied: ' + cmd + ' (Paste in Chat!)');
      }).catch(function() {
        fallbackCopy(cmd);
      });
    } else {
      fallbackCopy(cmd);
    }
  }

  function fallbackCopy(cmd) {
    try {
      var sink = document.getElementById('clipSink');
      if (sink) {
        sink.value = cmd;
        sink.select();
        sink.setSelectionRange(0, 99999);
        var success = document.execCommand('copy');
        showToast(success ? ('✓ Copied: ' + cmd + ' (Paste in chat!)') : ('Command: ' + cmd));
      } else {
        showToast('Command: ' + cmd);
      }
    } catch(e) {
      showToast('Command: ' + cmd);
    }
  }

  function copyAllCommands() {
    var text = '👑 YASHI HALLS MASTER COMMANDS LIST 👑\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
    Object.keys(categories).forEach(function(k) {
      var cat = categories[k];
      text += '\\n' + cat.name.toUpperCase() + ':\\n';
      cat.cards.forEach(function(c) {
        var cmd = c.capsule.indexOf(currentPrefix) === 0 ? c.capsule : currentPrefix + c.capsule.replace(/^\\./, '');
        text += '• ' + cmd + ' - ' + c.name + ' (' + c.desc + ')\\n';
      });
    });
    copyCmd(text);
    showToast('✓ Full Menu copied to clipboard!');
  }

  function createCardElement(item, animIdx, categoryBadge) {
    var rawCap = item.capsule || '';
    var cleanCmd = rawCap.indexOf(currentPrefix) === 0 ? rawCap : (rawCap.indexOf('.') === 0 ? currentPrefix + rawCap.slice(1) : currentPrefix + rawCap);

    var card = document.createElement('div');
    card.className = 'cmd-card';
    if (typeof animIdx === 'number') {
      card.style.animationDelay = (Math.min(animIdx, 8) * 35) + 'ms';
    }
    card.onclick = function() { copyCmd(cleanCmd, card); };

    var titleDiv = document.createElement('div');
    titleDiv.className = 'cmd-title';
    titleDiv.innerText = (categoryBadge ? '[' + categoryBadge + '] ' : '') + item.name;

    var descDiv = document.createElement('div');
    descDiv.className = 'cmd-desc';
    descDiv.innerText = item.desc;

    var capDiv = document.createElement('div');
    capDiv.className = 'cmd-capsule';
    capDiv.innerHTML = '📋 ' + cleanCmd;

    card.appendChild(titleDiv);
    card.appendChild(descDiv);
    card.appendChild(capDiv);

    return card;
  }

  function renderPageItems() {
    var grid = document.getElementById('cardsGrid');
    var paginationBar = document.getElementById('paginationBar');
    var topPagePill = document.getElementById('topPagePill');
    var pageIndicator = document.getElementById('pageIndicatorText');
    var btnPrev = document.getElementById('btnPrevPage');
    var btnNext = document.getElementById('btnNextPage');
    var hintEl = document.getElementById('activeCategoryHint');
    if (!grid) return;
    grid.innerHTML = '';

    var totalItems = currentFilteredCards.length;
    var totalPages = Math.ceil(totalItems / pageSize) || 1;

    if (currentCategoryPage > totalPages) currentCategoryPage = totalPages;
    if (currentCategoryPage < 1) currentCategoryPage = 1;

    if (totalItems === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:26px;color:#a855f7;font-size:12px;font-weight:700;">No commands found matching query</div>';
      if (paginationBar) paginationBar.style.display = 'none';
      if (topPagePill) topPagePill.style.display = 'none';
      return;
    }

    var startIdx = (currentCategoryPage - 1) * pageSize;
    var endIdx = Math.min(startIdx + pageSize, totalItems);
    var pageItems = currentFilteredCards.slice(startIdx, endIdx);

    pageItems.forEach(function(entry, idx) {
      grid.appendChild(createCardElement(entry.item, idx, entry.catBadge));
    });

    if (topPagePill) {
      topPagePill.style.display = 'inline-block';
      topPagePill.innerText = 'PAGE ' + currentCategoryPage + '/' + totalPages;
    }

    if (hintEl) {
      hintEl.innerText = totalPages > 1 
        ? ('⚡ Page ' + currentCategoryPage + '/' + totalPages + ' (' + (startIdx + 1) + '-' + endIdx + ' of ' + totalItems + ')')
        : ('⚡ ' + totalItems + ' Commands • 1-Tap Fast Copy');
    }

    if (paginationBar) {
      paginationBar.style.display = totalPages > 1 ? 'flex' : 'none';
      if (pageIndicator) {
        pageIndicator.innerText = 'PAGE ' + currentCategoryPage + ' OF ' + totalPages + ' (' + totalItems + ' CMDS)';
      }
      if (btnPrev) {
        btnPrev.disabled = (currentCategoryPage <= 1);
      }
      if (btnNext) {
        btnNext.disabled = (currentCategoryPage >= totalPages);
      }
    }
  }

  function nextCategoryPage() {
    var totalPages = Math.ceil(currentFilteredCards.length / pageSize) || 1;
    if (currentCategoryPage < totalPages) {
      currentCategoryPage++;
      renderPageItems();
    }
  }

  function prevCategoryPage() {
    if (currentCategoryPage > 1) {
      currentCategoryPage--;
      renderPageItems();
    }
  }

  function renderCategory(catKey, filterText) {
    currentCatKey = catKey;
    currentQueryText = (filterText || '').trim().toLowerCase();
    var titleEl = document.getElementById('activeCategoryTitle');

    currentFilteredCards = [];

    if (catKey === 'all') {
      if (titleEl) {
        titleEl.innerText = currentQueryText ? ('🔍 SEARCH: ' + currentQueryText.toUpperCase()) : ('🌟 ALL COMMANDS DIRECTORY');
      }
      Object.keys(categories).forEach(function(key) {
        var cat = categories[key];
        cat.cards.forEach(function(item) {
          if (!currentQueryText ||
              (item.name && item.name.toLowerCase().indexOf(currentQueryText) !== -1) ||
              (item.desc && item.desc.toLowerCase().indexOf(currentQueryText) !== -1) ||
              (item.capsule && item.capsule.toLowerCase().indexOf(currentQueryText) !== -1)) {
            currentFilteredCards.push({
              item: item,
              catBadge: cat.shortLabel || cat.name.replace(/^[^\\s]+\\s*/, '')
            });
          }
        });
      });
    } else {
      var cat = categories[catKey];
      if (cat) {
        if (titleEl) {
          titleEl.innerText = cat.name.toUpperCase();
        }
        (cat.cards || []).forEach(function(item) {
          if (!currentQueryText ||
              (item.name && item.name.toLowerCase().indexOf(currentQueryText) !== -1) ||
              (item.desc && item.desc.toLowerCase().indexOf(currentQueryText) !== -1) ||
              (item.capsule && item.capsule.toLowerCase().indexOf(currentQueryText) !== -1)) {
            currentFilteredCards.push({
              item: item,
              catBadge: null
            });
          }
        });
      }
    }

    renderPageItems();
  }

  function renderHubGrid() {
    var hub = document.getElementById('hubGrid');
    if (!hub) return;
    hub.innerHTML = '';

    var keys = Object.keys(categories);
    keys.forEach(function(key, idx) {
      var cat = categories[key];
      var tile = document.createElement('div');
      tile.className = 'hub-tile';
      tile.style.animationDelay = (idx * 26) + 'ms';
      tile.onclick = function() { openCategory(key); };

      var icon = document.createElement('div');
      icon.className = 'hub-icon';
      icon.innerText = cat.icon || '⚡';

      var name = document.createElement('div');
      name.className = 'hub-name';
      name.innerText = cat.shortLabel || cat.name.replace(/^[^\\s]+\\s*/, '');

      var badge = document.createElement('div');
      badge.className = 'hub-badge';
      badge.innerText = (cat.cards ? cat.cards.length : 0) + ' CMDS';

      tile.appendChild(icon);
      tile.appendChild(name);
      tile.appendChild(badge);
      hub.appendChild(tile);
    });

    // Special Full-Width Tile for ALL COMMANDS
    var allTile = document.createElement('div');
    allTile.className = 'hub-tile hub-tile-all';
    allTile.style.animationDelay = (keys.length * 26) + 'ms';
    allTile.onclick = function() { openCategory('all'); };

    var allIcon = document.createElement('div');
    allIcon.className = 'hub-icon';
    allIcon.innerText = '🌟';

    var allName = document.createElement('div');
    allName.className = 'hub-name';
    allName.innerText = 'BROWSE ALL 160+ COMMANDS DIRECTORY';

    var allBadge = document.createElement('div');
    allBadge.className = 'hub-badge';
    allBadge.innerText = '160+ CMDS';

    allTile.appendChild(allIcon);
    allTile.appendChild(allName);
    allTile.appendChild(allBadge);
    hub.appendChild(allTile);
  }

  function showCategoryHub() {
    currentCatKey = 'hub';
    currentCategoryPage = 1;
    var hubView = document.getElementById('categoryHubView');
    var detailView = document.getElementById('categoryDetailView');
    var search = document.getElementById('searchBox');
    if (search) search.value = '';

    if (hubView) hubView.style.display = 'block';
    if (detailView) detailView.style.display = 'none';

    var master = document.getElementById('masterApp');
    if (master) master.scrollTop = 0;
  }

  function openCategory(catKey) {
    currentCatKey = catKey;
    currentCategoryPage = 1;
    var hubView = document.getElementById('categoryHubView');
    var detailView = document.getElementById('categoryDetailView');
    var search = document.getElementById('searchBox');
    if (search) search.value = '';

    if (hubView) hubView.style.display = 'none';
    if (detailView) detailView.style.display = 'block';

    renderCategory(catKey);

    var master = document.getElementById('masterApp');
    if (master) master.scrollTop = 0;
  }

  function filterActiveCommands(val) {
    var query = (val || '').trim();
    var hubView = document.getElementById('categoryHubView');
    var detailView = document.getElementById('categoryDetailView');

    currentCategoryPage = 1;

    if (query.length > 0) {
      if (hubView) hubView.style.display = 'none';
      if (detailView) detailView.style.display = 'block';
      renderCategory('all', query);
    } else {
      if (currentCatKey === 'hub') {
        showCategoryHub();
      } else {
        renderCategory(currentCatKey);
      }
    }
  }

  // Initial render
  (function init() {
    renderHubGrid();
    if (currentCatKey && currentCatKey !== 'hub' && categories[currentCatKey]) {
      openCategory(currentCatKey);
    } else {
      showCategoryHub();
    }
  })();
</script>
`;
}

/**
 * Legacy support for main neon menu
 */
export function generateYashiHallsNeonMenuHtml(data: {
  botName?: string;
  prefix?: string;
  plan?: string;
  ownerNumber?: string;
  uptime?: string;
  serverUrl?: string;
} = {}): string {
  return generateMasterInteractiveMenuHtml(data);
}

/**
 * Interactive In-Chat HTML App Card for Connected / Welcome Event
 * Sent when a user or customer connects to the WhatsApp Bot.
 */
export function generateConnectedWelcomeHtmlApp(data: {
  botName?: string;
  userName?: string;
  phoneNumber?: string;
  prefix?: string;
  plan?: string;
  channelUrl?: string;
  height?: number;
} = {}): string {
  const botName = data.botName || 'YASHI HALLS MINI';
  const userName = data.userName || 'Valued Customer';
  const phoneNumber = data.phoneNumber || 'Connected Number';
  const prefix = data.prefix || '.';
  const plan = data.plan || 'MINI PLAN';
  const channelUrl = data.channelUrl || 'https://whatsapp.com/channel/0029Vb927N4GJP8MS1yurM2Z';
  const totalHeight = data.height || 620;

  const logoSrc = EMBEDDED_BRAND_LOGO_BASE64;
  const headerBgSrc = EMBEDDED_HEADER_BG_BASE64;

  // Curated VIP Starter Commands (Download & AI tools removed as requested)
  const vipCmds = [
    { title: "MASTER MENU", desc: "160+ Commands Hub", cmd: `${prefix}menu`, icon: "📁", badge: "ALL FEATURES" },
    { title: "SPEED PING", desc: "Check Bot Latency", cmd: `${prefix}ping`, icon: "⚡", badge: "ULTRA FAST" },
    { title: "SYSTEM ALIVE", desc: "24/7 Health Check", cmd: `${prefix}alive`, icon: "🟢", badge: "24/7 ACTIVE" },
    { title: "OWNER SUPPORT", desc: "Direct VIP Contact", cmd: `${prefix}owner`, icon: "👑", badge: "VIP HELP" },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>${escapeHtml(botName)} - VIP Connected & Welcome</title>
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }
  html, body {
    width: 100%;
    height: 100%;
    background-color: #0c0717;
    color: #ffffff;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    user-select: none;
    -webkit-user-select: none;
    overflow-x: hidden;
    overflow-y: hidden;
  }
  @keyframes radarRipple {
    0% { transform: scale(0.9); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.5; }
    100% { transform: scale(0.9); opacity: 1; }
  }
  @keyframes logoPulse {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.7)); }
    50% { transform: scale(1.03); filter: drop-shadow(0 0 18px rgba(168, 85, 247, 0.85)); }
  }
  @keyframes borderShimmer {
    0% { border-color: #a855f7; box-shadow: 0 0 14px rgba(168, 85, 247, 0.35); }
    50% { border-color: #38bdf8; box-shadow: 0 0 20px rgba(56, 189, 248, 0.5); }
    100% { border-color: #a855f7; box-shadow: 0 0 14px rgba(168, 85, 247, 0.35); }
  }
  @keyframes celebratePulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  @keyframes greetingShine {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes floatBadge {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
  .app-welcome {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding: 9px 10px 11px 10px;
    height: ${totalHeight}px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Header Card with Base64 background */
  .header-card {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(14, 5, 29, 0.75) 0%, rgba(22, 8, 43, 0.92) 100%), url('${headerBgSrc}') center/cover no-repeat;
    border: 1.5px solid #a855f7;
    border-radius: 14px;
    padding: 10px 10px 8px 10px;
    text-align: center;
    box-shadow: 0 6px 20px rgba(0,0,0,0.65), inset 0 0 20px rgba(139, 92, 246, 0.25);
  }
  .header-logo {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 2px solid #38bdf8;
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.75), 0 0 26px rgba(168, 85, 247, 0.45);
    object-fit: cover;
    margin: 0 auto 4px auto;
    display: block;
    background: #110624;
    animation: logoPulse 3.5s ease-in-out infinite;
  }
  .header-brand {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0.8px;
    background: linear-gradient(90deg, #ffffff 0%, #f3e8ff 25%, #38bdf8 50%, #f3e8ff 75%, #ffffff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 10px rgba(192, 132, 252, 0.75));
  }
  .header-sub {
    font-size: 9.5px;
    color: #e9d5ff;
    font-weight: 800;
    margin-top: 1px;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.95);
  }
  .header-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #0d281a;
    border: 1.5px solid #22c55e;
    color: #4ade80;
    padding: 2.5px 10px;
    border-radius: 20px;
    font-size: 8.5px;
    font-weight: 800;
    margin-top: 3px;
    letter-spacing: 0.6px;
  }
  .dot-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: radarRipple 1.6s ease-out infinite;
  }

  /* Animated VIP Customer Welcome Hero Section */
  .welcome-hero-card {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #2b0b4a 0%, #15062a 50%, #0d1e38 100%);
    border: 1.5px solid #a855f7;
    border-radius: 13px;
    padding: 10px 12px;
    text-align: center;
    animation: borderShimmer 3s ease-in-out infinite, celebratePulse 4s ease-in-out infinite;
    box-shadow: 0 6px 18px rgba(0,0,0,0.55);
  }
  .welcome-hero-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 65%);
    pointer-events: none;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid #38bdf8;
    color: #38bdf8;
    border-radius: 14px;
    padding: 2px 9px;
    font-size: 8.5px;
    font-weight: 900;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 4px;
    animation: floatBadge 2.5s ease-in-out infinite;
  }
  .hero-title {
    font-size: 13px;
    font-weight: 900;
    letter-spacing: 0.5px;
    background: linear-gradient(90deg, #fbcfe8, #ffffff, #67e8f9, #ffffff, #fbcfe8);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: greetingShine 4s linear infinite;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
    line-height: 1.25;
  }
  .hero-sinhala-msg {
    font-size: 10px;
    font-weight: 700;
    color: #e2e8f0;
    line-height: 1.35;
    margin-top: 4px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  }
  .hero-perk-row {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 6px;
  }
  .hero-perk-pill {
    background: rgba(14, 7, 25, 0.7);
    border: 1px solid #7c3aed;
    color: #c084fc;
    border-radius: 8px;
    padding: 2px 7px;
    font-size: 8px;
    font-weight: 800;
  }

  /* Connection Info Badges Grid */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
  }
  .info-pill {
    background: #18092d;
    border: 1.2px solid #581c87;
    border-radius: 9px;
    padding: 5px 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .info-icon {
    font-size: 12px;
    line-height: 1;
  }
  .info-meta {
    overflow: hidden;
    text-align: left;
  }
  .info-meta-lbl {
    font-size: 7px;
    text-transform: uppercase;
    color: #a855f7;
    font-weight: 800;
    letter-spacing: 0.3px;
  }
  .info-meta-val {
    font-size: 9.5px;
    font-weight: 800;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: ui-monospace, SFMono-Regular, monospace;
  }

  /* VIP Core Command Cards (2x2 Grid) */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1px 2px 4px 2px;
  }
  .section-title {
    font-size: 10.5px;
    font-weight: 900;
    color: #f3e8ff;
    letter-spacing: 0.8px;
    text-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
  }
  .section-hint {
    font-size: 8px;
    color: #38bdf8;
    font-weight: 800;
    letter-spacing: 0.5px;
  }
  .cmd-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .cmd-card {
    position: relative;
    background: linear-gradient(145deg, #240f44, #130728);
    border: 1.3px solid #7c3aed;
    border-radius: 10px;
    padding: 7px 8px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.14s ease, border-color 0.15s ease, background 0.15s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 3px 10px rgba(0,0,0,0.45);
  }
  .cmd-card:active {
    background: #33155e;
    border-color: #38bdf8;
    transform: scale(0.96);
    box-shadow: 0 0 14px rgba(56, 189, 248, 0.6);
  }
  .cmd-title {
    font-size: 10.5px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 0.4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cmd-desc {
    font-size: 8px;
    color: #c084fc;
    font-weight: 600;
    margin: 1px 0 3px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cmd-badge {
    align-self: center;
    background: #130626;
    border: 1px solid #a855f7;
    color: #38bdf8;
    padding: 2px 7px;
    border-radius: 6px;
    font-size: 8px;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-weight: 800;
  }

  /* Action Buttons */
  .actions-col {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .action-btn-main {
    width: 100%;
    padding: 9px 12px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    border: 1.5px solid #a855f7;
    color: #ffffff;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(124, 58, 237, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.15s ease;
  }
  .action-btn-main:active {
    transform: scale(0.97);
    background: #6d28d9;
  }
  .actions-sub-row {
    display: flex;
    gap: 6px;
  }
  .action-btn-sub {
    flex: 1;
    padding: 7px 10px;
    border-radius: 9px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.4px;
    background: linear-gradient(135deg, #1b0a33, #0f051f);
    border: 1.3px solid;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: all 0.15s ease;
  }
  .action-btn-sub:active {
    transform: scale(0.96);
  }
  .btn-ping {
    border-color: #38bdf8;
    color: #38bdf8;
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.25);
  }
  .btn-owner {
    border-color: #eab308;
    color: #fde047;
    box-shadow: 0 0 8px rgba(234, 179, 8, 0.25);
  }
  .btn-channel {
    border-color: #22c55e;
    color: #4ade80;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.25);
    text-decoration: none;
    padding: 6px 10px;
    font-size: 9.5px;
  }

  /* Footer Brand */
  .footer-brand {
    text-align: center;
    font-size: 9.5px;
    font-weight: 900;
    letter-spacing: 1.2px;
    color: #38bdf8;
    text-shadow: 0 0 8px rgba(56, 189, 248, 0.75);
    margin-top: 4px;
  }

  /* Toast notification */
  #toast {
    display: none;
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: #3b0764;
    border: 1.5px solid #38bdf8;
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.7);
    color: #ffffff;
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    z-index: 9999;
    pointer-events: none;
    white-space: nowrap;
    text-shadow: 0 0 6px #38bdf8;
  }
</style>
</head>
<body>
<div class="app-welcome">
  <div id="toast">Copied!</div>
  <textarea id="clipSink" style="position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;"></textarea>

  <!-- Bot Header Card -->
  <div class="header-card">
    <img class="header-logo" src="${logoSrc}" alt="${escapeHtml(botName)}" loading="eager" onerror="this.onerror=null; this.src='${EMBEDDED_BRAND_LOGO_BASE64}';">
    <div class="header-brand">👑 ${escapeHtml(botName)} 👑</div>
    <div class="header-sub">⚡ ${escapeHtml(plan)}</div>
    <div class="header-pill">
      <span class="dot-pulse"></span>
      <span>24/7h ONLINE & ACTIVE</span>
    </div>
  </div>

  <!-- Animated VIP Customer Welcome Hero Showcase -->
  <div class="welcome-hero-card">
    <div class="hero-tag">✨ VIP CUSTOMER WELCOME ✨</div>
    <div class="hero-title">🎉 ආයුබෝවන්, ${escapeHtml(userName)}! 🎉</div>
    <div class="hero-sinhala-msg">
      ඔබගේ WhatsApp Bot සාර්ථකව සම්බන්ධ වී පැය 24 පුරාම සක්‍රිය විය! නිල Channel එකටද ඔබව ස්වයංක්‍රීයව සම්බන්ධ කර ඇත (Auto-Followed). ඔබේ එදිනෙදා වැඩ පහසු කරවන ප්‍රබල පහසුකම් 160+ කට වැඩි ප්‍රමාණයක් දැන් ඔබේ ඇඟිලි තුඩුවලටම සූදානම්!
    </div>
    <div class="hero-perk-row">
      <span class="hero-perk-pill">⚡ 24/7 Ultra-Fast</span>
      <span class="hero-perk-pill">🛡️ 100% Private</span>
      <span class="hero-perk-pill">👑 160+ Features</span>
      <span class="hero-perk-pill">📢 Channel Followed ✅</span>
    </div>
  </div>

  <!-- Connection Meta Grid -->
  <div class="info-grid">
    <div class="info-pill">
      <span class="info-icon">📱</span>
      <div class="info-meta">
        <div class="info-meta-lbl">NUMBER</div>
        <div class="info-meta-val">+${escapeHtml(phoneNumber)}</div>
      </div>
    </div>
    <div class="info-pill">
      <span class="info-icon">👑</span>
      <div class="info-meta">
        <div class="info-meta-lbl">CONNECTED USER</div>
        <div class="info-meta-val">${escapeHtml(userName)}</div>
      </div>
    </div>
    <div class="info-pill">
      <span class="info-icon">🔣</span>
      <div class="info-meta">
        <div class="info-meta-lbl">COMMAND PREFIX</div>
        <div class="info-meta-val">[ ${escapeHtml(prefix)} ]</div>
      </div>
    </div>
    <div class="info-pill">
      <span class="info-icon">⚡</span>
      <div class="info-meta">
        <div class="info-meta-lbl">SYSTEM STATUS</div>
        <div class="info-meta-val">Ready 24/7</div>
      </div>
    </div>
  </div>

  <!-- VIP Starter Command Touch Cards -->
  <div>
    <div class="section-header">
      <div class="section-title">🚀 QUICK START SHORTCUTS</div>
      <div class="section-hint">⚡ 1-TAP TOUCH TO COPY</div>
    </div>
    <div class="cmd-grid">
      ${vipCmds.map(c => `
      <div class="cmd-card" onclick="copyCmd('${c.cmd}')">
        <div class="cmd-title">${c.icon} ${escapeHtml(c.title)}</div>
        <div class="cmd-desc">${escapeHtml(c.desc)}</div>
        <div class="cmd-badge">📋 ${escapeHtml(c.cmd.trim())}</div>
      </div>
      `).join('')}
    </div>
  </div>

  <!-- Actions -->
  <div class="actions-col">
    <button class="action-btn-main" onclick="copyCmd('${prefix}menu')">
      <span>📂</span>
      <span>COPY ${prefix}menu TO OPEN MASTER HUB</span>
    </button>
    <div class="actions-sub-row">
      <button class="action-btn-sub btn-ping" onclick="copyCmd('${prefix}ping')">
        <span>⚡ SPEED PING</span>
      </button>
      <button class="action-btn-sub btn-owner" onclick="copyCmd('${prefix}owner')">
        <span>👑 CONTACT OWNER</span>
      </button>
      <a class="action-btn-sub btn-channel" href="${channelUrl}">
        <span>📢 CHANNEL</span>
      </a>
    </div>
  </div>

  <!-- Footer Branding -->
  <div class="footer-brand">
    ⚡ POWERED BY YASHI HALLS ⚡
  </div>
</div>

<script>
function showToast(text) {
  var t = document.getElementById("toast");
  if (!t) return;
  t.textContent = text;
  t.style.display = "block";
  clearTimeout(window.__tTimer);
  window.__tTimer = setTimeout(function() {
    t.style.display = "none";
  }, 1800);
}

function copyCmd(cmd) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cmd).then(function() {
      showToast("Copied: " + cmd);
    }).catch(function() {
      fallbackCopy(cmd);
    });
    return;
  }
  fallbackCopy(cmd);
}

function fallbackCopy(text) {
  var sink = document.getElementById("clipSink");
  if (!sink) return;
  sink.value = text;
  sink.select();
  try {
    document.execCommand("copy");
    showToast("Copied: " + text);
  } catch(e) {
    showToast("Copied: " + text);
  }
}
</script>
</body>
</html>`;
}

/**
 * User provided interactive interactive HTML menu for .test1 command
 */
export const YASHI_USER_TEST1_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>YASHI HALLS MINI</title>
<style>
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: Arial, sans-serif;
background: #10111b;
color: #fff;
padding: 16px 12px;
user-select: none;
-webkit-user-select: none;
}

.container {
max-width: 480px;
margin: auto;
}

.header {
background: linear-gradient(135deg, #242044, #171a31);
border: 1px solid #39315f;
border-radius: 20px;
padding: 20px 14px;
text-align: center;
box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.logo {
width: 80px;
height: 80px;
border-radius: 50%;
object-fit: cover;
border: 3px solid #a78bfa;
margin-bottom: 10px;
box-shadow: 0 0 15px rgba(167, 139, 250, 0.5);
}

.header h1 {
font-size: 20px;
letter-spacing: 1px;
color: #f3e8ff;
}

.header p {
color: #aaa6c7;
font-size: 11.5px;
margin-top: 6px;
}

.status {
display: inline-block;
background: #173d32;
color: #62e6a1;
padding: 6px 14px;
border-radius: 20px;
font-size: 10.5px;
font-weight: bold;
margin-top: 12px;
border: 1px solid #22c55e44;
}

.stats {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 9px;
margin: 14px 0;
}

.stat {
background: #1c1d2d;
border: 1px solid #303149;
padding: 12px 4px;
border-radius: 14px;
text-align: center;
}

.stat h2 {
color: #b69aff;
font-size: 18px;
font-weight: bold;
}

.stat p {
font-size: 9.5px;
color: #aaa;
margin-top: 4px;
}

.heading {
font-size: 14px;
margin: 18px 3px 10px;
color: #d6c9ff;
font-weight: bold;
letter-spacing: 0.5px;
}

.categories {
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 10px;
}

.category {
background: linear-gradient(145deg, #292443, #1b2037);
border: 1px solid #49406d;
border-radius: 15px;
padding: 16px 12px;
text-align: left;
color: white;
cursor: pointer;
transition: 0.2s;
}

.category:active,
.category.active {
background: linear-gradient(145deg, #6341a5, #34306b);
border-color: #b69aff;
transform: scale(0.98);
box-shadow: 0 0 12px rgba(182, 154, 255, 0.4);
}

.category-icon {
font-size: 25px;
margin-bottom: 9px;
}

.category h3 {
font-size: 13.5px;
margin-bottom: 5px;
color: #f5f3ff;
}

.category p {
font-size: 9.5px;
color: #c1badb;
line-height: 1.3;
}

.submenu {
display: none;
background: #1b1c2b;
border: 1px solid #49406d;
border-radius: 16px;
padding: 14px;
margin-top: 14px;
animation: show 0.25s ease;
box-shadow: 0 4px 18px rgba(0,0,0,0.4);
}

.submenu.show {
display: block;
}

@keyframes show {
from {
opacity: 0;
transform: translateY(-7px);
}
to {
opacity: 1;
transform: translateY(0);
}
}

.submenu h3 {
color: #cbb8ff;
font-size: 14px;
margin-bottom: 10px;
font-weight: bold;
}

.command {
background: #27263c;
border: 1px solid #383450;
border-radius: 9px;
padding: 10px 12px;
margin-top: 7px;
font-size: 12.5px;
color: #eee9ff;
font-family: ui-monospace, monospace;
}

.command span {
color: #b69aff;
font-weight: bold;
margin-right: 8px;
}

.footer {
text-align: center;
padding: 20px 5px 12px;
font-size: 9.5px;
color: #8f8aa7;
line-height: 1.7;
font-weight: bold;
}
</style>
</head>
<body>
<div class="container">
<div class="header">
    <img
    src="https://i.ibb.co/n2fYpDV/file-000000007c3c8210ae1b96d28b22c655.png"
    class="logo"
    alt="YASHI HALLS"
    referrerpolicy="no-referrer"
    onerror="this.src='https://i.ibb.co/n2fYpDV/file-000000007c3c8210ae1b96d28b22c655.png'">

    <h1>👑 YASHI HALLS MINI</h1>
    <p>WhatsApp Assistant • MINI PLAN</p>

    <div class="status">● MENU PREVIEW</div>
</div>

<div class="stats">
    <div class="stat">
        <h2>06</h2>
        <p>Categories</p>
    </div>
    <div class="stat">
        <h2>24+</h2>
        <p>Commands</p>
    </div>
    <div class="stat">
        <h2>24/7</h2>
        <p>Assistant</p>
    </div>
</div>

<h3 class="heading">📂 MAIN MENU</h3>

<div class="categories">

    <button class="category" onclick="openMenu('download',this)">
        <div class="category-icon">📥</div>
        <h3>Downloads</h3>
        <p>Music, Videos & Social Media</p>
    </button>

    <button class="category" onclick="openMenu('ai',this)">
        <div class="category-icon">🤖</div>
        <h3>AI Tools</h3>
        <p>Artificial Intelligence</p>
    </button>

    <button class="category" onclick="openMenu('group',this)">
        <div class="category-icon">👥</div>
        <h3>Group Tools</h3>
        <p>Admin & Protection</p>
    </button>

    <button class="category" onclick="openMenu('games',this)">
        <div class="category-icon">🎮</div>
        <h3>Games</h3>
        <p>Fun & Entertainment</p>
    </button>

    <button class="category" onclick="openMenu('profile',this)">
        <div class="category-icon">👤</div>
        <h3>Profile</h3>
        <p>Account & Status</p>
    </button>

    <button class="category" onclick="openMenu('settings',this)">
        <div class="category-icon">⚙️</div>
        <h3>Settings</h3>
        <p>Bot Configuration</p>
    </button>

</div>

<div class="submenu" id="submenu">
    <h3 id="submenuTitle"></h3>
    <div id="submenuCommands"></div>
</div>

<div class="footer">
    👑 YASHI HALLS MINI<br>
    MINI PLAN • WHATSAPP ASSISTANT<br>
    POWERED BY YASHI HALLS
</div>
</div>
<script>
const menus = {
download: {
title: "📥 DOWNLOAD MENU",
commands: [
".song",
".video",
".play",
".audio",
".ytsearch",
".tt",
".fb",
".ig",
".twitter",
".apk",
".lyrics"
]
},

ai: {
title: "🤖 AI TOOLS MENU",
commands: [
".ai",
".gemini",
".imagine",
".translate",
".write",
".code",
".ocr",
".transcribe"
]
},

group: {
title: "👥 GROUP TOOLS MENU",
commands: [
".kick",
".add",
".promote",
".demote",
".mute",
".unmute",
".antilink",
".warn",
".link"
]
},

games: {
title: "🎮 GAMES MENU",
commands: [
".quiz",
".guess",
".slot",
".tictactoe"
]
},

profile: {
title: "👤 PROFILE MENU",
commands: [
".me",
".status",
".setstatus",
".setdp",
".setname",
".setbio"
]
},

settings: {
title: "⚙️ SETTINGS MENU",
commands: [
".menu",
".ping",
".alive",
".owner",
".public",
".private",
".restart"
]
}
};

function openMenu(name, element) {
const submenu = document.getElementById("submenu");
const title = document.getElementById("submenuTitle");
const commands = document.getElementById("submenuCommands");

if (element.classList.contains("active")) {
element.classList.remove("active");
submenu.classList.remove("show");
return;
}

document.querySelectorAll(".category").forEach(card => {
card.classList.remove("active");
});

element.classList.add("active");

title.textContent = menus[name].title;
commands.innerHTML = "";

menus[name].commands.forEach((command, index) => {
const item = document.createElement("div");
item.className = "command";

const number = String(index + 1).padStart(2, "0");
item.innerHTML = "<span>" + number + ".</span> " + command;

commands.appendChild(item);
});

submenu.classList.add("show");
}
</script>
</body>
</html>`;
