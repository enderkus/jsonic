import {useState, useRef, useCallback, useEffect} from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';

function App() {
    const [jsonInput, setJsonInput] = useState('');
    const [formattedJson, setFormattedJson] = useState('');
    const [minifiedJson, setMinifiedJson] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('formatted');

    // Refs for scroll sync
    const inputTextareaRef = useRef<HTMLTextAreaElement>(null);
    const inputLineNumbersRef = useRef<HTMLDivElement>(null);
    const outputPreRef = useRef<HTMLPreElement>(null);
    const outputLineNumbersRef = useRef<HTMLDivElement>(null);

    // Simplified ultra-fast scroll sync handlers - no transform tricks
    const inputScrollTimeoutRef = useRef<number | null>(null);
    const outputScrollTimeoutRef = useRef<number | null>(null);

    const handleInputScroll = useCallback(() => {
        if (inputTextareaRef.current && inputLineNumbersRef.current) {
            const scrollTop = inputTextareaRef.current.scrollTop;
            
            // Direct immediate sync - no transforms
            inputLineNumbersRef.current.scrollTop = scrollTop;
            
            // Cancel any pending animation frame
            if (inputScrollTimeoutRef.current) {
                cancelAnimationFrame(inputScrollTimeoutRef.current);
            }
            
            // Smooth follow-up sync with requestAnimationFrame
            inputScrollTimeoutRef.current = requestAnimationFrame(() => {
                if (inputLineNumbersRef.current && inputTextareaRef.current) {
                    const currentScrollTop = inputTextareaRef.current.scrollTop;
                    inputLineNumbersRef.current.scrollTop = currentScrollTop;
                }
            });
        }
    }, []);

    const handleOutputScroll = useCallback(() => {
        if (outputPreRef.current && outputLineNumbersRef.current) {
            const scrollTop = outputPreRef.current.scrollTop;
            
            // Direct immediate sync - no transforms
            outputLineNumbersRef.current.scrollTop = scrollTop;
            
            // Cancel any pending animation frame
            if (outputScrollTimeoutRef.current) {
                cancelAnimationFrame(outputScrollTimeoutRef.current);
            }
            
            // Smooth follow-up sync with requestAnimationFrame
            outputScrollTimeoutRef.current = requestAnimationFrame(() => {
                if (outputLineNumbersRef.current && outputPreRef.current) {
                    const currentScrollTop = outputPreRef.current.scrollTop;
                    outputLineNumbersRef.current.scrollTop = currentScrollTop;
                }
            });
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (inputScrollTimeoutRef.current) {
                cancelAnimationFrame(inputScrollTimeoutRef.current);
            }
            if (outputScrollTimeoutRef.current) {
                cancelAnimationFrame(outputScrollTimeoutRef.current);
            }
        };
    }, []);

    const formatJson = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            const formatted = JSON.stringify(parsed, null, 2);
            setFormattedJson(formatted);
            // Also generate minified version
            const minified = JSON.stringify(parsed);
            setMinifiedJson(minified);
            setIsValid(true);
            setError('');
            setActiveTab('formatted');
        } catch (error) {
            setIsValid(false);
            setError('Syntax error in JSON');
            setFormattedJson('');
            setMinifiedJson('');
        }
    };

    const minifyJson = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            const minified = JSON.stringify(parsed);
            setMinifiedJson(minified);
            // Also generate formatted version
            const formatted = JSON.stringify(parsed, null, 2);
            setFormattedJson(formatted);
            setIsValid(true);
            setError('');
            setActiveTab('minified');
        } catch (error) {
            setIsValid(false);
            setError('Syntax error in JSON');
            setFormattedJson('');
            setMinifiedJson('');
        }
    };

    const validateJson = () => {
        if (!jsonInput.trim()) {
            setIsValid(true);
            setError('');
            return;
        }
        try {
            JSON.parse(jsonInput);
            setIsValid(true);
            setError('');
        } catch (error) {
            setIsValid(false);
            setError('Syntax error in JSON');
        }
    };

    const clearAll = () => {
        setJsonInput('');
        setFormattedJson('');
        setMinifiedJson('');
        setIsValid(true);
        setError('');
        setActiveTab('formatted');
    };

    // Calculate line counts
    const inputLineCount = jsonInput ? jsonInput.split('\n').length : 1; // Always at least 1 for cursor
    const currentOutput = activeTab === 'formatted' ? formattedJson : minifiedJson;
    const outputLineCount = currentOutput.trim() ? currentOutput.split('\n').length : 0;

    return (
        <div className="h-screen bg-gray-900 text-gray-200 flex flex-col">
            {/* Top Menu Bar */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <img src={logo} className="w-5 h-5" alt="Jsonic"/>
                        <span className="text-sm font-medium text-gray-300">Jsonic</span>
                    </div>
                    <div className="text-xs text-gray-500">JSON Parser</div>
                </div>
                <div className="flex items-center space-x-2">
                    {jsonInput.trim() && (
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                                isValid ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                            <span className="text-xs text-gray-400">
                                {isValid ? 'Valid' : 'Invalid'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={formatJson}
                        disabled={!jsonInput.trim() || !isValid}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Format</span>
                    </button>
                    <button
                        onClick={minifyJson}
                        disabled={!jsonInput.trim() || !isValid}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Minify</span>
                    </button>
                    <div className="w-px h-4 bg-gray-600"></div>
                    <button
                        onClick={clearAll}
                        className="px-3 py-1.5 text-xs bg-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors flex items-center space-x-1"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Clear</span>
                    </button>
                </div>
            </div>

            {/* Error Bar */}
            {error && (
                <div className="bg-red-900/50 border-b border-red-800 px-4 py-2">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-red-300">{error}</span>
                    </div>
                </div>
            )}

            {/* Main Split Panel */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - Input */}
                <div className="flex-1 flex flex-col border-r border-gray-700">
                    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 h-12">
                        <div className="flex items-center justify-between h-full">
                            <h3 className="text-sm font-medium text-gray-300">Input</h3>
                            <div className="text-xs text-gray-500">
                                {jsonInput.length} characters
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                        {/* Input Line Numbers - Stable Version */}
                        <div 
                            ref={inputLineNumbersRef}
                            className="absolute top-0 left-0 w-12 h-full bg-gray-800 border-r border-gray-700 text-xs text-gray-500 font-mono text-right select-none overflow-y-hidden"
                            style={{ 
                                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                                lineHeight: '1.25rem',
                                padding: '16px 8px 16px 0',
                                zIndex: 10,
                                pointerEvents: 'none'
                            }}
                        >
                            {Array.from({ length: Math.max(inputLineCount, 1) }, (_, i) => (
                                <div key={i} style={{ height: '1.25rem' }}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                        {/* Input Textarea - Stable Scrolling */}
                        <textarea
                            ref={inputTextareaRef}
                            value={jsonInput}
                            onChange={(e) => {
                                setJsonInput(e.target.value);
                                validateJson();
                            }}
                            onScroll={handleInputScroll}
                            className="w-full h-full bg-gray-900 text-gray-200 border-none outline-none resize-none font-mono text-sm relative"
                            style={{
                                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                                lineHeight: '1.25rem',
                                paddingLeft: '3.5rem',
                                padding: '16px 16px 16px 3.5rem',
                                zIndex: 1
                            }}
                            placeholder="Enter JSON here..."
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Right Panel - Output */}
                <div className="flex-1 flex flex-col">
                    <div className="bg-gray-800 border-b border-gray-700 h-12">
                        <div className="flex items-center justify-between px-4 py-2 h-full">
                            <div className="flex items-center space-x-4">
                                <h3 className="text-sm font-medium text-gray-300">Output</h3>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => setActiveTab('formatted')}
                                        className={`px-2 py-1 text-xs rounded ${
                                            activeTab === 'formatted' 
                                                ? 'bg-blue-600 text-white' 
                                                : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                    >
                                        Formatted
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('minified')}
                                        className={`px-2 py-1 text-xs rounded ${
                                            activeTab === 'minified' 
                                                ? 'bg-blue-600 text-white' 
                                                : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                    >
                                        Minified
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                {activeTab === 'formatted' ? formattedJson.length : minifiedJson.length} characters
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        {(activeTab === 'formatted' ? formattedJson : minifiedJson) ? (
                            <div className="absolute inset-0 overflow-hidden">
                                {/* Output Line Numbers - Stable Version */}
                                <div 
                                    ref={outputLineNumbersRef}
                                    className="absolute top-0 left-0 w-12 h-full bg-gray-800 border-r border-gray-700 text-xs text-gray-500 font-mono text-right select-none overflow-y-hidden"
                                    style={{ 
                                        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                                        lineHeight: '1.25rem',
                                        padding: '16px 8px 16px 0',
                                        zIndex: 10,
                                        pointerEvents: 'none'
                                    }}
                                >
                                    {Array.from({ length: Math.max(outputLineCount, 1) }, (_, i) => (
                                        <div key={i} style={{ height: '1.25rem' }}>
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                                {/* Output Pre - Stable Scrolling */}
                                <pre 
                                    ref={outputPreRef}
                                    onScroll={handleOutputScroll}
                                    className="w-full h-full text-sm text-gray-200 whitespace-pre-wrap font-mono bg-gray-900 overflow-auto border-0 focus:outline-none relative"
                                    style={{ 
                                        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                                        lineHeight: '1.25rem',
                                        paddingLeft: '3.5rem',
                                        padding: '16px 16px 16px 3.5rem',
                                        margin: 0,
                                        zIndex: 1
                                    }}
                                >
                                    {activeTab === 'formatted' ? formattedJson : minifiedJson}
                                </pre>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <div className="text-center text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm">No output to display</p>
                                    <p className="text-xs mt-1">Format or minify JSON to see results</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-gray-800 border-t border-gray-700 px-4 py-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                        <span>Jsonic JSON Parser</span>
                        <span className="text-blue-400">v0.9.0-beta</span>
                        {inputLineCount > 0 && (
                            <span>Input Lines: {inputLineCount}</span>
                        )}
                        {outputLineCount > 0 && (
                            <span>Output Lines: {outputLineCount}</span>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <a 
                            href="https://github.com/enderkus/jsonic" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                            title="View on GitHub"
                        >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a 
                            href="https://buymeacoffee.com/enderk" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center space-x-1"
                            title="Support me on Buy Me a Coffee"
                        >
                            <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs">Support Me</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
