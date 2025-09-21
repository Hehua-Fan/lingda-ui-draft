'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';

export interface CommentNodeProps extends NodeProps {
  data: {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    nodeType: 'comment';
  };
}

export default function CommentNode({ data }: CommentNodeProps) {
  const [isSelected, setIsSelected] = useState(false);
  const [content, setContent] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 点击节点时提升层级
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
  }, []);

  // 失去焦点时降低层级
  const handleBlur = useCallback(() => {
    setIsSelected(false);
    // TODO: 实现节点内容更新逻辑
    // 可以通过useStore或者全局状态管理来更新节点data
    console.log('Saving comment content:', content);
  }, [content]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSelected(false);
      textareaRef.current?.blur();
    }
    // 阻止事件冒泡，防止触发ReactFlow的快捷键
    e.stopPropagation();
  }, []);

  // textarea现在填充整个节点，不需要自动调整高度

  // 点击时自动聚焦
  useEffect(() => {
    if (isSelected && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isSelected]);

  return (
    <div 
      className={`
        bg-yellow-300 rounded-lg relative
        min-w-[160px] min-h-[80px]
        ${isSelected ? 'shadow-lg' : ''}
        transition-all duration-200
      `}
      data-node-type="comment"
      onClick={handleClick}
      style={{ 
        zIndex: isSelected ? 1000 : -1 // 默认在下层，选中时在上层
      }}
    >
      {/* 可调整大小的控制器 - 只在选中时显示 */}
      {isSelected && (
        <NodeResizer
          color="#fbbf24"
          isVisible={isSelected}
          minWidth={160}
          minHeight={80}
        />
      )}

      {/* 文本内容 - 始终显示为textarea */}
      <div className="w-full h-full p-3 flex flex-col">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsSelected(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 w-full resize-none bg-transparent border-none outline-none text-yellow-900 text-sm placeholder-yellow-700 font-medium"
          placeholder="输入注释内容..."
          style={{
            minHeight: '50px',
            fontFamily: 'inherit',
            overflow: 'hidden'
          }}
        />
      </div>

      {/* 编辑指示器 */}
      {isSelected && (
        <div className="absolute top-1 right-1 text-xs text-yellow-700 bg-yellow-100/80 px-2 py-1 rounded shadow-sm">
          编辑中
        </div>
      )}
    </div>
  );
}
