'use client';

import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import AgentHeader from '@/components/agent-header';
import FlowCanvas from '@/components/workflow/FlowCanvas';

export default function AgentPage() {
  return (
    <ReactFlowProvider>
      <div className="w-full h-screen flex flex-col">
        {/* Header */}
        <AgentHeader
          agentName="智能客服助手"
          agentAvatar="/avatar.jpeg"
          lastSaved="08-21 15:35:08"
          onSave={() => console.log('保存工作流')}
          onPublish={() => console.log('发布智能体')}
        />
        
        {/* ReactFlow 画布 */}
        <FlowCanvas />
      </div>
    </ReactFlowProvider>
  );
}