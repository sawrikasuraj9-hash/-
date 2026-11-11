import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Runtime safeguard for whatsapp-rust-bridge package exports
try {
  const rustBridgePkg = 'node_modules/whatsapp-rust-bridge/package.json';
  if (fs.existsSync(rustBridgePkg)) {
    const raw = fs.readFileSync(rustBridgePkg, 'utf8');
    if (!raw.includes('"main"')) {
      const parsed = JSON.parse(raw);
      parsed.main = './dist/index.js';
      if (parsed.exports && parsed.exports['.']) {
        parsed.exports['.'].default = './dist/index.js';
        parsed.exports['.'].require = './dist/index.js';
      }
      fs.writeFileSync(rustBridgePkg, JSON.stringify(parsed, null, 2));
    }
  }
} catch (e) {}

import { botEngine, getBotEngine, autoBootAllRegisteredBots } from './botEngine';
import { askGemini } from './geminiService';
import { getPluginStatusList } from './pluginService';
import { adminStore } from './adminStore';
import { ensureYtDlpBinary, cleanStaleTempFiles } from './audioService';
import {
  saveAudioFile,
  deleteAudioFile,
  getAudioFileStream,
  validateAudioBuffer,
  formatBytes,
} from './voiceService';
import { normalizeWhatsAppNumber } from '../utils/phone';
import { gatewayService } from './gatewayService';
import { generateDownloadStatusHtml } from './htmlAppHelper';

dotenv.config();

const rootDir = process.cwd();

