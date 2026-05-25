'use client';

import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AgentSessionView_01 } from '@/components/agents-ui/blocks/agent-session-view-01';
import { WelcomeView } from '@/components/app/welcome-view';
import { AgentStatus } from '@/components/agents-ui/AgentStatus';
import { LeadPanel } from '@/components/agents-ui/LeadPanel';
import { DynamicPanel } from '@/components/agents-ui/DynamicPanel';
import { useAgentUI, type UIState, type LeadData, type AgentStatus as AgentStatusType } from '@/hooks/agents-ui/useAgentUI';

// ── Motion setup (unchanged from starter) ──────────────────────────────────
const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(AgentSessionView_01);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: { opacity: 1 },
    hidden:  { opacity: 0 },
  },
  initial:    'hidden',
  animate:    'visible',
  exit:       'hidden',
  transition: { duration: 0.5, ease: 'linear' },
};

// ── Types ───────────────────────────────────────────────────────────────────
interface ViewControllerProps {
  appConfig: AppConfig;
}

interface SidePanelsProps {
  leadData: LeadData;
  agentStatus: AgentStatusType;
}

interface MainAreaProps {
  uiState: UIState;
  appConfig: AppConfig;
  resolvedTheme: string | undefined;
}

// ── Side panel — agent status + lead capture only ──────────────────────────
function SidePanels({ leadData, agentStatus }: SidePanelsProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px 16px',
        borderLeft: '1px solid var(--border)',
        background: 'var(--background)',
        width: 280,
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {/* Live agent state */}
      <AgentStatus status={agentStatus} />

      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Discovery capture — fills in live */}
      <LeadPanel leadData={leadData} />
    </div>
  );
}

// ── Main area — visual cards + voice visualizer ────────────────────────────
function MainArea({ uiState, appConfig, resolvedTheme }: MainAreaProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Dynamic card panel — appears when agent triggers a UI action */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 40px',
        }}
      >
        {uiState.type ? (
          <DynamicPanel uiState={uiState} />
        ) : (
          <p style={{ 
            color: 'var(--muted-foreground)', 
            fontSize: 14,
            padding: '8px 0'
          }}>
            Visual content appears here during the conversation.
          </p>
        )}
      </div>

      {/* Voice visualizer — always pinned at bottom */}
      <div style={{ flexShrink: 0 }}>
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          supportsChatInput={appConfig.supportsChatInput}
          supportsVideoInput={appConfig.supportsVideoInput}
          supportsScreenShare={appConfig.supportsScreenShare}
          isPreConnectBufferEnabled={appConfig.isPreConnectBufferEnabled}
          audioVisualizerType={appConfig.audioVisualizerType}
          audioVisualizerColor={
            resolvedTheme === 'dark'
              ? appConfig.audioVisualizerColorDark
              : appConfig.audioVisualizerColor
          }
          audioVisualizerColorShift={appConfig.audioVisualizerColorShift}
          audioVisualizerBarCount={appConfig.audioVisualizerBarCount}
          audioVisualizerGridRowCount={appConfig.audioVisualizerGridRowCount}
          audioVisualizerGridColumnCount={appConfig.audioVisualizerGridColumnCount}
          audioVisualizerRadialBarCount={appConfig.audioVisualizerRadialBarCount}
          audioVisualizerRadialRadius={appConfig.audioVisualizerRadialRadius}
          audioVisualizerWaveLineWidth={appConfig.audioVisualizerWaveLineWidth}
        />
      </div>
    </div>
  );
}

// ── Connected layout — safe to use useAgentUI here (room guaranteed) ───────
function ConnectedLayout({ appConfig }: { appConfig: AppConfig }) {
  const { uiState, leadData, agentStatus } = useAgentUI();
  const { resolvedTheme } = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'row',
        background: 'var(--background)',
      }}
    >
      <MainArea
        uiState={uiState}
        appConfig={appConfig}
        resolvedTheme={resolvedTheme}
      />
      <SidePanels
        leadData={leadData}
        agentStatus={agentStatus}
      />
    </div>
  );
}

// ── Root controller ─────────────────────────────────────────────────────────
export function ViewController({ appConfig }: ViewControllerProps) {
  const { isConnected, start } = useSessionContext();

  return (
    <AnimatePresence mode="wait">
      {/* Welcome screen — before call starts */}
      {!isConnected && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          startButtonText={appConfig.startButtonText}
          onStartCall={start}
        />
      )}

      {/* Connected — two column layout */}
      {isConnected && (
        <motion.div
          key="session"
          {...VIEW_MOTION_PROPS}
          style={{ position: 'fixed', inset: 0 }}
        >
          <ConnectedLayout appConfig={appConfig} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}