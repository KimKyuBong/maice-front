"use client";

import { useEffect, useRef, useState } from 'react';

interface LatexRendererProps {
    text: string;
}

export default function LatexRenderer({ text }: LatexRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showOriginal, setShowOriginal] = useState(false);
    const [renderedContent, setRenderedContent] = useState('');

    useEffect(() => {
        const loadMathJax = async () => {
            if (!window.MathJax) {
                window.MathJax = {
                    tex: {
                        inlineMath: [['$', '$']],
                        displayMath: [['$$', '$$']],
                        processEscapes: true,
                        packages: ['base', 'ams', 'noerrors', 'noundefined']
                    },
                    options: {
                        enableMenu: false,
                        renderActions: {
                            addMenu: [],
                            checkLoading: []
                        }
                    },
                    startup: {
                        typeset: false,
                        ready: () => {
                            window.MathJax?.startup?.defaultReady?.();
                        }
                    }
                };

                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
                script.async = true;
                
                await new Promise<void>((resolve) => {
                    script.onload = () => resolve();
                    document.head.appendChild(script);
                });
            }

            if (!containerRef.current) return;

            try {
                const processedText = text
                    .replace(/Math input error/g, '')
                    .replace(/\[unclear\]/g, '')
                    .split('\n')
                    .map(line => line.trim())
                    .join('</p><p>')
                    .replace(/([^$])(>|<)([^$])/g, '$1\\$2$3')
                    .replace(/\$\$/g, '$')
                    .replace(/\${3,}/g, '$');

                setRenderedContent(`<p>${processedText}</p>`);
                
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<p>${processedText}</p>`;
                }

                await new Promise(resolve => setTimeout(resolve, 0));

                if (window.MathJax?.typesetPromise) {
                    await window.MathJax.typesetPromise([containerRef.current]);
                }
            } catch (error) {
                console.error('수식 렌더링 실패:', error);
                setRenderedContent(text);
            }
        };

        if (!showOriginal) {
            loadMathJax();
        }
    }, [text, showOriginal]);

    useEffect(() => {
        if (!showOriginal && containerRef.current) {
            containerRef.current.innerHTML = renderedContent;
            if (window.MathJax?.typesetPromise) {
                window.MathJax.typesetPromise([containerRef.current]);
            }
        }
    }, [showOriginal, renderedContent]);

    return (
        <div className="space-y-4">
            <button
                type="button"
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-sm text-blue-600 hover:text-blue-800"
            >
                {showOriginal ? '렌더링된 결과 보기' : '원문 보기'}
            </button>

            {showOriginal ? (
                <pre className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    {text}
                </pre>
            ) : (
                <div 
                    ref={containerRef} 
                    className="math-content break-words"
                    style={{ lineHeight: '1.5' }}
                />
            )}
        </div>
    );
}

// MathJax 타입 정의
declare global {
    interface Window {
        MathJax: {
            tex: {
                inlineMath: string[][];
                displayMath: string[][];
                processEscapes: boolean;
                packages: string[];
            };
            options: {
                enableMenu: boolean;
                renderActions: {
                    addMenu: never[];
                    checkLoading: never[];
                };
            };
            startup: {
                typeset: boolean;
                ready?: () => void;
                defaultReady?: () => void;
            };
            typesetPromise?: (elements: HTMLElement[]) => Promise<void>;
        }
    }
}