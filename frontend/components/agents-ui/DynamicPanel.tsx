'use client'

import type { UIState } from '@/hooks/agents-ui/useAgentUI'
import { ServicesCard }    from '@/components/agents-ui/panels/ServicesCard'
import { ServiceDetail }   from '@/components/agents-ui/panels/ServiceDetail'
import { ProcessCard }     from '@/components/agents-ui/panels/ProcessCard'
import { HighValueClose }  from '@/components/agents-ui/panels/HighValueClose'
import { BookCall }        from '@/components/agents-ui/panels/BookCall'
import { SummaryCard }     from '@/components/agents-ui/panels/SummaryCard'

interface DynamicPanelProps {
  uiState: UIState
}

export function DynamicPanel({ uiState }: DynamicPanelProps) {
  if (!uiState.type) {
    return (
      <p style={{ fontSize: 13, color: '#9CA3AF', padding: '8px 0' }}>
        Visual content appears here during the conversation.
      </p>
    )
  }

  switch (uiState.type) {
    case 'services':          return <ServicesCard />
    case 'service_detail':    return <ServiceDetail name={uiState.name ?? ''} />
    case 'process':           return <ProcessCard />
    case 'high_value_close':  return <HighValueClose />
    case 'book_call':         return <BookCall />
    case 'summary':           return <SummaryCard lead={uiState.lead ?? {}} />
    default:                  return null
  }
}