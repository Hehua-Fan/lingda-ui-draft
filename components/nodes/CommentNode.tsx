'use client';

import React from 'react';
import { NodeProps } from '@xyflow/react';

export interface CommentNodeProps extends NodeProps {
  data: {
    label: string;
    nodeType: 'comment';
  };
}

export default function CommentNode({ data }: CommentNodeProps) {
  return (
    <div 
      className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg shadow-md min-w-[120px] min-h-[60px] flex items-center justify-center"
      data-node-type="comment"
    >
      {/* Comment nodes typically don't need connection handles */}
      <div className="text-sm text-center text-yellow-800 font-medium">
        {data.label}
      </div>
    </div>
  );
}
