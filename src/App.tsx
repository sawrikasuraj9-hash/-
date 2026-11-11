/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { SidebarDrawer } from './components/SidebarDrawer';
import { BottomNav } from './components/BottomNav';
import { WalletView } from './components/WalletView';
import { SettingsView } from './components/SettingsView';
import { DashboardView } from './components/DashboardView';
import { DeploymentsView } from './components/DeploymentsView';
import { TemplatesView } from './components/TemplatesView';
import { SuggestView } from './components/SuggestView';
import { AdminPanelView } from './components/AdminPanelView';

// Modals
import { DeployBotModal } from './components/DeployBotModal';
import { CoinPurchaseModal } from './components/CoinPurchaseModal';
import { TerminalLogsModal } from './components/TerminalLogsModal';
import { BillingModal } from './components/BillingModal';
import { PlanPurchaseModal } from './components/PlanPurchaseModal';
import { SupportModal } from './components/SupportModal';
import { InviteModal } from './components/InviteModal';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { EditBotModal } from './components/EditBotModal';
import { ToastContainer } from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, activeTab } = useApp();

  // STRICT AUTHENTICATION GATE:
  // "ලොග් වෙන්නෙ නැතුව සයිට් එකේ කිසි දෙයාක් කරන්න දෙන්න එපා"
  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#020612] text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-cyan-500/30 selection:text-cyan-300 relative overflow-x-hidden">
      {/* Ambient background cyber neon glow orbs */}
      <div className="fixed top-[-120px] left-[-100px] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none -z-0" />
      <div className="fixed top-[30%] right-[-150px] w-[550px] h-[550px] rounded-full bg-purple-600/10 blur-[170px] pointer-events-none -z-0" />
      <div className="fixed bottom-[-100px] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[180px] pointer-events-none -z-0" />

      <Header />
      <SidebarDrawer />

      <main className="min-h-[calc(100vh-60px)] pb-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'deployments' && <DeploymentsView />}
            {activeTab === 'templates' && <TemplatesView />}
            {activeTab === 'wallet' && <WalletView />}
            {activeTab === 'settings' && <SettingsView />}
            {activeTab === 'suggest' && <SuggestView />}
            {activeTab === 'admin' && <AdminPanelView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />

      {/* Global Modals & Overlays */}
      <DeployBotModal />
      <CoinPurchaseModal />
      <TerminalLogsModal />
      <BillingModal />
      <PlanPurchaseModal />
      <SupportModal />
      <InviteModal />
      <DeleteAccountModal />
      <EditBotModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
