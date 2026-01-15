import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, selected }) => {
    const isAccept = data.isAccept;
    const isStart = data.isStart;
    const isActive = data.isActive;

    return (
        <div className={`
        relative flex items-center justify-center 
        w-12 h-12 rounded-full 
        bg-white dark:bg-gray-800 
        border-2 transition-all duration-300 transform
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-800 dark:border-gray-300'}
        ${isActive ? '!bg-yellow-100 dark:!bg-yellow-900 !border-yellow-500 scale-110 shadow-md' : ''}
        ${isAccept ? 'border-4 border-double' : ''} 
    `}>
            {/* Start State Indicator (Arrow) */}
            {isStart && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-gray-800 dark:text-gray-200 font-bold text-xl">
                    →
                </div>
            )}



            <div className="text-sm font-bold pointer-events-none text-gray-800 dark:text-gray-200">
                {data.label}
            </div>

            {/* Handles: Visible and larger for easier grabbing */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-gray-400 dark:bg-gray-500 hover:bg-blue-500"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-gray-800 dark:bg-gray-200 hover:bg-blue-600"
            />
            {/* Top/Bottom handles for self-loops or complex routing */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-gray-400 dark:bg-gray-500 hover:bg-blue-500"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-gray-800 dark:bg-gray-200 hover:bg-blue-600"
            />
        </div>
    );
});
