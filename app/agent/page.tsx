'use client';

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import AgentHeader from '@/components/agent-header';
import {
  Plus,
  MessageSquare,
  Play,
  Clipboard,
  Download,
  Upload,
} from 'lucide-react';

import '@xyflow/react/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: '输入节点' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: '默认节点' },
    position: { x: 100, y: 125 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: '输出节点' },
    position: { x: 250, y: 250 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );



  // 添加节点
  const addNode = (type: string = 'default') => {
    const id = `node_${Date.now()}`;
    const position = screenToFlowPosition({
      x: clickPosition.x,
      y: clickPosition.y,
    });
    
    const newNode = {
      id,
      type,
      position,
      data: { 
        label: type === 'input' ? '输入节点' : 
               type === 'output' ? '输出节点' : '处理节点'
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
  };

  // 添加注释
  const addComment = () => {
    const id = `comment_${Date.now()}`;
    const position = screenToFlowPosition({
      x: clickPosition.x,
      y: clickPosition.y,
    });
    
    const commentNode = {
      id,
      type: 'default',
      position,
      data: { label: '注释' },
      style: {
        background: '#fff3cd',
        border: '1px dashed #ffc107',
        borderRadius: '8px',
        color: '#856404',
      },
    };
    
    setNodes((nds) => nds.concat(commentNode));
  };

  // 运行工作流
  const runWorkflow = () => {
    console.log('运行工作流', { nodes, edges });
    // TODO: 实现工作流执行逻辑
  };

  // 粘贴到这里
  const pasteHere = () => {
    // TODO: 实现粘贴逻辑
    console.log('粘贴到这里', clickPosition);
  };

  // 导出 DSL
  const exportDSL = () => {
    const dsl = {
      nodes,
      edges,
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
      }
    };
    
    const dataStr = JSON.stringify(dsl, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'workflow.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // 导入 DSL
  const importDSL = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const dsl = JSON.parse(e.target?.result as string);
            if (dsl.nodes && dsl.edges) {
              setNodes(dsl.nodes);
              setEdges(dsl.edges);
              console.log('DSL 导入成功');
            }
          } catch (error) {
            console.error('DSL 导入失败:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 处理右键点击位置
  const handleContextMenu = (event: React.MouseEvent) => {
    setClickPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div className="flex-1">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="w-full h-full" onContextMenu={handleContextMenu}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              style={{ backgroundColor: '#faf9f6' }}
            >
              <Controls position="top-left" style={{ left: '10px', top: '40%', transform: 'translateY(-50%)' }} />
              <MiniMap position="bottom-left" />
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={12} 
                size={1}
                style={{ backgroundColor: '#faf9f6' }}
              />
            </ReactFlow>
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => addNode('default')} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            添加节点
          </ContextMenuItem>
          
          <ContextMenuItem onClick={addComment} className="cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            添加注释
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          <ContextMenuItem onClick={runWorkflow} className="cursor-pointer">
            <Play className="mr-2 h-4 w-4" />
            运行
            <ContextMenuShortcut>⌘ R</ContextMenuShortcut>
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          <ContextMenuItem onClick={pasteHere} className="cursor-pointer">
            <Clipboard className="mr-2 h-4 w-4" />
            粘贴到这里
            <ContextMenuShortcut>⌘ V</ContextMenuShortcut>
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          <ContextMenuItem onClick={exportDSL} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            导出 DSL
          </ContextMenuItem>
          
          <ContextMenuItem onClick={importDSL} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            导入 DSL
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

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
