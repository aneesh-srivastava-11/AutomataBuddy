import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, selected }) => {
    const isAccept = data.isAccept;
    const isStart = data.isStart;
    const isActive = data.isActive;

    return (
        <div className={`
        relative flex items-center justify-center group
        w-12 h-12 rounded-full 
        bg-white dark:bg-gray-800 
        border-2 transition-all duration-300 transform
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-800 dark:border-gray-300'}
        ${isActive ? '!bg-yellow-100 dark:!bg-yellow-900 !border-yellow-500 scale-110 shadow-md' : ''}
        ${isAccept ? 'border-4 border-double' : ''} 
    `}>
            {/* Start State Indicator (Arrow) */}
            {isStart && (
                <div
                    className={`absolute text-gray-800 dark:text-gray-200 font-bold text-xl pointer-events-none
                        ${(!data.startDirection || data.startDirection === 'left') ? '-left-6 top-1/2 -translate-y-1/2' : ''}
                        ${data.startDirection === 'top' ? '-top-6 left-1/2 -translate-x-1/2 rotate-90' : ''}
                        ${data.startDirection === 'right' ? '-right-6 top-1/2 -translate-y-1/2 rotate-180' : ''}
                        ${data.startDirection === 'bottom' ? '-bottom-6 left-1/2 -translate-x-1/2 -rotate-90' : ''}
                    `}
                >
                    →
                </div>
            )}



            <div className="text-sm font-bold pointer-events-none text-gray-800 dark:text-gray-200">
                {data.label}
            </div>

            {/* Handles: 8-point layout (Color Coded: Blue=Source, Green=Target) */}

            {/* TOP SIDE */}
            {/* Target (Green - Land Here) */}
            <Handle
                type="target" position={Position.Top} id="t-target"
                className="w-3 h-3 !bg-green-500 hover:!bg-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                style={{ left: '35%' }}
            />
            {/* Source (Blue - Drag From Here) */}
            <Handle
                type="source" position={Position.Top} id="t-source"
                className="w-3 h-3 !bg-blue-500 hover:!bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                style={{ left: '65%' }}
            />

            {/* RIGHT SIDE */}
            {/* Target (Green) */}
            <Handle
                type="target" position={Position.Right} id="r-target"
                className="w-3 h-3 !bg-green-500 hover:!bg-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                style={{ top: '35%' }}
            />
            {/* Source (Blue) */}
            <Handle
                type="source" position={Position.Right} id="r-source"
                className="w-3 h-3 !bg-blue-500 hover:!bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                style={{ top: '65%' }}
            />

            {/* BOTTOM SIDE */}
            {/* Target (Green) */}
            <Handle
                type="target" position={Position.Bottom} id="b-target"
                className="w-3 h-3 !bg-green-500 hover:!bg-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                style={{ left: '35%' }}
            />
            {/* Source (Blue) */}
            <Handle
                type="source" position={Position.Bottom} id="b-source"
                className="w-3 h-3 !bg-blue-500 hover:!bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                style={{ left: '65%' }}
            />

            {/* LEFT SIDE */}
            {/* Target (Green) */}
            <Handle
                type="target" position={Position.Left} id="l-target"
                className="w-3 h-3 !bg-green-500 hover:!bg-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                style={{ top: '35%' }}
            />
            {/* Source (Blue) */}
            <Handle
                type="source" position={Position.Left} id="l-source"
                className="w-3 h-3 !bg-blue-500 hover:!bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                style={{ top: '65%' }}
            />
        </div>
    );
});
