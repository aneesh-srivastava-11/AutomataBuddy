
/**
 * Layout helper to arranging nodes in a circle.
 * @param {string[]} states 
 * @param {number} width 
 * @param {number} height 
 */
function getCircularLayout(states, width = 800, height = 600) {
    const radius = Math.min(width, height) / 3;
    const cx = width / 2;
    const cy = height / 2;
    const angleStep = (2 * Math.PI) / states.length;

    return states.map((id, i) => ({
        id,
        x: cx + radius * Math.cos(i * angleStep),
        y: cy + radius * Math.sin(i * angleStep)
    }));
}

/**
 * Converts an engine Automaton object to React Flow nodes and edges.
 * @param {import('../engine/types').Automaton} automaton 
 * @returns {{ nodes: Array, edges: Array }}
 */
export function automatonToGraph(automaton) {
    const layout = getCircularLayout(automaton.states);

    const nodes = automaton.states.map(stateId => {
        const pos = layout.find(p => p.id === stateId);
        return {
            id: stateId,
            type: 'custom',
            position: { x: pos.x, y: pos.y },
            data: {
                label: stateId,
                isStart: stateId === automaton.startState,
                isAccept: automaton.acceptStates.includes(stateId)
            }
        };
    });

    const edges = [];
    let edgeIdCounter = 0;

    // Flatten transitions: { q0: { a: q1, b: q1 } } -> edges
    Object.entries(automaton.transitions).forEach(([source, transitions]) => {
        Object.entries(transitions).forEach(([symbol, target]) => {
            // Handle NFA targets (array) vs DFA target (string)
            const targets = Array.isArray(target) ? target : [target];

            targets.forEach(t => {
                // Check if edge already exists to merge labels (e.g. "a,b")
                const existingEdge = edges.find(e => e.source === source && e.target === t);
                if (existingEdge) {
                    // Check if symbol is already there (avoid duplicates)
                    const labels = existingEdge.label.split(',').map(s => s.trim());
                    if (!labels.includes(symbol)) {
                        existingEdge.label += `,${symbol}`;
                    }
                } else {
                    edges.push({
                        id: `e${edgeIdCounter++}`,
                        source,
                        target: t,
                        label: symbol,
                        type: 'default',
                        zIndex: 2000,
                        markerEnd: { type: 'arrowclosed' } // Lowercase for React Flow marker type string usage usually, but we used enum before.
                        // Actually React Flow expects object or string. We used object previously.
                        // Let's rely on Editor default or set it here.
                    });
                }
            });
        });
    });

    return { nodes, edges };
}
