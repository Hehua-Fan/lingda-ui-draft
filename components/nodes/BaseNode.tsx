'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface BaseNodeProps extends NodeProps {
  data: {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    nodeType?: 'default' | 'start' | 'end';
  };
}

export default function BaseNode({ data }: BaseNodeProps) {
  const nodeType = data.nodeType || 'default';
  
  // 根据节点类型定义样式
  const getNodeStyles = () => {
    switch (nodeType) {
      case 'start':
        return {
          container: 'bg-green-50 text-green-800',
          text: 'text-green-800 font-medium'
        };
      case 'end':
        return {
          container: 'bg-blue-50 text-blue-800',
          text: 'text-blue-800 font-medium'
        };
      default:
        return {
          container: 'bg-white text-gray-700',
          text: 'text-gray-700 font-medium'
        };
    }
  };

  const styles = getNodeStyles();
  
  return (
    <div 
      data-node-type={nodeType}
    >
      {/* Left connection points - for input connections (except for start nodes) */}
      {nodeType !== 'start' && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Handle
                type="target"
                position={Position.Left}
                id="target-1"
                style={{ top: '25%' }}
                className="hover:scale-110 hover:z-10 transition-all duration-200 origin-center"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>联动激活</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Handle
                type="target"
                position={Position.Left}
                id="target-2"
                style={{ top: '75%' }}
                className="hover:scale-110 hover:z-10 transition-all duration-200 origin-center"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>任一激活</p>
            </TooltipContent>
          </Tooltip>
        </>
      )}
      
      {/* Node content */}
      <div className="w-full px-3 py-2 space-y-2">
        {/* Header */}
        <div className={`flex items-center gap-2 ${styles.text}`}>
          {data.icon && (
            <div className="flex-shrink-0">
              {data.icon}
            </div>
          )}
          <span className="text-sm font-medium truncate">
            {data.label}
          </span>
        </div>
        
        {/* Description */}
        {data.description && (
          <div className="text-xs text-gray-600 text-left">
            {data.description}
          </div>
        )}
      </div>
      
      {/* Right connection point - for output connections (except for end nodes) */}
      {nodeType !== 'end' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Handle
              type="source"
              position={Position.Right}
              id="source-1"
              className="hover:scale-110 hover:z-10 transition-all origin-center"
              style={ { top: '25%' } }
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>运行结束</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

