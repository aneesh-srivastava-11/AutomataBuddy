import React, { useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    addEdge,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

export default function Editor({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    darkMode,
    onNodeClick,
    onEdgeClick
}) {
    return (
        <div className={`w-full h-full ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                fitView
            >
                <Background gap={20} color={darkMode ? "#374151" : "#e5e7eb"} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
