'use client';

import React, { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
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
  Globe,
  MousePointer,
  Type,
  ArrowDown,
  ChevronRight,
  Clock,
  RotateCcw,
  FileText,
  StopCircle,
} from 'lucide-react';

import { CustomNodeType, NodeData } from './FlowCanvas';
import NodeTypeSelector from './NodeTypeSelector';

export interface EdgeType {
  id: string;
  source: string;
  target: string;
}

interface FlowContextMenuProps {
  children: React.ReactNode;
  nodes: CustomNodeType[];
  edges: EdgeType[];
  setNodes: (nodes: CustomNodeType[] | ((nodes: CustomNodeType[]) => CustomNodeType[])) => void;
  setEdges: (edges: EdgeType[] | ((edges: EdgeType[]) => EdgeType[])) => void;
}

export default function FlowContextMenu({ 
  children, 
  nodes, 
  edges, 
  setNodes, 
  setEdges 
}: FlowContextMenuProps) {
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [isNodeTypeSelectorOpen, setIsNodeTypeSelectorOpen] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  // 显示节点类型选择器
  const showNodeTypeSelector = () => {
    setIsNodeTypeSelectorOpen(true);
  };

  // 根据选择的类型创建节点
  const createNodeByType = (nodeType: NodeData['nodeType']) => {
    const id = `node_${Date.now()}`;
    const position = screenToFlowPosition({
      x: clickPosition.x,
      y: clickPosition.y,
    });

    // 根据节点类型设置默认属性
    const getNodeDefaults = (type: NodeData['nodeType']) => {
      switch (type) {
        case 'start':
          return {
            label: '开始',
            description: '工作流程开始',
            icon: <PlayCircle className="w-4 h-4" />,
            params: {},
          };
        case 'end':
          return {
            label: '结束',
            description: '工作流程结束',
            icon: <StopCircle className="w-4 h-4" />,
            params: {},
          };
        case 'visit_page':
          return {
            label: '访问页面',
            description: '导航到指定的网页地址',
            icon: <Globe className="w-4 h-4" />,
            params: {
              url: 'https://example.com',
              wait_for_load: true,
              timeout: 30000,
            },
          };
        case 'click_element':
          return {
            label: '点击元素',
            description: '点击页面上的指定元素',
            icon: <MousePointer className="w-4 h-4" />,
            params: {
              selector: '.button',
              selector_type: 'css',
              click_type: 'single',
              wait_timeout: 10000,
            },
          };
        case 'input_text':
          return {
            label: '输入文本',
            description: '在指定的输入框中输入文本',
            icon: <Type className="w-4 h-4" />,
            params: {
              selector: 'input[type="text"]',
              text: '',
              clear_first: true,
              press_enter: false,
            },
          };
        case 'scroll_page':
          return {
            label: '滚动页面',
            description: '滚动页面到指定位置或方向',
            icon: <ArrowDown className="w-4 h-4" />,
            params: {
              direction: 'down',
              distance: 500,
              smooth: true,
            },
          };
        case 'pagination':
          return {
            label: '分页处理',
            description: '自动处理页面分页，点击下一页按钮',
            icon: <ChevronRight className="w-4 h-4" />,
            params: {
              next_button_selector: '.next-page',
              max_pages: 10,
            },
          };
        case 'wait':
          return {
            label: '等待',
            description: '等待指定时间或条件满足',
            icon: <Clock className="w-4 h-4" />,
            params: {
              wait_type: 'time',
              duration: 1000,
            },
          };
        case 'loop':
          return {
            label: '循环',
            description: '循环执行指定次数或直到满足条件',
            icon: <RotateCcw className="w-4 h-4" />,
            params: {
              loop_type: 'count',
              count: 1,
              max_iterations: 100,
            },
          };
        case 'extract_data':
          return {
            label: '提取数据',
            description: '从页面中提取指定数据',
            icon: <FileText className="w-4 h-4" />,
            params: {
              selectors: {
                title: 'h1',
                content: '.content',
              },
              extract_type: 'text',
              multiple: false,
            },
          };
        default:
          return {
            label: '处理节点',
            description: '执行业务逻辑',
            icon: <Bot className="w-4 h-4" />,
            params: {},
          };
      }
    };

    const defaults = getNodeDefaults(nodeType);
    
    const newNode: CustomNodeType = {
      id,
      type: 'default',
      position,
      data: { 
        label: defaults.label,
        description: defaults.description,
        icon: defaults.icon,
        nodeType: nodeType,
        params: defaults.params,
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
        description: '添加说明信息',
        icon: <MessageSquare className="w-4 h-4" />,
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
        reader.onload = (event) => {
          try {
            const dsl = JSON.parse(event.target?.result as string);
            if (dsl.nodes && dsl.edges) {
              setNodes(dsl.nodes);
              setEdges(dsl.edges);
            }
          } catch (error) {
            console.error('Invalid DSL file:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 处理右键菜单位置
  const handleContextMenu = (event: React.MouseEvent) => {
    setClickPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="w-full h-full" onContextMenu={handleContextMenu}>
            {children}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem onClick={showNodeTypeSelector} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            添加节点
            <ContextMenuShortcut>⌘ N</ContextMenuShortcut>
          </ContextMenuItem>
          
          <ContextMenuItem onClick={addComment} className="cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            添加注释
            <ContextMenuShortcut>⌘ C</ContextMenuShortcut>
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          <ContextMenuItem onClick={runWorkflow} className="cursor-pointer">
            <Play className="mr-2 h-4 w-4" />
            运行工作流
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

      {/* Node Type Selector Dialog */}
      <NodeTypeSelector
        open={isNodeTypeSelectorOpen}
        onOpenChange={setIsNodeTypeSelectorOpen}
        onSelectNodeType={createNodeByType}
      />
    </>
  );
}
