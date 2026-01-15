/**
 * Validates if the given object is a structurally valid DFA.
 * @param {import('./types').Automaton} dfa 
 * @returns {import('./types').SimulationResult} - { accepted: true } or { accepted: false, errorCode: ... }
 */
export function validateDFA(dfa) {
    if (!dfa) return { accepted: false, errorCode: "INVALID_INPUT" };
    if (!dfa.states || !Array.isArray(dfa.states)) return { accepted: false, errorCode: "MISSING_STATES" };
    if (!dfa.alphabet || !Array.isArray(dfa.alphabet)) return { accepted: false, errorCode: "MISSING_ALPHABET" };
    if (!dfa.startState) return { accepted: false, errorCode: "MISSING_START_STATE" };
    if (!dfa.acceptStates || !Array.isArray(dfa.acceptStates)) return { accepted: false, errorCode: "MISSING_ACCEPT_STATES" };
    if (!dfa.transitions) return { accepted: false, errorCode: "MISSING_TRANSITIONS" };

    // Check start state exists
    if (!dfa.states.includes(dfa.startState)) {
        return { accepted: false, errorCode: "INVALID_START_STATE", failureState: dfa.startState };
    }

    // Check accept states exist
    for (const s of dfa.acceptStates) {
        if (!dfa.states.includes(s)) {
            return { accepted: false, errorCode: "INVALID_ACCEPT_STATE", failureState: s };
        }
    }

    // Check transitions (Deterministic: exactly one next state per symbol)
    // Note: We allow partial DFAs for UI flexibility, but warnings could be issued.
    // For strict DFA execution, we might fail or trap.

    return { accepted: true };
}

/**
 * Simulates a DFA on a given input string.
 * @param {import('./types').Automaton} dfa 
 * @param {string} input 
 * @returns {import('./types').SimulationResult}
 */
export function executeDFA(dfa, input) {
    const validation = validateDFA(dfa);
    if (!validation.accepted) {
        return validation;
    }

    let currentState = dfa.startState;
    const trace = [currentState];

    for (let i = 0; i < input.length; i++) {
        const symbol = input[i];

        // Check if symbol is in alphabet
        if (!dfa.alphabet.includes(symbol)) {
            return {
                accepted: false,
                errorCode: "INVALID_SYMBOL",
                failureState: currentState,
                failureSymbol: symbol
            };
        }

        const stateTransitions = dfa.transitions[currentState];
        if (!stateTransitions || !stateTransitions[symbol]) {
            // Transition missing -> Implicit trap or rejection depending on strictness.
            // Standard DFA definition requires total function. If missing, we reject.
            return {
                accepted: false,
                errorCode: "DFA_NO_TRANSITION",
                failureState: currentState,
                failureSymbol: symbol,
                trace
            };
        }

        currentState = stateTransitions[symbol];
        trace.push(currentState);
    }

    const isAccepted = dfa.acceptStates.includes(currentState);
    return {
        accepted: isAccepted,
        trace,
        errorCode: isAccepted ? undefined : "REJECTED_FINAL_STATE"
    };
}
