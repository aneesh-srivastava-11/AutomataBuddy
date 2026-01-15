
import { executeDFA } from '../engine/dfa.js';
import { executeNFA, convertNFAToDFA } from '../engine/nfa.js';
import { minimizeDFA } from '../engine/minimization.js';

console.log("=== AUTOMATA ENGINE VERIFICATION ===");

// 1. Test DFA
const dfa1 = {
    states: ["q0", "q1"],
    alphabet: ["a", "b"],
    transitions: {
        "q0": { "a": "q0", "b": "q1" },
        "q1": { "a": "q0", "b": "q1" }
    },
    startState: "q0",
    acceptStates: ["q1"]
};

console.log("\n[Test 1] DFA Execution (Ends with 'b')");
console.log("Input: 'aab' ->", executeDFA(dfa1, "aab").accepted); // Expected: true
console.log("Input: 'aaa' ->", executeDFA(dfa1, "aaa").accepted); // Expected: false

// 2. Test NFA
const nfa1 = {
    states: ["s0", "s1"],
    alphabet: ["a", "b"],
    transitions: {
        "s0": { "a": ["s0"], "b": ["s0", "s1"] },
        "s1": {}
    },
    startState: "s0",
    acceptStates: ["s1"]
};

console.log("\n[Test 2] NFA Execution (Ends with 'b')");
console.log("Input: 'ab' ->", executeNFA(nfa1, "ab").accepted); // Expected: true
console.log("Input: 'ba' ->", executeNFA(nfa1, "ba").accepted); // Expected: false

// 3. Test Conversion
console.log("\n[Test 3] NFA -> DFA Conversion");
const convertedDFA = convertNFAToDFA(nfa1);
console.log("States:", convertedDFA.states);
console.log("Input: 'ab' (on Converted) ->", executeDFA(convertedDFA, "ab").accepted);

// 4. Test Minimization
const bloatedDFA = {
    states: ["A", "B", "C"],
    alphabet: ["0", "1"],
    transitions: {
        "A": { "0": "B", "1": "C" }, // A goes to B(final) or C(final)
        "B": { "0": "B", "1": "B" }, // B is final sink
        "C": { "0": "C", "1": "C" }  // C is final sink (Equivalent to B)
    },
    startState: "A",
    acceptStates: ["B", "C"]
};
// Expected: A -> equivalent(B,C). 2 states total.

console.log("\n[Test 4] DFA Minimization");
const minimized = minimizeDFA(bloatedDFA);
console.log("Original States:", bloatedDFA.states.length);
console.log("Minimized States:", minimized.states.length);
console.log("Minimized States List:", minimized.states);

console.log("\n=== VERIFICATION COMPLETE ===");
