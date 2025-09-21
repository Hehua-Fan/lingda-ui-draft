'use client';

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
} from '@xyflow/react';
import {
  BarChart3,
  Bot,
  PlayCircle,
  X,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import { BaseNode, CommentNode } from '@/components/workflow/nodes';
import FlowContextMenu, { EdgeType } from '@/components/workflow/FlowContextMenu';

// Define custom node types
const nodeTypes = {
  default: BaseNode,
  input: BaseNode,
  output: BaseNode,
  comment: CommentNode,
};

export type NodeData = {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  nodeType: 'default' | 'start' | 'end' | 'comment' | 'visit_page' | 'click_element' | 'input_text' | 'scroll_page' | 'pagination' | 'wait' | 'loop' | 'extract_data';
  params?: Record<string, any>; // 节点参数
};

export type CustomNodeType = {
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
      label: '结束',
      description: '工作流程结束',
      icon: <BarChart3 className="w-4 h-4" />,
      nodeType: 'end' 
    },
    position: { x: 850, y: 125 },
  },
];

const initialEdges: EdgeType[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<CustomNodeType | null>(null);
  const [isNodeSheetOpen, setIsNodeSheetOpen] = useState(false);
  
  // 工作流执行相关状态
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<string>('');
  const [executionError, setExecutionError] = useState<string>('');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // 节点点击事件处理
  const onNodeClick = useCallback((event: React.MouseEvent, node: CustomNodeType) => {
    setSelectedNode(node);
    setIsNodeSheetOpen(true);
  }, []);

  // 执行工作流
  const executeWorkflow = useCallback(async () => {
    try {
      setIsExecuting(true);
      setExecutionError('');
      setExecutionStatus('正在启动...');

      // 构建工作流定义
      const workflowDefinition = {
        workflow_id: `workflow_${Date.now()}`,
        name: '浏览器自动化工作流',
        description: '由前端界面创建的工作流',
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            label: node.data.label,
            description: node.data.description,
            nodeType: node.data.nodeType,
            params: node.data.params || {}
          }
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 调试：记录发送的数据
      console.log('发送工作流数据:', JSON.stringify(workflowDefinition, null, 2));

      // 调用后端API执行工作流
      const response = await fetch('http://localhost:8000/workflow/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowDefinition),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = `HTTP ${response.status}: ${JSON.stringify(errorData)}`;
        } catch (e) {
          // 如果无法解析错误响应，使用默认消息
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const executionId = result.execution_id;
      
      if (!executionId) {
        throw new Error('未能获取执行ID');
      }

      setExecutionId(executionId);
      setExecutionStatus('执行中...');

      // 开始轮询执行状态
      pollExecutionStatus(executionId);

    } catch (error) {
      console.error('执行工作流失败:', error);
      setExecutionError(error instanceof Error ? error.message : '执行失败');
      setIsExecuting(false);
    }
  }, [nodes, edges]);

  // 轮询执行状态
  const pollExecutionStatus = useCallback(async (executionId: string) => {
    const maxAttempts = 60; // 最多轮询60次（5分钟）
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        
        const response = await fetch(`http://localhost:8000/workflow/status/${executionId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const statusData = await response.json();
        const status = statusData.status;

        setExecutionStatus(getStatusText(status));

        if (status === 'completed') {
          setIsExecuting(false);
          setExecutionStatus('执行完成');
          console.log('工作流执行结果:', statusData);
          
        } else if (status === 'failed') {
          setIsExecuting(false);
          setExecutionError(statusData.error || '执行失败');
          
        } else if (status === 'running' && attempts < maxAttempts) {
          // 继续轮询
          setTimeout(poll, 5000); // 5秒后再次轮询
          
        } else if (attempts >= maxAttempts) {
          setIsExecuting(false);
          setExecutionError('执行超时');
        }
        
      } catch (error) {
        console.error('查询执行状态失败:', error);
        setIsExecuting(false);
        setExecutionError('查询状态失败');
      }
    };

    poll();
  }, []);

  // 停止工作流执行
  const stopWorkflow = useCallback(async () => {
    if (!executionId) return;

    try {
      const response = await fetch(`http://localhost:8000/workflow/stop/${executionId}`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsExecuting(false);
        setExecutionStatus('已停止');
      }
    } catch (error) {
      console.error('停止工作流失败:', error);
    }
  }, [executionId]);

  // 获取状态显示文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '执行中...';
      case 'completed': return '执行完成';
      case 'failed': return '执行失败';
      case 'stopped': return '已停止';
      default: return status;
    }
  };

  // 获取状态图标
  const getStatusIcon = () => {
    if (isExecuting) {
      return <Play className="w-4 h-4 animate-pulse" />;
    }
    if (executionError) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (executionStatus === '执行完成') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Play className="w-4 h-4" />;
  };

  return (
    <div className="flex-1">
      <FlowContextMenu 
        nodes={nodes} 
        edges={edges} 
        setNodes={setNodes} 
        setEdges={setEdges}
      >
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
            color="#e5e7eb" 
          />
        </ReactFlow>
      </FlowContextMenu>

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
                <option value="end">结束节点</option>
                <option value="visit_page">访问页面</option>
                <option value="click_element">点击元素</option>
                <option value="input_text">输入文本</option>
                <option value="scroll_page">滚动页面</option>
                <option value="pagination">分页处理</option>
                <option value="wait">等待</option>
                <option value="loop">循环</option>
                <option value="extract_data">提取数据</option>
                <option value="default">默认节点</option>
                <option value="comment">注释节点</option>
              </select>
            </div>

            {/* 节点参数编辑器 */}
            {selectedNode && selectedNode.data.nodeType !== 'start' && selectedNode.data.nodeType !== 'end' && selectedNode.data.nodeType !== 'comment' && (
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">节点参数</h3>
                  
                  {/* Visit Page 参数 */}
                  {selectedNode.data.nodeType === 'visit_page' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-700">URL地址</label>
                        <input 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={selectedNode.data.params?.url || ''}
                          placeholder="https://example.com"
                          onChange={(e) => {
                            if (selectedNode) {
                              const updatedNode = {
                                ...selectedNode,
                                data: { 
                                  ...selectedNode.data, 
                                  params: { ...selectedNode.data.params, url: e.target.value }
                                }
                              };
                              setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? updatedNode : node)));
                              setSelectedNode(updatedNode);
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          id="wait_for_load"
                          checked={selectedNode.data.params?.wait_for_load || false}
                          onChange={(e) => {
                            if (selectedNode) {
                              const updatedNode = {
                                ...selectedNode,
                                data: { 
                                  ...selectedNode.data, 
                                  params: { ...selectedNode.data.params, wait_for_load: e.target.checked }
                                }
                              };
                              setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? updatedNode : node)));
                              setSelectedNode(updatedNode);
                            }
                          }}
                        />
                        <label htmlFor="wait_for_load" className="text-sm text-gray-700">等待页面加载</label>
                      </div>
                    </div>
                  )}

                  {/* Click Element 参数 */}
                  {selectedNode.data.nodeType === 'click_element' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-700">元素选择器</label>
                        <input 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={selectedNode.data.params?.selector || ''}
                          placeholder=".button, #submit, [data-testid='btn']"
                          onChange={(e) => {
                            if (selectedNode) {
                              const updatedNode = {
                                ...selectedNode,
                                data: { 
                                  ...selectedNode.data, 
                                  params: { ...selectedNode.data.params, selector: e.target.value }
                                }
                              };
                              setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? updatedNode : node)));
                              setSelectedNode(updatedNode);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700">选择器类型</label>
                        <select 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={selectedNode.data.params?.selector_type || 'css'}
                          onChange={(e) => {
                            if (selectedNode) {
                              const updatedNode = {
                                ...selectedNode,
                                data: { 
                                  ...selectedNode.data, 
                                  params: { ...selectedNode.data.params, selector_type: e.target.value }
                                }
                              };
                              setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? updatedNode : node)));
                              setSelectedNode(updatedNode);
                            }
                          }}
                        >
                          <option value="css">CSS选择器</option>
                          <option value="xpath">XPath</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Input Text 参数 */}
                  {selectedNode.data.nodeType === 'input_text' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-700">输入框选择器</label>
                        <input 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={selectedNode.data.params?.selector || ''}
                          placeholder="input[type='text'], #username"
                          onChange={(e) => {
                            if (selectedNode) {
                              const updatedNode = {
                                ...selectedNode,
                                data: { 
                                  ...selectedNode.data, 
                                  params: { ...selectedNode.data.params, selector: e.target.value }
                                }
                              };
                              setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? updatedNode : node)));
                              setSelectedNode(updatedNode);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700">输入文本</label>
                        <input 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={selectedNode.data.params?.text || ''}
                          placeholder="要输入的文本内容"
                          onChange={(e) => {
                            if (selectedNode) {
                              const updatedNode = {
                                ...selectedNode,
                                data: { 
                                  ...selectedNode.data, 
                                  params: { ...selectedNode.data.params, text: e.target.value }
                                }
                              };
                              setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? updatedNode : node)));
                              setSelectedNode(updatedNode);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Wait 参数 */}
                  {selectedNode.data.nodeType === 'wait' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-700">等待类型</label>
                        <select 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={selectedNode.data.params?.wait_type || 'time'}
                          onChange={(e) => {
                            if (selectedNode) {
                              const updatedNode = {
                                ...selectedNode,
                                data: { 
                                  ...selectedNode.data, 
                                  params: { ...selectedNode.data.params, wait_type: e.target.value }
                                }
                              };
                              setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? updatedNode : node)));
                              setSelectedNode(updatedNode);
                            }
                          }}
                        >
                          <option value="time">时间等待</option>
                          <option value="element">元素等待</option>
                          <option value="condition">条件等待</option>
                        </select>
                      </div>
                      {selectedNode.data.params?.wait_type === 'time' && (
                        <div>
                          <label className="text-sm text-gray-700">等待时间 (毫秒)</label>
                          <input 
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            value={selectedNode.data.params?.duration || 1000}
                            onChange={(e) => {
                              if (selectedNode) {
                                const updatedNode = {
                                  ...selectedNode,
                                  data: { 
                                    ...selectedNode.data, 
                                    params: { ...selectedNode.data.params, duration: parseInt(e.target.value) }
                                  }
                                };
                                setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? updatedNode : node)));
                                setSelectedNode(updatedNode);
                              }
                            }}
                          />
                        </div>
                      )}
                      {selectedNode.data.params?.wait_type === 'element' && (
                        <div>
                          <label className="text-sm text-gray-700">元素选择器</label>
                          <input 
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            value={selectedNode.data.params?.element_selector || ''}
                            placeholder=".loading, #content"
                            onChange={(e) => {
                              if (selectedNode) {
                                const updatedNode = {
                                  ...selectedNode,
                                  data: { 
                                    ...selectedNode.data, 
                                    params: { ...selectedNode.data.params, element_selector: e.target.value }
                                  }
                                };
                                setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? updatedNode : node)));
                                setSelectedNode(updatedNode);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extract Data 参数 */}
                  {selectedNode.data.nodeType === 'extract_data' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-700">数据选择器 (JSON格式)</label>
                        <textarea 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24"
                          value={JSON.stringify(selectedNode.data.params?.selectors || {}, null, 2)}
                          placeholder='{\n  "title": "h1",\n  "content": ".content",\n  "links": "a[href]"\n}'
                          onChange={(e) => {
                            if (selectedNode) {
                              try {
                                const selectors = JSON.parse(e.target.value);
                                const updatedNode = {
                                  ...selectedNode,
                                  data: { 
                                    ...selectedNode.data, 
                                    params: { ...selectedNode.data.params, selectors }
                                  }
                                };
                                setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? updatedNode : node)));
                                setSelectedNode(updatedNode);
                              } catch (error) {
                                // 忽略JSON解析错误，让用户继续编辑
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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

      {/* 执行控制面板 */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px]">
          {/* 执行状态显示 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {executionStatus || '就绪'}
              </span>
            </div>
            {executionId && (
              <span className="text-xs text-gray-500">
                ID: {executionId.slice(0, 8)}...
              </span>
            )}
          </div>

          {/* 错误信息 */}
          {executionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">执行失败</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{executionError}</p>
            </div>
          )}

          {/* 控制按钮 */}
          <div className="flex gap-3">
            <button
              onClick={executeWorkflow}
              disabled={isExecuting || nodes.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isExecuting || nodes.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isExecuting ? (
                <>
                  <Play className="w-4 h-4 animate-pulse" />
                  执行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  执行工作流
                </>
              )}
            </button>

            {isExecuting && (
              <button
                onClick={stopWorkflow}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                <Square className="w-4 h-4" />
                停止
              </button>
            )}
          </div>

          {/* 工作流统计 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>节点数: {nodes.length}</span>
              <span>连接数: {edges.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
