'use client'

import { useState, useEffect } from 'react'
import { useRoomContext, useVoiceAssistant } from '@livekit/components-react'

export interface UIState {
  type: string | null
  name?: string
  lead?: Record<string, string>
}

export interface LeadData {
  name: string | null
  company: string | null
  problem: string | null
  timeline: string | null
  budget: string | null
}

export type AgentStatus = 'idle' | 'listening' | 'thinking' | 'speaking'

export function useAgentUI() {
  const room = useRoomContext()
  const { state: vaState } = useVoiceAssistant()

  const [uiState, setUiState]   = useState<UIState>({ type: null })
  const [leadData, setLeadData] = useState<LeadData>({
    name: null, company: null,
    problem: null, timeline: null, budget: null,
  })

  // Map LiveKit's voice assistant state to our simple status
  const agentStatus: AgentStatus = (() => {
    switch (vaState) {
      case 'listening':    return 'listening'
      case 'thinking':     return 'thinking'
      case 'speaking':     return 'speaking'
      default:             return 'idle'
    }
  })()

  useEffect(() => {
    if (!room) return
    console.log('[RPC] Registering handlers, room: ',room.name)
    const showUIHandler = async (data: { payload: string }) => {
      const payload = JSON.parse(data.payload) as UIState
      console.log('[RPC] showUI received:',payload)
      setUiState(payload)
      return 'ok'
    }

    const updateLeadHandler = async (data: { payload: string }) => {
      const { field, value } = JSON.parse(data.payload) as {
        field: keyof LeadData
        value: string
      }
      setLeadData(prev => ({ ...prev, [field]: value }))
      return 'ok'
    }

    room.localParticipant.registerRpcMethod('showUI',     showUIHandler)
    room.localParticipant.registerRpcMethod('updateLead', updateLeadHandler)

    return () => {
      room.localParticipant.unregisterRpcMethod('showUI')
      room.localParticipant.unregisterRpcMethod('updateLead')
    }
  }, [room])

  return { uiState, leadData, agentStatus }
}