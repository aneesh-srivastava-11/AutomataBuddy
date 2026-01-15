import { executeDFA } from './dfa.js';

/**
 * Minimizes a DFA using Moore's Algorithm (Partition Refinement).
 * @param {import('./types').Automaton} dfa 
 * @returns {import('./types').Automaton}
 */
export function minimizeDFA(dfa) {
    // 1. Remove unreachable states
    const reachable = getReachableStates(dfa);
    const states = dfa.states.filter(s => reachable.has(s));
    const acceptStates = dfa.acceptStates.filter(s => reachable.has(s));
    let finalStates = new Set(acceptStates);
    let nonFinalStates = new Set(states.filter(s => !finalStates.has(s)));

    // 2. Initialize partitions: {Accepting, Non-Accepting}
    let partitions = [];
    if (finalStates.size > 0) partitions.push(finalStates);
    if (nonFinalStates.size > 0) partitions.push(nonFinalStates);

    // 3. Refine partitions
    let changed = true;
    while (changed) {
        changed = false;
        const newPartitions = [];

        for (const group of partitions) {
            if (group.size <= 1) {
                newPartitions.push(group);
                continue;
            }

            // Split group based on transition behavior
            const subdivisions = new Map(); // key (signature) -> Set(states)

            for (const state of group) {
                // Create a signature based on which partition the transitions lead to
                const signature = dfa.alphabet.map(symbol => {
                    const target = dfa.transitions[state] ? dfa.transitions[state][symbol] : null;
                    if (!target) return -1; // Dead/Trap implicit
                    // Find which partition the target belongs to
                    return partitions.findIndex(p => p.has(target));
                }).join('|');

                if (!subdivisions.has(signature)) {
                    subdivisions.set(signature, new Set());
                }
                subdivisions.get(signature).add(state);
            }

            if (subdivisions.size > 1) {
                changed = true;
                for (const subGroup of subdivisions.values()) {
                    newPartitions.push(subGroup);
                }
            } else {
                newPartitions.push(group);
            }
        }
        partitions = newPartitions;
    }

    // 4. Construct new DFA
    const newStates = partitions.map((_, i) => `q${i}`); // Rename states to q0, q1...
    const oldStateToNewMap = new Map();

    partitions.forEach((group, i) => {
        for (const state of group) {
            oldStateToNewMap.set(state, `q${i}`);
        }
    });

    const newStartState = oldStateToNewMap.get(dfa.startState);
    const newAcceptStates = new Set();

    partitions.forEach((group, i) => {
        // If any state in group was accepting, the new state is accepting
        for (const state of group) {
            if (dfa.acceptStates.includes(state)) {
                newAcceptStates.add(`q${i}`);
                break;
            }
        }
    });

    const newTransitions = {};

    partitions.forEach((group, i) => {
        const representative = group.values().next().value; // Pick any state from group to determine transitions
        const fromStateId = `q${i}`;
        newTransitions[fromStateId] = {};

        for (const symbol of dfa.alphabet) {
            const originalTarget = dfa.transitions[representative] ? dfa.transitions[representative][symbol] : null;
            if (originalTarget && oldStateToNewMap.has(originalTarget)) {
                newTransitions[fromStateId][symbol] = oldStateToNewMap.get(originalTarget);
            }
        }
    });

    return {
        states: newStates,
        alphabet: dfa.alphabet,
        transitions: newTransitions,
        startState: newStartState,
        acceptStates: Array.from(newAcceptStates)
    };
}

function getReachableStates(dfa) {
    const visited = new Set([dfa.startState]);
    const stack = [dfa.startState];

    while (stack.length > 0) {
        const current = stack.pop();
        const transitions = dfa.transitions[current];
        if (!transitions) continue;

        for (const symbol of dfa.alphabet) {
            const target = transitions[symbol];
            if (target && !visited.has(target)) {
                visited.add(target);
                stack.push(target);
            }
        }
    }
    return visited;
}
