import React, { useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState, addEdge, MarkerType } from 'reactflow';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { executeDFA } from './engine/dfa';
import { executeNFA, convertNFAToDFA } from './engine/nfa';
import { minimizeDFA } from './engine/minimization';
import { automatonToGraph } from './utils/graphUtils';

const initialNodes = [
  { id: 'start', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'q0', isStart: true, isAccept: false } },
];

function App() {
  const [mode, setMode] = useState('DFA');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);
  const [alphabet, setAlphabet] = useState([]);
  const [explicitAlphabet, setExplicitAlphabet] = useState(false); // Flag to stop auto-inference if user manually set it

  // Removed handleGraphUpdate as we have direct state now

  // Dynamically compute alphabet if needed
  useEffect(() => {
    if (!explicitAlphabet) {
      const symbols = new Set();
      edges.forEach(e => {
        if (e.label) e.label.split(',').forEach(s => symbols.add(s.trim()));
      });
      const newAlpha = Array.from(symbols).sort();
      setAlphabet(prev => JSON.stringify(prev) !== JSON.stringify(newAlpha) ? newAlpha : prev);
    }
  }, [edges, explicitAlphabet]);

  const handleSelectionChange = useCallback(({ nodes, edges }) => {
    if (nodes.length > 0) {
      const node = nodes[0];
      setSelectedElement({ type: 'node', id: node.id, data: node.data });
    } else if (edges.length > 0) {
      const edge = edges[0];
      setSelectedElement({ type: 'edge', id: edge.id, label: edge.label });
    } else {
      setSelectedElement(null);
    }
  }, []);

  // Update Active States based on Simulation
  useEffect(() => {
    if (!verificationResult || !verificationResult.trace) return;

    const currentStepData = verificationResult.trace[simulationStep];
    let activeStates = [];

    if (typeof currentStepData === 'string') {
      activeStates = [currentStepData];
    } else if (currentStepData && currentStepData.states) {
      activeStates = currentStepData.states;
    }

    setNodes(nds => nds.map(n => {
      // Only update if changed to avoid loop? 
      // actually setNodes with callback is safe, but we must ensure we don't trigger onNodesChange unless needed.
      // But here we are setting data.isActive.
      const isActive = activeStates.includes(n.id);
      if (n.data.isActive !== isActive) {
        return { ...n, data: { ...n.data, isActive } };
      }
      return n;
    }));

  }, [simulationStep, verificationResult]); // Removed graphContext dependency

  const handleConnect = useCallback((params) => {
    const edge = {
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed },
      type: 'smoothstep',
      label: alphabet[0] || 'a' // Default to first char or 'a'
    };
    setEdges((eds) => addEdge(edge, eds));
  }, [setEdges, alphabet]);

  const handleUpdateElement = (field, value) => {
    if (!selectedElement) return;

    if (selectedElement.type === 'node') {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === selectedElement.id) {
            const newData = { ...n.data, [field]: value };
            setSelectedElement(prev => ({ ...prev, data: newData }));
            return { ...n, data: newData };
          }
          if (field === 'isStart' && value === true && n.data.isStart) {
            return { ...n, data: { ...n.data, isStart: false } };
          }
          return n;
        })
      );
    } else if (selectedElement.type === 'edge') {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === selectedElement.id) {
            setSelectedElement(prev => ({ ...prev, label: value }));
            return { ...e, label: value };
          }
          return e;
        })
      );
    }
  };

  const convertGraphToAutomaton = () => {
    // nodes and edges are now in scope
    const startNode = nodes.find(n => n.data.isStart);
    const startState = startNode ? startNode.id : (nodes.length > 0 ? nodes[0].id : "");
    const acceptStates = nodes.filter(n => n.data.isAccept).map(n => n.id);
    const states = nodes.map(n => n.id);
    const transitions = {};
    const alphabet = new Set();

    states.forEach(s => transitions[s] = {});

    edges.forEach(edge => {
      const src = edge.source;
      const tgt = edge.target;
      const symbols = (edge.label || "").split(",").map(s => s.trim());
      symbols.forEach(symbol => {
        if (!symbol) return;
        alphabet.add(symbol);
        if (mode === 'DFA') {
          transitions[src][symbol] = tgt;
        } else {
          if (!transitions[src][symbol]) transitions[src][symbol] = [];
          transitions[src][symbol].push(tgt);
        }
      });
    });

    return {
      states,
      alphabet: Array.from(alphabet),
      transitions,
      startState,
      acceptStates
    };
  };

  const handleTestInput = (input) => {
    const automaton = convertGraphToAutomaton();
    if (!automaton) return;

    let result;
    if (mode === 'DFA') {
      result = executeDFA(automaton, input);
    } else {
      result = executeNFA(automaton, input);
    }
    setVerificationResult(result);
    setSimulationStep(0); // Reset simulation
  };

  const handleConvert = () => {
    const nfa = convertGraphToAutomaton();
    if (!nfa) return;
    const dfa = convertNFAToDFA(nfa);
    const { nodes: newNodes, edges: newEdges } = automatonToGraph(dfa);

    setNodes(newNodes);
    setEdges(newEdges);
    setMode('DFA');
    setVerificationResult(null);
  };

  const handleMinimize = () => {
    const dfa = convertGraphToAutomaton();
    if (!dfa) return;
    const minimized = minimizeDFA(dfa);
    const { nodes: newNodes, edges: newEdges } = automatonToGraph(minimized);

    setNodes(newNodes);
    setEdges(newEdges);
    setVerificationResult(null);
  };

  const handleAddState = () => {
    const newId = `q${nodes.length}`;
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: 250, y: 150 + (nodes.length * 50) },
      data: { label: newId, isStart: false, isAccept: false }
    };

    setNodes(nds => [...nds, newNode]);
  };

  const handleAddSelfLoop = (nodeId) => {
    const symbols = alphabet.length > 0 ? alphabet.join(',') : 'a,b'; // Default fallback

    const newEdge = {
      id: `e_${nodeId}_self_${Date.now()}`,
      source: nodeId,
      target: nodeId,
      label: symbols,
      type: 'smoothstep',
      markerEnd: { type: 'arrowclosed' }
    };

    setEdges(eds => [...eds, newEdge]);
  };

  const handleMakeDeadState = (nodeId) => {
    handleAddSelfLoop(nodeId);
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, label: 'Dead/Trap' } } : n));
  };

  const handleNodeClick = (event, node) => {
    if (deleteMode) {
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
      setSelectedElement(null);
    }
  };

  const handleEdgeClick = (event, edge) => {
    if (deleteMode) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      setSelectedElement(null);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" data-theme={darkMode ? 'dark' : 'light'}>
      <Sidebar
        onModeChange={setMode}
        onConvert={handleConvert}
        onMinimize={handleMinimize}
        onTestInput={handleTestInput}
        onAddState={handleAddState}
        alphabet={alphabet}
        onSetAlphabet={(newAlpha) => {
          setAlphabet(newAlpha);
          setExplicitAlphabet(true);
        }}
        onAddSelfLoop={handleAddSelfLoop}
        onMakeDeadState={handleMakeDeadState}
        verificationResult={verificationResult}
        selectedElement={selectedElement}
        onUpdateElement={handleUpdateElement}
        onStep={() => setSimulationStep(s => s + 1)}
        onReset={() => setSimulationStep(0)}
        currentStep={simulationStep}
        totalSteps={verificationResult?.trace?.length || 0}

        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(prev => !prev)}
        deleteMode={deleteMode}
        toggleDeleteMode={() => setDeleteMode(prev => !prev)}
      />
      <div className="flex-1 h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Editor
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onSelectionChange={handleSelectionChange}
          darkMode={darkMode}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
        />
      </div>
    </div>
  );
}

export default App;
