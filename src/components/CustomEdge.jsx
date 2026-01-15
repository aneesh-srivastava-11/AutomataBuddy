import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    source,
    target,
}) {
    const isSelfLoop = source === target;

    let edgePath = '';
    let labelX = 0;
    let labelY = 0;

    if (isSelfLoop) {
        // Big Self Loop Logic
        // We assume Top handles for best "upward" loop look, or calculate direction.
        // But simply pushing control points "outward" from the center of the node works.
        // Since handles are usually on the boundary, we just need to extend perpendicular to the line connecting handles?
        // Or easier: Just assume Upward loop if using Top handles.
        // Let's make a generic large loop path that goes UP. 
        // Most users expect self loops on top.

        const radiusX = 50;
        const radiusY = 60; // Make it tall

        // Control points
        // We pull them Up (negative Y)
        const cp1X = sourceX + 10;
        const cp1Y = sourceY - radiusY;
        const cp2X = targetX - 10;
        const cp2Y = targetY - radiusY;

        edgePath = `M ${sourceX} ${sourceY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${targetX} ${targetY}`;

        labelX = (sourceX + targetX) / 2;
        labelY = Math.min(sourceY, targetY) - radiusY + 10;
    } else {
        const [path, lx, ly] = getBezierPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
        });
        edgePath = path;
        labelX = lx;
        labelY = ly;
    }

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        <div className="bg-white dark:bg-gray-800 text-black dark:text-white px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-bold font-mono">
                            {label}
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