async function startServer() {
  const app = express();
  const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  // CORS configuration to support custom domains & Cloudflare Workers (connect.yashi-halls.workers.dev)
  app.use((req: Request, res: Response, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Multi-Tenant Isolation Helper: Resolves customer's private BotEngine based on authenticated UID
  const getEngineForReq = (req: Request) => {
    const rawId = req.headers['x-user-id'] || req.query.userId || req.body?.userId;
    const cleanId = typeof rawId === 'string' && rawId.trim() && rawId !== 'null' && rawId !== 'undefined'
      ? rawId.trim()
      : 'primary';
    return getBotEngine(cleanId);
  };

  // Health check endpoint
  // 24/7 Cloud Keep-Alive Endpoint for UptimeRobot / Cron / Cloudflare Workers
  app.get('/api/keepalive', (req: Request, res: Response) => {
    const primaryEngine = getBotEngine('primary');
    res.json({
      status: 'active',
      keepAlivePulse: true,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      botState: primaryEngine.state.connectionStatus,
      isOnline: primaryEngine.state.isOnline,
      message: '24/7 Always-On heartbeat acknowledged. Cloud Run container is kept awake!'
    });
  });

  // --- ANDROID BANK NOTIFICATION GATEWAY ENDPOINTS ---
  app.get('/api/gateway/status', (req: Request, res: Response) => {
    try {
      const status = gatewayService.getStatus();
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to get gateway status' });
    }
  });

  // Webhook endpoint called by Android APK
  app.post('/api/gateway/bank-notification', (req: Request, res: Response) => {
    try {
      const { token, deviceId, deviceName, title, message, sender, rawText, batteryLevel } = req.body;
      const result = gatewayService.registerNotification({
        token,
        deviceId: deviceId || 'android-device',
        deviceName: deviceName || 'Android Phone',
        title,
        message,
        sender,
        rawText,
        batteryLevel,
      });

      if (result.matchedSlip) {
        botEngine.addLog(
          'INFO',
          `🎉 [PAYMENT AUTO-VERIFIED] Bank SMS matched customer ${result.matchedSlip.userName}! Amount: LKR ${result.matchedSlip.amount}, Ref: ${result.matchedSlip.ref}`
        );
      } else {
        botEngine.addLog(
          'INFO',
          `📥 [BANK ALERT SYNCED] ${result.notification.bank}: LKR ${result.notification.amount} (Ref: ${result.notification.ref})`
        );
      }

      res.json({ success: true, notification: result.notification, matched: Boolean(result.matchedSlip) });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to process bank alert' });
    }
  });

  // Test simulation endpoint for testing the matching pipeline directly from Dashboard
  app.post('/api/gateway/test-simulate', (req: Request, res: Response) => {
    try {
      const { amount, ref, bank } = req.body;
      const result = gatewayService.simulateTestNotification(Number(amount) || 1500, ref, bank);
      botEngine.addLog('INFO', `🧪 [GATEWAY TEST] Simulated incoming ${result.notification.bank} SMS: LKR ${result.notification.amount} (Ref: ${result.notification.ref})`);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Simulation failed' });
    }
  });

  // Rules management
  app.get('/api/gateway/rules', (req: Request, res: Response) => {
    res.json({ success: true, data: gatewayService.getRules() });
  });

  app.post('/api/gateway/rules', (req: Request, res: Response) => {
    try {
      const { name, sender, keyword, ignoreKeyword } = req.body;
      const newRule = gatewayService.addRule({ name, sender, keyword, ignoreKeyword, active: true });
      res.json({ success: true, data: newRule });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to add rule' });
    }
  });

  app.post('/api/gateway/rules/:id/toggle', (req: Request, res: Response) => {
    const updated = gatewayService.toggleRule(req.params.id);
    if (updated) return res.json({ success: true, data: updated });
    res.status(404).json({ success: false, message: 'Rule not found' });
  });

  app.delete('/api/gateway/rules/:id', (req: Request, res: Response) => {
    const success = gatewayService.deleteRule(req.params.id);
    res.json({ success });
  });

  // Bot Token and Gateway Configuration
  app.post('/api/gateway/config', (req: Request, res: Response) => {
    try {
      const { botToken, pairedBotNumber } = req.body;
      const config = gatewayService.setConfig(botToken, pairedBotNumber);
      res.json({ success: true, data: config });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update config' });
    }
  });

  app.get('/api/health', (req: Request, res: Response) => {
    const memory = process.memoryUsage();
    res.json({
      status: 'ok',
      service: 'YASHI HALLS — WhatsApp Bot Management Engine (MINI • PRO • BUSINESS)',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      memory: {
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
      },
      botState: botEngine.getState().connectionStatus,
    });
  });

  // Get live Bot State and metrics (isolated per customer)
  app.get('/api/bot/status', (req: Request, res: Response) => {
    try {
      const engine = getEngineForReq(req);
      const state = engine.getState();
      res.json({
        success: true,
        data: state,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to fetch bot state' });
    }
  });

  // Get live runtime logs (isolated per customer)
  app.get('/api/bot/logs', (req: Request, res: Response) => {
    try {
      const engine = getEngineForReq(req);
      const logs = engine.getLogs();
      res.json({
        success: true,
        data: logs,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to fetch bot logs' });
    }
  });

  // Start Bot instance (isolated per customer)
  app.post('/api/bot/start', async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.body || {};
      const cleanPhone = phoneNumber ? normalizeWhatsAppNumber(phoneNumber) : undefined;
      const engine = getEngineForReq(req);
      const result = await engine.start(cleanPhone);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to start bot' });
    }
  });

  // Stop Bot instance (isolated per customer)
  app.post('/api/bot/stop', async (req: Request, res: Response) => {
    try {
      const engine = getEngineForReq(req);
      const result = await engine.stop();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to stop bot' });
    }
  });

  // Restart Bot instance (isolated per customer)
  app.post('/api/bot/restart', async (req: Request, res: Response) => {
    try {
      const engine = getEngineForReq(req);
      const result = await engine.restart();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to restart bot' });
    }
  });

  // Request WhatsApp Pairing Code for phone number (isolated per customer)
  app.post(['/api/bot/pair/code', '/api/bot/pair'], async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ success: false, message: 'Phone number is required.' });
      }

      const cleanPhone = normalizeWhatsAppNumber(phoneNumber);
      if (!cleanPhone || cleanPhone.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format. Enter e.g. 0740712934 or 94740712934.',
        });
      }

      const engine = getEngineForReq(req);
      const result = await engine.requestPairingCode(cleanPhone);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to request pairing code' });
    }
  });

  // Request QR Code pairing mode (isolated per customer)
  app.post('/api/bot/pair/qr', async (req: Request, res: Response) => {
    try {
      const { forceNew } = req.body || {};
      const engine = getEngineForReq(req);
      const result = await engine.generateQrCode(Boolean(forceNew));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to generate QR Code' });
    }
  });

  // Clear Session & Credentials for clean re-pairing (isolated per customer)
  app.post('/api/bot/clear-session', async (req: Request, res: Response) => {
    try {
      const engine = getEngineForReq(req);
      const result = await engine.clearSession();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to clear session' });
    }
  });

  // Set Bot Plan (MINI, PRO, or BUSINESS - isolated per customer)
  app.post('/api/bot/plan', (req: Request, res: Response) => {
    try {
      const { plan } = req.body;
      if (plan !== 'mini' && plan !== 'pro' && plan !== 'business') {
        return res.status(400).json({ success: false, message: 'Invalid plan. Allowed: "mini", "pro", or "business".' });
      }
      const engine = getEngineForReq(req);
      const updatedState = engine.setPlan(plan);
      res.json({ success: true, plan, data: updatedState });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update plan' });
    }
  });

  // Secure Purchase Plan with Coin Deduction & Validation (isolated per customer)
  const PLAN_PRICES: Record<string, number> = {
    mini: 0,
    pro: 10,
    business: 30,
  };

  app.post('/api/bot/purchase-plan', (req: Request, res: Response) => {
    try {
      const { plan, userCoins } = req.body;
      if (plan !== 'mini' && plan !== 'pro' && plan !== 'business') {
        return res.status(400).json({ success: false, message: 'Invalid plan. Allowed: "mini", "pro", or "business".' });
      }

      const cost = PLAN_PRICES[plan] ?? 0;
      const currentCoins = Number(userCoins) || 0;

      if (cost > 0 && currentCoins < cost) {
        return res.status(400).json({
          success: false,
          message: `Insufficient coins in wallet! ${cost} coins required, but you only have ${currentCoins} coins.`,
          requiredCoins: cost,
          currentCoins,
        });
      }

      const remainingCoins = Math.max(0, currentCoins - cost);
      const engine = getEngineForReq(req);
      const updatedState = engine.setPlan(plan);

      res.json({
        success: true,
        plan,
        coinsDeducted: cost,
        remainingCoins,
        transaction: {
          id: `tx-${Date.now()}`,
          title: `Purchased YASHI HALLS ${plan.toUpperCase()} Plan`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amount: -cost,
          category: 'purchase',
        },
        data: updatedState,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to process plan purchase' });
    }
  });

  // Sync WhatsApp Bot Profile Picture to Brand Logo (isolated per customer)
  app.post('/api/bot/sync-profile-pic', async (req: Request, res: Response) => {
    try {
      const { logoUrl } = req.body || {};
      const engine = getEngineForReq(req);
      const result = await engine.syncProfilePictureWithLogo(logoUrl);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to sync profile picture' });
    }
  });

  // Reset Quotas (daily refresh - isolated per customer)
  app.post('/api/bot/reset-quotas', (req: Request, res: Response) => {
    try {
      const engine = getEngineForReq(req);
      const quotas = engine.resetQuotas();
      res.json({ success: true, quotas });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to reset quotas' });
    }
  });

  // Get Bot Configuration (isolated per customer)
  app.get('/api/bot/config', (req: Request, res: Response) => {
    try {
      const engine = getEngineForReq(req);
      const config = engine.getState().config;
      res.json({ success: true, data: config });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to read config' });
    }
  });

  // Update Bot Configuration (isolated per customer)
  app.post('/api/bot/config', (req: Request, res: Response) => {
    try {
      const engine = getEngineForReq(req);
      const { userId, ...configUpdates } = req.body;
      const updated = engine.updateConfig(configUpdates);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update config' });
    }
  });

  // Get registered plugins and provider status
  app.get('/api/plugins', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: getPluginStatusList(),
    });
  });

  // Server-side AI Chat with Gemini API (protects API Key)
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { prompt, context } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
      }

      const result = await askGemini(prompt, context);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'AI request failed' });
    }
  });

  const AUTHORIZED_ADMIN_EMAILS = [
    'sawrikasuraj9@gmail.com',
    'sawrikasuraj759@gmail.com',
    'epavenav@gmail.com'
  ];

  const verifyAdmin = (req: Request, res: Response, next: () => void) => {
    const rawEmail = req.headers['x-admin-email'] || req.query.adminEmail || req.body?.adminEmail;
    const cleanEmail = String(rawEmail || '').trim().toLowerCase();

    if (!cleanEmail || !AUTHORIZED_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(cleanEmail)) {
      adminStore.addAuditLog(
        cleanEmail || 'anonymous',
        'UNAUTHORIZED_ADMIN_ATTEMPT',
        `Blocked attempt to access ${req.method} ${req.path} from IP ${req.ip || 'unknown'}`
      );
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Verified Master Admin permissions required for this action.',
      });
    }

    (req as any).adminEmail = cleanEmail;
    next();
  };

  // --- MANUAL PURCHASE REQUESTS (PUBLIC / CUSTOMER & ADMIN) ---

  // Customer submits a manual purchase request for PRO/BUSINESS or Coins
  app.post('/api/purchase-requests/create', (req: Request, res: Response) => {
    try {
      const {
        customerId,
        customerEmail,
        customerName,
        itemType,
        itemName,
        planId,
        coinAmount,
        priceLkr,
        priceFormatted,
      } = req.body;

      if (!customerEmail || !itemType || !itemName) {
        return res.status(400).json({
          success: false,
          message: 'Missing required purchase request details.',
        });
      }

      const newReq = adminStore.createPurchaseRequest({
        customerId: customerId || `cust-${Date.now()}`,
        customerEmail: String(customerEmail).trim().toLowerCase(),
        customerName: customerName || customerEmail.split('@')[0],
        itemType,
        itemName,
        planId,
        coinAmount: Number(coinAmount) || undefined,
        priceLkr: Number(priceLkr) || 0,
        priceFormatted: priceFormatted || `Rs ${Number(priceLkr || 0).toLocaleString()}`,
      });

      // Synchronize customer profile into admin customer directory
      adminStore.syncCustomer(
        newReq.customerId,
        newReq.customerEmail,
        newReq.customerName
      );

      res.json({
        success: true,
        request: newReq,
        adminWhatsapp: adminStore.getSettings().adminWhatsapp,
        message: 'Manual purchase request registered successfully. Status: PENDING ADMIN APPROVAL.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to submit purchase request' });
    }
  });

  // Get user's own purchase requests
  app.get('/api/purchase-requests/user/:email', (req: Request, res: Response) => {
    try {
      const email = String(req.params.email).trim().toLowerCase();
      const all = adminStore.getPurchaseRequests();
      const userRequests = all.filter((r) => r.customerEmail.toLowerCase() === email);
      res.json({ success: true, data: userRequests });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to fetch requests' });
    }
  });

  // Get live customer profile by email (used by client to sync approved coins and plans)
  app.get('/api/customer/profile/:email', (req: Request, res: Response) => {
    try {
      const email = String(req.params.email || '').trim().toLowerCase();
      const cust = adminStore.getCustomer(email);
      if (!cust) {
        return res.json({ success: false, message: 'Customer not found' });
      }
      res.json({ success: true, customer: cust });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Error' });
    }
  });

  // --- ADMIN PROTECTED ROUTES ---

  // Verify Admin Permissions
  app.post('/api/admin/verify', verifyAdmin, (req: Request, res: Response) => {
    res.json({
      success: true,
      isAdmin: true,
      email: (req as any).adminEmail,
      message: 'Verified Master Administrator privileges.',
    });
  });

  // Admin Overview Stats
  app.get('/api/admin/overview', verifyAdmin, (req: Request, res: Response) => {
    try {
      const stats = adminStore.getOverviewStats();
      const botState = botEngine.getState();
      res.json({
        success: true,
        data: {
          ...stats,
          botConnectionStatus: botState.connectionStatus,
          isBotOnline: botState.isOnline,
          pairedNumber: botState.pairedNumber,
          engineUptimeSeconds: botState.uptimeSeconds,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to get stats' });
    }
  });

  // Admin Customers list
  app.get('/api/admin/customers', verifyAdmin, (req: Request, res: Response) => {
    try {
      const customers = adminStore.getCustomers();
      res.json({ success: true, data: customers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to get customers' });
    }
  });

  // Admin sync/register customer
  app.post('/api/admin/customers/sync', (req: Request, res: Response) => {
    try {
      const { id, email, username, plan, coins } = req.body;
      if (!email) return res.status(400).json({ success: false, message: 'Email required' });
      const record = adminStore.syncCustomer(id, email, username, plan, coins);
      res.json({ success: true, data: record });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to sync' });
    }
  });

  // Admin Suspend / Unsuspend Customer
  app.post('/api/admin/customers/suspend', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { customerId, isSuspended } = req.body;
      const adminEmail = (req as any).adminEmail;
      const updated = adminStore.setCustomerSuspended(customerId, Boolean(isSuspended), adminEmail);
      if (!updated) return res.status(404).json({ success: false, message: 'Customer not found' });
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update' });
    }
  });

  // Admin Update Customer Note
  app.post('/api/admin/customers/note', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { customerId, note } = req.body;
      const adminEmail = (req as any).adminEmail;
      const updated = adminStore.updateCustomerNote(customerId, String(note || ''), adminEmail);
      if (!updated) return res.status(404).json({ success: false, message: 'Customer not found' });
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update note' });
    }
  });

  // Admin Delete Customer
  app.delete('/api/admin/customers/:id', verifyAdmin, (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;
      const adminEmail = (req as any).adminEmail;
      const ok = adminStore.deleteCustomer(customerId, adminEmail);
      if (!ok) return res.status(404).json({ success: false, message: 'Customer not found' });
      res.json({ success: true, message: 'Customer permanently deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to delete customer' });
    }
  });

  // Admin Modify Coins (Add / Deduct)
  app.post('/api/admin/coins/adjust', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { customerId, action, amount, reason } = req.body;
      const adminEmail = (req as any).adminEmail;

      if (action !== 'ADD' && action !== 'DEDUCT') {
        return res.status(400).json({ success: false, message: 'Action must be "ADD" or "DEDUCT".' });
      }

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
      }

      const result = adminStore.modifyCoins(customerId, action, numAmount, reason, adminEmail);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to adjust coins' });
    }
  });

  // Admin View Purchase Requests
  app.get('/api/admin/purchase-requests', verifyAdmin, (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      const list = adminStore.getPurchaseRequests(status);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to fetch purchase requests' });
    }
  });

  // Admin Fulfill / Approve / Reject Purchase Request
  app.post('/api/admin/purchase-requests/fulfill', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { requestId, action, adminNote } = req.body;
      const adminEmail = (req as any).adminEmail;

      if (action !== 'APPROVE' && action !== 'REJECT') {
        return res.status(400).json({ success: false, message: 'Action must be APPROVE or REJECT' });
      }

      const result = adminStore.fulfillPurchaseRequest(requestId, action, adminEmail, adminNote);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to fulfill request' });
    }
  });

  // Admin View Audit Logs
  app.get('/api/admin/audit-logs', verifyAdmin, (req: Request, res: Response) => {
    try {
      const logs = adminStore.getAuditLogs();
      res.json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to get audit logs' });
    }
  });

  // Admin System Settings (Get & Update)
  app.get('/api/admin/settings', verifyAdmin, (req: Request, res: Response) => {
    try {
      const settings = adminStore.getSettings();
      res.json({ success: true, data: settings });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to get settings' });
    }
  });

  app.post('/api/admin/settings', verifyAdmin, (req: Request, res: Response) => {
    try {
      const adminEmail = (req as any).adminEmail;
      const updated = adminStore.updateSettings(req.body, adminEmail);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update settings' });
    }
  });

  // Public Site Design Endpoint (used by Web Frontend & CSS Injector)
  app.get('/api/site-design', (_req: Request, res: Response) => {
    try {
      const design = adminStore.getSiteDesign();
      res.json({ success: true, data: design });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to get site design' });
    }
  });

  // Admin Site Design & CSS Studio (Get & Update)
  app.get('/api/admin/site-design', verifyAdmin, (_req: Request, res: Response) => {
    try {
      const design = adminStore.getSiteDesign();
      res.json({ success: true, data: design });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to get site design' });
    }
  });

  app.post('/api/admin/site-design', verifyAdmin, (req: Request, res: Response) => {
    try {
      const adminEmail = (req as any).adminEmail;
      const updated = adminStore.updateSiteDesign(req.body, adminEmail);
      res.json({ success: true, data: updated, message: 'Website Design & CSS updated successfully!' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update site design' });
    }
  });

  // Admin Bot Studio & Commands Engine (Get & Update)
  app.get('/api/admin/bot-studio', verifyAdmin, (_req: Request, res: Response) => {
    try {
      const studio = adminStore.getBotStudio();
      res.json({ success: true, data: studio });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to get bot studio' });
    }
  });

  app.post('/api/admin/bot-studio', verifyAdmin, (req: Request, res: Response) => {
    try {
      const adminEmail = (req as any).adminEmail;
      const updated = adminStore.updateBotStudio(req.body, adminEmail);
      
      // Hot-apply changes to active BotEngine
      try {
        const engine = getEngineForReq(req);
        engine.updateConfig({
          botName: updated.botName,
          botLogoUrl: updated.botLogoUrl,
          prefix: updated.prefix,
          ownerNumber: updated.ownerNumber,
          ...(updated.featureFlags || {})
        });
      } catch (engineErr) {
        console.warn('[AppServer] Hot-sync to active bot engine warning:', engineErr);
      }

      res.json({ success: true, data: updated, message: 'Bot Engine & Commands Studio saved successfully!' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update bot studio' });
    }
  });

  // 1. Audio Streaming Endpoint (supports HTTP 206 Partial Content Range for smooth browser playback & seeking)
  app.get('/api/voice-replies/audio/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const voiceReply = adminStore.getVoiceReply(id);
      if (!voiceReply) {
        return res.status(404).json({ success: false, message: 'Voice Reply record not found' });
      }

      const streamInfo = getAudioFileStream(voiceReply.audioPath);
      if (!streamInfo || !fs.existsSync(streamInfo.filePath)) {
        return res.status(404).json({ success: false, message: 'Audio file missing from storage' });
      }

      const stat = fs.statSync(streamInfo.filePath);
      const totalSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
        const chunkSize = end - start + 1;
        const fileStream = fs.createReadStream(streamInfo.filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': streamInfo.mimeType,
        });
        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': totalSize,
          'Content-Type': streamInfo.mimeType,
          'Accept-Ranges': 'bytes',
        });
        fs.createReadStream(streamInfo.filePath).pipe(res);
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Streaming audio failed' });
    }
  });

  // 2. Admin Get All Voice Replies
  app.get('/api/admin/voice-replies', verifyAdmin, (req: Request, res: Response) => {
    try {
      const scope = req.query.scope as string;
      const list = adminStore.getVoiceReplies(scope);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to get voice replies' });
    }
  });

  // 3. Admin Create & Upload Voice Reply
  app.post('/api/admin/voice-replies/create', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const adminEmail = (req as any).adminEmail;
      const {
        name,
        triggers,
        audioBase64,
        audioFileName,
        language = 'Both',
        scope = 'GLOBAL',
        enabled = true,
        customerId,
        customerEmail,
      } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Reply Name is required.' });
      }

      let parsedTriggers: string[] = [];
      if (Array.isArray(triggers)) {
        parsedTriggers = triggers.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof triggers === 'string') {
        parsedTriggers = triggers
          .split(/[,;\n]/)
          .map((t) => t.trim())
          .filter(Boolean);
      }

      if (parsedTriggers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one Trigger Message is required (e.g. "hi, hello, හායි").',
        });
      }

      if (!audioBase64 || !audioFileName) {
        return res.status(400).json({ success: false, message: 'Audio file (MP3/M4A/WAV/OGG) is required.' });
      }

      // Decode base64
      const base64Data = audioBase64.replace(/^data:audio\/[a-zA-Z0-9_-]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const validation = validateAudioBuffer(buffer, audioFileName);
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.error || 'Invalid audio file.' });
      }

      const prefixId = `vr_${Date.now()}`;
      const saved = await saveAudioFile(buffer, audioFileName, prefixId);

      const record = adminStore.createVoiceReply(
        {
          name: name.trim(),
          triggers: parsedTriggers,
          audioFileName: saved.fileName,
          audioPath: saved.filePath,
          mimeType: saved.mimeType,
          fileSizeBytes: saved.size,
          fileSizeFormatted: formatBytes(saved.size),
          language,
          enabled: Boolean(enabled),
          scope: scope === 'CUSTOMER' ? 'CUSTOMER' : 'GLOBAL',
          customerId: customerId || undefined,
          customerEmail: customerEmail || undefined,
        },
        adminEmail
      );

      res.json({
        success: true,
        message: `Voice Reply '${record.name}' saved and connected to WhatsApp Bot successfully!`,
        data: record,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to save voice reply' });
    }
  });

  // 4. Admin Update Voice Reply Details
  app.put('/api/admin/voice-replies/:id', verifyAdmin, (req: Request, res: Response) => {
    try {
      const adminEmail = (req as any).adminEmail;
      const { id } = req.params;
      const { name, triggers, language, scope, enabled } = req.body;

      let parsedTriggers: string[] | undefined = undefined;
      if (Array.isArray(triggers)) {
        parsedTriggers = triggers.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof triggers === 'string') {
        parsedTriggers = triggers.split(/[,;\n]/).map((t) => t.trim()).filter(Boolean);
      }

      const updated = adminStore.updateVoiceReply(
        id,
        {
          ...(name ? { name: String(name).trim() } : {}),
          ...(parsedTriggers ? { triggers: parsedTriggers } : {}),
          ...(language ? { language } : {}),
          ...(scope ? { scope } : {}),
          ...(typeof enabled === 'boolean' ? { enabled } : {}),
        },
        adminEmail
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Voice Reply not found' });
      }

      res.json({ success: true, message: 'Voice Reply updated successfully.', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update' });
    }
  });

  // 5. Admin Toggle Enabled
  app.post('/api/admin/voice-replies/:id/toggle', verifyAdmin, (req: Request, res: Response) => {
    try {
      const adminEmail = (req as any).adminEmail;
      const { id } = req.params;
      const { enabled } = req.body;
      const updated = adminStore.toggleVoiceReply(id, Boolean(enabled), adminEmail);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Voice Reply not found' });
      }
      res.json({
        success: true,
        data: updated,
        message: `Voice Reply is now ${updated.enabled ? 'Enabled' : 'Disabled'}.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to toggle status' });
    }
  });

  // 6. Admin Replace Audio File
  app.post('/api/admin/voice-replies/:id/replace-audio', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const adminEmail = (req as any).adminEmail;
      const { id } = req.params;
      const { audioBase64, audioFileName } = req.body;

      const current = adminStore.getVoiceReply(id);
      if (!current) {
        return res.status(404).json({ success: false, message: 'Voice Reply not found' });
      }

      if (!audioBase64 || !audioFileName) {
        return res.status(400).json({ success: false, message: 'New audio file payload is required' });
      }

      const base64Data = audioBase64.replace(/^data:audio\/[a-zA-Z0-9_-]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const validation = validateAudioBuffer(buffer, audioFileName);
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.error || 'Invalid audio file.' });
      }

      const prefixId = `vr_${Date.now()}`;
      const saved = await saveAudioFile(buffer, audioFileName, prefixId);

      // Delete old file
      deleteAudioFile(current.audioPath);

      const updated = adminStore.updateVoiceReply(
        id,
        {
          audioFileName: saved.fileName,
          audioPath: saved.filePath,
          mimeType: saved.mimeType,
          fileSizeBytes: saved.size,
          fileSizeFormatted: formatBytes(saved.size),
        },
        adminEmail
      );

      res.json({ success: true, message: 'Audio file replaced successfully.', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to replace audio' });
    }
  });

  // 7. Admin Delete Voice Reply
  app.delete('/api/admin/voice-replies/:id', verifyAdmin, (req: Request, res: Response) => {
    try {
      const adminEmail = (req as any).adminEmail;
      const { id } = req.params;
      const current = adminStore.getVoiceReply(id);
      if (!current) {
        return res.status(404).json({ success: false, message: 'Voice Reply not found' });
      }

      deleteAudioFile(current.audioPath);
      adminStore.deleteVoiceReply(id, adminEmail);

      res.json({ success: true, message: `Voice Reply '${current.name}' deleted successfully.` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to delete voice reply' });
    }
  });

  // 8. Admin Test Trigger Match Simulator
  app.post('/api/admin/voice-replies/test-trigger', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { message, customerId } = req.body;
      const result = adminStore.findMatchingVoiceReply(String(message || ''), customerId);
      res.json({
        success: true,
        matched: Boolean(result.match),
        match: result.match,
        matchedTrigger: result.matchedTrigger,
        inputMessage: message,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Test trigger failed' });
    }
  });

  // 9. Customer-facing Voice Replies and Bot Toggle
  app.get('/api/voice-replies/customer', (req: Request, res: Response) => {
    try {
      const customerId = req.query.customerId as string;
      const list = adminStore.getVoiceReplies(undefined, customerId);
      res.json({
        success: true,
        data: list,
        voiceAutoReplyEnabled: botEngine.getState().config.voiceAutoReplyEnabled,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to fetch customer voice replies' });
    }
  });

  app.post('/api/voice-replies/customer/toggle', (req: Request, res: Response) => {
    try {
      const { enabled } = req.body;
      const updated = botEngine.updateConfig({ voiceAutoReplyEnabled: Boolean(enabled) });
      res.json({ success: true, voiceAutoReplyEnabled: updated.voiceAutoReplyEnabled });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to toggle voice auto reply' });
    }
  });

  // --- INTERACTIVE NEON WEB MENU UI ---
  app.get(['/test1', '/test1.html', '/menu/test1'], (req: Request, res: Response) => {
    const test1FilePath = path.resolve(rootDir, 'public', 'test1.html');
    if (fs.existsSync(test1FilePath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(test1FilePath);
    } else {
      res.status(404).send('Test1 Menu UI not found');
    }
  });

  app.get(['/menu', '/menu.html'], (req: Request, res: Response) => {
    const menuFilePath = path.resolve(rootDir, 'public', 'menu.html');
    if (fs.existsSync(menuFilePath)) {
      res.sendFile(menuFilePath);
    } else {
      res.status(404).send('Menu UI not found');
    }
  });

  app.get(['/interactive-menu', '/interactive-menu.html', '/menutest'], (req: Request, res: Response) => {
    const candidates = [
      path.resolve(rootDir, 'public', 'interactive-menu.html'),
      path.resolve(rootDir, 'dist', 'interactive-menu.html'),
      path.resolve(process.cwd(), 'public', 'interactive-menu.html'),
      path.resolve(process.cwd(), 'dist', 'interactive-menu.html'),
    ];
    for (const candidatePath of candidates) {
      if (fs.existsSync(candidatePath)) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.sendFile(candidatePath);
      }
    }
    res.status(404).send('Interactive Menu UI not found');
  });

  // In-Browser Live Preview of the Download Status Card (Searching, Downloading, Ready)
  app.get(['/preview/download-card', '/download-card-preview'], (req: Request, res: Response) => {
    const rawStatus = String(req.query.status || 'success').toUpperCase();
    const status = (rawStatus === 'SEARCHING' || rawStatus === 'DOWNLOADING' || rawStatus === 'SUCCESS' || rawStatus === 'ERROR')
      ? rawStatus as any
      : 'SUCCESS';
    const type = (String(req.query.type || 'AUDIO').toUpperCase() === 'VIDEO') ? 'VIDEO' : 'AUDIO';
    const markup = generateDownloadStatusHtml({
      botName: 'YASHI HALLS MINI',
      type,
      query: String(req.query.query || 'Manike Mage Hithe'),
      title: String(req.query.title || (type === 'VIDEO' ? 'Yohani - Manike Mage Hithe (Official HD Video)' : 'Yohani - Manike Mage Hithe (Official 320kbps MP3)')),
      status,
      progress: status === 'SEARCHING' ? 30 : status === 'DOWNLOADING' ? 75 : 100,
      duration: '03:42',
      bitrate: '320kbps MP3 Ultra HD',
      quality: '720p HD MP4',
      fileSize: '8.45 MB',
      prefix: '.',
      height: 390,
    });
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Download Card Live Preview • YASHI HALLS</title>
  <style>
    body {
      margin: 0;
      padding: 30px 14px;
      background: radial-gradient(circle at 50% 10%, #150a2b 0%, #05020c 100%);
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .header-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #e9d5ff;
      margin-bottom: 6px;
      text-transform: uppercase;
      text-align: center;
    }
    .header-sub {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 22px;
      text-align: center;
    }
    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .tab {
      padding: 9px 18px;
      border-radius: 999px;
      text-decoration: none;
      font-size: 12px;
      font-weight: 800;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.04);
      transition: all 0.25s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tab:hover {
      border-color: #a855f7;
      color: #fff;
    }
    .tab.active {
      background: linear-gradient(135deg, #9333ea, #6366f1);
      color: #fff;
      border-color: #c084fc;
      box-shadow: 0 0 16px rgba(168, 85, 247, 0.6);
    }
    .card-wrap {
      width: 100%;
      max-width: 410px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
      border-radius: 20px;
    }
  </style>
</head>
<body>
  <div class="header-title">⚡ YASHI HALLS • LIVE DOWNLOAD CARD PREVIEW</div>
  <div class="header-sub">පියවර 3 ක් ඔස්සේ WhatsApp ඇතුළත දිස්වන සජීවී කාඩ්පත</div>

  <div class="tabs">
    <a class="tab ${status === 'SEARCHING' ? 'active' : ''}" href="/preview/download-card?status=searching">1. 🔍 SEARCHING (සෙවීම)</a>
    <a class="tab ${status === 'DOWNLOADING' ? 'active' : ''}" href="/preview/download-card?status=downloading">2. 📥 DOWNLOADING (බාගත වීම)</a>
    <a class="tab ${status === 'SUCCESS' ? 'active' : ''}" href="/preview/download-card?status=success">3. ✨ DOWNLOAD READY (සූදානම්)</a>
  </div>

  <div class="card-wrap">
    ${markup}
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Direct Menu Command Dispatcher from WhatsApp In-App Webview
  app.post('/api/bot/execute-menu-command', async (req: Request, res: Response) => {
    try {
      const { command, jid, phone, userId } = req.body;
      if (!command) {
        return res.status(400).json({ success: false, message: 'Command is required' });
      }
      const engine = getBotEngine(userId || 'primary');
      if (!engine || !engine.sock) {
        return res.status(503).json({ success: false, message: 'WhatsApp Bot engine is not currently connected' });
      }
      const targetJid = jid || (phone ? `${phone.replace(/\D/g, '')}@s.whatsapp.net` : null) || (engine.state.pairedNumber ? `${engine.state.pairedNumber}@s.whatsapp.net` : null);
      if (!targetJid) {
        return res.status(400).json({ success: false, message: 'Target WhatsApp recipient JID is missing' });
      }

      const prefix = engine.state.config.prefix || '.';
      const cleanCmd = command.startsWith(prefix) ? command : `${prefix}${command.replace(/^[./!#]/, '')}`;

      const syntheticMsg = {
        key: {
          remoteJid: targetJid,
          fromMe: false,
          id: `MENU_WEB_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          participant: targetJid,
        },
        message: {
          conversation: cleanCmd,
        },
        pushName: 'Interactive Menu User',
        messageTimestamp: Math.floor(Date.now() / 1000),
      };

      engine.addLog('INFO', `⚡ [INTERACTIVE MENU TRIGGER] Incoming webview command '${cleanCmd}' for ${targetJid.split('@')[0]}`);
      // Process command directly inside engine
      await engine.handleIncomingMessage(syntheticMsg);

      res.json({
        success: true,
        message: `Command '${cleanCmd}' executed successfully`,
        jid: targetJid,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Execution failed' });
    }
  });


  // --- VITE DEV MIDDLEWARE OR PRODUCTION STATIC SERVING ---
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(rootDir, 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api/')) return next();
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output dist not found');
      }
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 [YASHI HALLS SERVER] Running on port ${PORT} (http://localhost:${PORT})`);
    console.log(`🤖 [BOT ENGINE] Ready to pair and host WhatsApp Multi-Device instance.`);

    // 1. Auto-verify & provision standalone audio/media engine binary
    ensureYtDlpBinary().catch((err) => {
      console.warn("[AUDIO ENGINE] yt-dlp init notice:", err?.message || err);
    });

    // 2. Initial temp garbage collection sweep
    cleanStaleTempFiles();

    // 3. Auto-resume all existing registered WhatsApp bot sessions (24/7 Always-On)
    autoBootAllRegisteredBots().catch((err) => {
      console.warn("[BOT ENGINE] autoBoot notice:", err?.message || err);
    });

    // 4. Safe passive heartbeat (60s) to keep event loop stable without consuming QPS/BW quota
    setInterval(() => {
      // Passive no-op timer keeps Node event loop active without network traffic
    }, 60000);
  });
}

export { startServer };

