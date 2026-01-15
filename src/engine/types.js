/**
 * @typedef {Object} Automaton
 * @property {string[]} states - List of state IDs (e.g., ["q0", "q1"])
 * @property {string[]} alphabet - List of allowed symbols (e.g., ["a", "b"])
 * @property {Object.<string, Object.<string, string>>} transitions - DFA: { "q0": { "a": "q1" } }
 * @property {string} startState - Initial state ID
 * @property {string[]} acceptStates - List of accepting state IDs
 */

/**
 * @typedef {Object} NFA
 * @property {string[]} states
 * @property {string[]} alphabet
 * @property {Object.<string, Object.<string, string[]>>} transitions - NFA: { "q0": { "a": ["q1", "q2"] } }
 * @property {string} startState
 * @property {string[]} acceptStates
 */

/**
 * @typedef {Object} SimulationResult
 * @property {boolean} accepted - Whether the input was accepted
 * @property {string[]} [trace] - Sequence of states visited (for DFA)
 * @property {string} [errorCode] - Error code if failed (e.g. "DFA_NO_TRANSITION")
 * @property {string} [failureState] - State where failure occurred
 * @property {string} [failureSymbol] - Symbol that caused failure
 */
