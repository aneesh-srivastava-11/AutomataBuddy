import React from 'react';

export default function Sidebar({
    onModeChange,
    onConvert,
    onMinimize,
    onTestInput,
    verificationResult,
    selectedElement,
    onUpdateElement,
    onStep,
    onReset,
    currentStep,
    totalSteps,
    onAddState,
    alphabet,
    onSetAlphabet,
    darkMode,
    toggleDarkMode,
    deleteMode,
    toggleDeleteMode,
    onAddSelfLoop,
    onMakeDeadState
}) {
    const btnClass = "w-full py-2 px-3 mb-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded text-sm font-medium transition-colors text-gray-700 dark:text-gray-200";
    const panelClass = "w-64 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 overflow-y-auto transition-colors duration-300 shadow-sm z-10";

    return (
        <div className={panelClass}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold dark:text-white">AutomataBuddy</h1>
                <button
                    onClick={toggleDarkMode}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {darkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="mb-6">
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Editor Mode</h2>
                <select
                    onChange={(e) => onModeChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-sm dark:text-gray-200"
                    defaultValue="DFA"
                >
                    <option value="DFA">DFA</option>
                    <option value="NFA">NFA</option>
                </select>
            </div>

            <div className="mb-6">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Language (Alphabet)</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="e.g. 0,1 or a,b"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-sm font-mono mb-1 pr-8 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        defaultValue={alphabet ? alphabet.join(',') : ""}
                        onBlur={(e) => {
                            const val = e.target.value;
                            const newAlpha = val.split(',').map(s => s.trim()).filter(s => s !== "");
                            if (onSetAlphabet) onSetAlphabet(newAlpha);
                        }}
                    />
                    <button
                        className="absolute right-2 top-2 text-gray-400 hover:text-purple-600 font-bold"
                        title="Insert Epsilon"
                        onClick={(e) => {
                            // This is tricky with uncontrolled input. 
                            // Ideally we'd control it, but for now let's just alert or focus.
                            // Actually better to just letting them type 'ε' or click this to copy?
                            // Let's make it simple: Click adds 'ε' to end? 
                            // Nah, user wants to ENTER it easily. 
                            const input = e.target.previousSibling;
                            input.value = input.value ? input.value + ',ε' : 'ε';
                            input.focus();
                            // Trigger blur logic?
                            const newAlpha = input.value.split(',').map(s => s.trim()).filter(s => s !== "");
                            if (onSetAlphabet) onSetAlphabet(newAlpha);
                        }}
                    >
                        ε
                    </button>
                </div>
                <div className="text-[10px] text-gray-400">
                    Define allowed symbols (comma separated).
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actions</h2>
                <div className="flex flex-col space-y-2">
                    <button onClick={onAddState} className={btnClass}>+ Add State</button>
                    <button
                        onClick={toggleDeleteMode}
                        className={`w-full py-2 px-3 mb-2 border rounded text-sm font-medium transition-colors flex items-center justify-center space-x-2
                            ${deleteMode
                                ? 'bg-red-600 hover:bg-red-700 text-white border-red-700'
                                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'}
                        `}
                    >
                        <span>{deleteMode ? 'Deleting...' : 'Delete Brush'}</span>
                        {deleteMode && <span className="animate-pulse">🗑️</span>}
                    </button>

                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-xs text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800">
                        {deleteMode
                            ? <strong>Click on any State or Transition to delete it.</strong>
                            : <span>To add <strong>Transitions</strong>, drag from one state's black handle to another state.</span>
                        }
                    </div>
                </div>
                <div className="h-2"></div>
                <button onClick={onConvert} className={btnClass}>Convert NFA → DFA</button>
                <button onClick={onMinimize} className={btnClass}>Minimize DFA</button>
            </div>

            {selectedElement && (
                <div className="mb-6 border-t border-gray-200 pt-4">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Selected {selectedElement.type === 'node' ? 'State' : 'Transition'}
                    </h2>

                    {selectedElement.type === 'node' ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Label:</span>
                                <input
                                    className="w-20 p-1 border text-sm font-mono text-black dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded"
                                    value={selectedElement.data.label}
                                    onChange={(e) => onUpdateElement('label', e.target.value)}
                                />
                            </div>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={selectedElement.data.isStart || false}
                                    onChange={(e) => onUpdateElement('isStart', e.target.checked)}
                                />
                                <span>Start State</span>
                            </label>

                            {/* Start Arrow Direction (Only visible if Start State is checked) */}
                            {selectedElement.data.isStart && (
                                <div className="ml-6 mt-1 flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">Direction:</span>
                                    <select
                                        className="p-1 border text-xs rounded bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                                        value={selectedElement.data.startDirection || 'left'}
                                        onChange={(e) => onUpdateElement('startDirection', e.target.value)}
                                    >
                                        <option value="left">Left →</option>
                                        <option value="top">Top ↓</option>
                                        <option value="right">Right ←</option>
                                        <option value="bottom">Bottom ↑</option>
                                    </select>
                                </div>
                            )}
                            <label className="flex items-center space-x-2 text-sm cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={selectedElement.data.isAccept || false}
                                    onChange={(e) => onUpdateElement('isAccept', e.target.checked)}
                                />
                                <span>Accept State</span>
                            </label>

                            {/* Advanced Node Actions */}
                            <div className="pt-2">
                                <button
                                    onClick={() => onAddSelfLoop(selectedElement.id)}
                                    className="w-full text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-2 py-1 mb-1"
                                >
                                    + Add Self Loop (All Symbols)
                                </button>
                                <button
                                    onClick={() => onMakeDeadState(selectedElement.id)}
                                    className="w-full text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 rounded px-2 py-1"
                                >
                                    Make Dead State
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Symbol:</span>
                                <input
                                    className="w-20 p-1 border text-sm font-mono text-black dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded"
                                    value={selectedElement.label || ''}
                                    onChange={(e) => onUpdateElement('label', e.target.value)}
                                    placeholder="e.g. a,b"
                                />
                            </div>
                            <button
                                onClick={() => onUpdateElement('label', selectedElement.label ? (selectedElement.label + ',ε') : 'ε')}
                                className="w-full text-xs bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded px-2 py-1"
                            >
                                + Insert Epsilon (ε)
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="mb-6 border-t border-gray-200 pt-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Testing</h2>
                <div className="relative">
                    <input
                        id="test-input-field"
                        type="text"
                        placeholder="Test input string..."
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-sm mb-2 font-mono pr-8 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onTestInput(e.target.value);
                        }}
                    />
                    <button
                        className="absolute right-2 top-2 text-gray-400 hover:text-purple-600 font-bold"
                        title="Insert Epsilon"
                        onClick={(e) => {
                            const input = e.target.previousSibling;
                            // For test input, epsilon usually means empty string or explicit symbol? 
                            // If the engine handles 'ε' as empty, we insert it.
                            // But usually testing empty string is just hitting enter on empty input.
                            // However, if the user explicitly wants to test the 'ε' literal symbol (rare but possible if alphabet contains it),
                            // Or if they just want to signify "do nothing". 
                            // Let's print ε visually.
                            input.value = input.value + 'ε';
                            input.focus();
                        }}
                    >
                        ε
                    </button>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            // Assuming the input has an id or we use a ref? 
                            // We don't have a ref here (stateless), so we rely on the input's current value or state.
                            // But the input is uncontrolled. 
                            // Let's grab it via DOM for this quick fix or pass ref.
                            // Actually, let's just use a dedicated state for input value if we want a button?
                            // Or simpler: access sibling input.
                            const input = document.getElementById('test-input-field');
                            if (input) onTestInput(input.value);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
                    >
                        Test String ↵
                    </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">Press Enter or Click Test</div>
            </div>

            {verificationResult && (
                <div className={`p-3 rounded border text-sm ${verificationResult.accepted ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="font-bold">{verificationResult.accepted ? "ACCEPTED" : "REJECTED"}</div>
                    {verificationResult.errorCode && <div className="mt-1 text-xs opacity-75">{verificationResult.errorCode}</div>}

                    {/* Simulation Controls */}
                    {verificationResult.trace && (
                        <div className="mt-3 pt-3 border-t border-gray-300/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold uppercase">Simulation</span>
                                <span className="text-xs font-mono">{currentStep} / {totalSteps - 1}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-1 px-2 rounded text-xs"
                                    onClick={onReset}
                                >
                                    Reset
                                </button>
                                <button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
                                    onClick={onStep}
                                    disabled={currentStep >= totalSteps - 1}
                                >
                                    Step →
                                </button>
                            </div>
                            <div className="mt-2 text-xs font-mono break-all opacity-50">
                                Trace: {JSON.stringify(verificationResult.trace)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-center text-gray-400">
                Formal Automata Engine
            </div>
        </div>
    );
}
