'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PlayCircle,
  StopCircle,
  Settings,
  Globe,
  MousePointer,
  Type,
  ArrowDown,
  ChevronRight,
  Clock,
  RotateCcw,
  FileText,
} from 'lucide-react';

import { NodeData } from './FlowCanvas';

interface NodeType {
  id: NodeData['nodeType'];
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const nodeTypes: NodeType[] = [
  // 控制节点
  {
    id: 'start',
    label: '开始节点',
    description: '工作流程的起始点，标记流程开始',
    icon: <PlayCircle className="w-6 h-6" />,
    color: 'text-green-600',
  },
  {
    id: 'end',
    label: '结束节点',
    description: '工作流程的终点，标记流程结束',
    icon: <StopCircle className="w-6 h-6" />,
    color: 'text-red-600',
  },
  
  // 页面导航节点
  {
    id: 'visit_page',
    label: '访问页面',
    description: '导航到指定的网页地址',
    icon: <Globe className="w-6 h-6" />,
    color: 'text-blue-600',
  },
  
  // 交互操作节点
  {
    id: 'click_element',
    label: '点击元素',
    description: '点击页面上的指定元素',
    icon: <MousePointer className="w-6 h-6" />,
    color: 'text-purple-600',
  },
  {
    id: 'input_text',
    label: '输入文本',
    description: '在指定的输入框中输入文本',
    icon: <Type className="w-6 h-6" />,
    color: 'text-indigo-600',
  },
  {
    id: 'scroll_page',
    label: '滚动页面',
    description: '滚动页面到指定位置或方向',
    icon: <ArrowDown className="w-6 h-6" />,
    color: 'text-teal-600',
  },
  
  // 高级操作节点
  {
    id: 'pagination',
    label: '分页处理',
    description: '自动处理页面分页，点击下一页按钮',
    icon: <ChevronRight className="w-6 h-6" />,
    color: 'text-orange-600',
  },
  {
    id: 'extract_data',
    label: '提取数据',
    description: '从页面中提取指定数据',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-emerald-600',
  },
  
  // 流程控制节点
  {
    id: 'wait',
    label: '等待',
    description: '等待指定时间或条件满足',
    icon: <Clock className="w-6 h-6" />,
    color: 'text-yellow-600',
  },
  {
    id: 'loop',
    label: '循环',
    description: '循环执行指定次数或直到满足条件',
    icon: <RotateCcw className="w-6 h-6" />,
    color: 'text-pink-600',
  },
  
  // 通用处理节点
  {
    id: 'default',
    label: '处理节点',
    description: '执行主要业务逻辑的节点',
    icon: <Settings className="w-6 h-6" />,
    color: 'text-gray-600',
  },
];

interface NodeTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectNodeType: (nodeType: NodeData['nodeType']) => void;
}

export default function NodeTypeSelector({
  open,
  onOpenChange,
  onSelectNodeType,
}: NodeTypeSelectorProps) {
  const handleSelectNodeType = (nodeType: NodeData['nodeType']) => {
    onSelectNodeType(nodeType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>选择节点类型</DialogTitle>
          <DialogDescription>
            选择要添加到工作流中的节点类型
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.id}
              onClick={() => handleSelectNodeType(nodeType.id)}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer text-left"
            >
              <div className={`flex-shrink-0 ${nodeType.color}`}>
                {nodeType.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{nodeType.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{nodeType.description}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
