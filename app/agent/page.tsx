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
  BarChart3,
  Bot,
  PlayCircle,
  X,
} from 'lucide-react';

import { BaseNode, CommentNode } from '@/components/nodes';

// Define custom node types
const nodeTypes = {
  default: BaseNode,
  input: BaseNode,
  output: BaseNode,
  comment: CommentNode,
};

type NodeData = {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  nodeType: 'default' | 'start' | 'end' | 'comment';
};

type CustomNodeType = {
  id: string;
  type: 'default' | 'input' | 'output' | 'comment';
  position: { x: number; y: number };
  data: NodeData;
};

const initialNodes: CustomNodeType[] = [
  {
    id: '1',
    type: 'default',
    data: { 
      label: '开始',
      description: '工作流程开始',
      icon: <PlayCircle className="w-4 h-4" />,
      nodeType: 'start' 
    },
    position: { x: 250, y: 125 },
  },
  {
    id: '2',
    type: 'default',
    data: { 
      label: 'LLM',
      description: '大语言模型处理',
      icon: <Bot className="w-4 h-4" />,
      nodeType: 'default' 
    },
    position: { x: 550, y: 125 },
  },
  {
    id: '3',
    type: 'default',
    data: { 
      label: 'Output',
      description: 'Display it as a webpage',
      icon: <BarChart3 className="w-4 h-4" />,
      nodeType: 'end' 
    },
    position: { x: 850, y: 125 },
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
  const [selectedNode, setSelectedNode] = useState<CustomNodeType | null>(null);
  const [isNodeSheetOpen, setIsNodeSheetOpen] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // 节点点击事件处理
  const onNodeClick = useCallback((event: React.MouseEvent, node: CustomNodeType) => {
    setSelectedNode(node);
    setIsNodeSheetOpen(true);
  }, []);



  // 添加节点
  const addNode = () => {
    const id = `node_${Date.now()}`;
    const position = screenToFlowPosition({
      x: clickPosition.x,
      y: clickPosition.y,
    });
    
    const newNode: CustomNodeType = {
      id,
      type: 'default',
      position,
      data: { 
        label: '新节点',
        nodeType: 'default'
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  // 添加注释
  const addComment = () => {
    const id = `comment_${Date.now()}`;
    const position = screenToFlowPosition({
      x: clickPosition.x,
      y: clickPosition.y,
    });
    
    const commentNode: CustomNodeType = {
      id,
      type: 'comment',
      position,
      data: { 
        label: '注释',
        nodeType: 'comment'
      },
    };
    
    setNodes((nds) => [...nds, commentNode]);
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
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
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
          <ContextMenuItem onClick={addNode} className="cursor-pointer">
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

      {/* Node Details Sidebar */}
      {isNodeSheetOpen && (
        <div className="fixed top-[60px] right-4 h-[calc(100vh-68px)] w-[400px] bg-white rounded-xl shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border border-gray-200">
          {/* 关闭按钮 */}
          <button
            onClick={() => setIsNodeSheetOpen(false)}
            className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 text-gray-500" />
            <span className="sr-only">关闭</span>
          </button>
          
          {/* 标题区域 */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              {selectedNode?.data.icon}
              <h2 className="text-xl font-semibold text-gray-900">{selectedNode?.data.label}</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              配置节点的详细信息和参数设置
            </p>
          </div>
        
          {/* 内容区域 */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">名称</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedNode?.data.label || ''}
                onChange={(e) => {
                  if (selectedNode) {
                    const updatedNode = {
                      ...selectedNode,
                      data: { ...selectedNode.data, label: e.target.value }
                    };
                    setNodes((nds) =>
                      nds.map((node) => (node.id === selectedNode.id ? updatedNode : node))
                    );
                    setSelectedNode(updatedNode);
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">描述</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedNode?.data.description || ''}
                placeholder="输入节点描述..."
                onChange={(e) => {
                  if (selectedNode) {
                    const updatedNode = {
                      ...selectedNode,
                      data: { ...selectedNode.data, description: e.target.value }
                    };
                    setNodes((nds) =>
                      nds.map((node) => (node.id === selectedNode.id ? updatedNode : node))
                    );
                    setSelectedNode(updatedNode);
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">节点类型</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedNode?.data.nodeType || 'default'}
                onChange={(e) => {
                  if (selectedNode) {
                    const updatedNode = {
                      ...selectedNode,
                      data: { ...selectedNode.data, nodeType: e.target.value as NodeData['nodeType'] }
                    };
                    setNodes((nds) =>
                      nds.map((node) => (node.id === selectedNode.id ? updatedNode : node))
                    );
                    setSelectedNode(updatedNode);
                  }
                }}
              >
                <option value="start">开始节点</option>
                <option value="default">默认节点</option>
                <option value="end">结束节点</option>
                <option value="comment">注释节点</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">节点ID</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
                value={selectedNode?.id || ''}
                disabled
              />
              <p className="text-xs text-gray-500">节点的唯一标识符，不可编辑</p>
            </div>
          </div>
        </div>
      )}
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
