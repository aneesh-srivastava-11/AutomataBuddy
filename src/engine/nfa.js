/**
 * Simulates an NFA on a given input string.
 * @param {import('./types').NFA} nfa 
 * @param {string} input 
 * @returns {import('./types').SimulationResult}
 */
export function executeNFA(nfa, input) {
    const { startState, transitions, acceptStates } = nfa;

    // Current set of active states. Start with epsilon closure of start state.
    let currentStates = new Set([startState]);
    currentStates = getEpsilonClosure(nfa, currentStates);

    const trace = [{ inputIndex: -1, states: Array.from(currentStates) }]; // Step 0

    for (let i = 0; i < input.length; i++) {
        const symbol = input[i];
        const nextStates = new Set();

        if (!nfa.alphabet.includes(symbol)) {
            return { accepted: false, errorCode: "INVALID_SYMBOL", failureSymbol: symbol };
        }

        for (const state of currentStates) {
            const stateTransitions = transitions[state];
            if (stateTransitions && stateTransitions[symbol]) {
                // transitions[state][symbol] should be an array of states
                const targets = stateTransitions[symbol];
                if (Array.isArray(targets)) {
                    targets.forEach(t => nextStates.add(t));
                }
            }
        }

        // Add epsilon closure of all reached states
        const closedNextStates = getEpsilonClosure(nfa, nextStates);

        if (closedNextStates.size === 0) {
            // NFA dies
            return {
                accepted: false,
                errorCode: "NFA_DEAD_END",
                trace, // Return trace up to this point
                failureSymbol: symbol
            };
        }

        currentStates = closedNextStates;
        trace.push({ inputIndex: i, symbol, states: Array.from(currentStates) });
    }

    // Check if any current state is an accept state
    const isAccepted = Array.from(currentStates).some(s => acceptStates.includes(s));

    return {
        accepted: isAccepted,
        trace, // NFA trace is list of { inputIndex, states[] }
        errorCode: isAccepted ? undefined : "REJECTED_FINAL_STATE"
    };
}

/**
 * Computes epsilon closure for a set of states.
 * @param {import('./types').NFA} nfa 
 * @param {Set<string>} states 
 * @returns {Set<string>}
 */
export function getEpsilonClosure(nfa, states) {
    const stack = Array.from(states);
    const closure = new Set(states);
    const epsilon = "ε"; // or whatever we decide to use for epsilon. Let's assume 'ε' or '' (empty string).
    // Using 'EPSILON' const might be better, but for now let's handle "epsilon" key if it exists.

    while (stack.length > 0) {
        const current = stack.pop();
        const transitions = nfa.transitions[current];

        if (transitions) {
            // Check for common epsilon representations
            const epsilonTargets = transitions["ε"] || transitions[""] || [];

            for (const target of epsilonTargets) {
                if (!closure.has(target)) {
                    closure.add(target);
                    stack.push(target);
                }
            }
        }
    }
    return closure;
}

/**
 * Converts an NFA to a DFA using the Powerset Construction.
 * @param {import('./types').NFA} nfa 
 * @returns {import('./types').Automaton}
 */
export function convertNFAToDFA(nfa) {
    // 1. Start state = Epsilon closure of NFA start state
    const startSet = getEpsilonClosure(nfa, new Set([nfa.startState]));
    const startKey = Array.from(startSet).sort().join(','); // Key for Map

    const dfaStates = new Map(); // "q1,q2" -> { name: "A", originalStates: Set }
    const unprocessed = [startKey];

    dfaStates.set(startKey, {
        id: "q0",
        originalStates: startSet,
        transitions: {}
    });

    let stateCounter = 1;

    while (unprocessed.length > 0) {
        const currentKey = unprocessed.pop();
        const currentDFAState = dfaStates.get(currentKey);
        const currentSet = currentDFAState.originalStates;

        for (const symbol of nfa.alphabet) {
            // 2. Find set of reachable states for this symbol
            const distinctTargets = new Set();
            for (const subState of currentSet) {
                if (nfa.transitions[subState] && nfa.transitions[subState][symbol]) {
                    const targets = nfa.transitions[subState][symbol];
                    targets.forEach(t => distinctTargets.add(t));
                }
            }

            // 3. Epsilon close result
            const closure = getEpsilonClosure(nfa, distinctTargets);

            if (closure.size === 0) continue; // No transition -> partial DFA (or explicit Trap if we want)

            const closureKey = Array.from(closure).sort().join(',');

            if (!dfaStates.has(closureKey)) {
                // New DFA state found
                const newStateId = `q${stateCounter++}`;
                dfaStates.set(closureKey, {
                    id: newStateId,
                    originalStates: closure,
                    transitions: {}
                });
                unprocessed.push(closureKey);
            }

            // Link transition
            currentDFAState.transitions[symbol] = dfaStates.get(closureKey).id;
        }
    }

    // 4. Build Final DFA Object
    const states = [];
    const transitions = {};
    const acceptStates = [];

    for (const [key, data] of dfaStates) {
        states.push(data.id);
        transitions[data.id] = data.transitions;

        // Check if accepting
        const isAccepting = Array.from(data.originalStates).some(s => nfa.acceptStates.includes(s));
        if (isAccepting) {
            acceptStates.push(data.id);
        }
    }

    return {
        states,
        alphabet: nfa.alphabet,
        transitions,
        startState: "q0",
        acceptStates
    };
}

