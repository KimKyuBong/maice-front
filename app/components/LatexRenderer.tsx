"use client";

import { useEffect, useRef, useState } from 'react';

interface LatexRendererProps {
    text?: string;
}

declare global {
    interface Window {
        MathJax?: {
            typesetPromise?: (elements: HTMLElement[]) => Promise<void>;
            startup?: {
                defaultReady: () => void;
            };
            tex2svg?: (tex: string) => HTMLElement;
        }
    }
}

export default function LatexRenderer({ text }: LatexRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showOriginal, setShowOriginal] = useState(false);

    useEffect(() => {
        if (!text || showOriginal || !containerRef.current) return;

        const renderMath = async () => {
            try {
                if (containerRef.current) {
                    // 기존 내용 초기화
                    containerRef.current.innerHTML = '';
                    
                    // 텍스트를 수식과 일반 텍스트로 분리
                    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
                    
                    for (const part of parts) {
                        if (part.startsWith('$')) {
                            // 수식 부분
                            const tex = part.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '');
                            const div = document.createElement('div');
                            div.style.display = part.startsWith('$$') ? 'block' : 'inline';
                            div.className = 'math';
                            div.textContent = part;
                            if (containerRef.current) {
                                containerRef.current.appendChild(div);
                            }
                        } else if (part.trim()) {
                            // 일반 텍스트 부분
                            const span = document.createElement('span');
                            span.textContent = part;
                            if (containerRef.current) {
                                containerRef.current.appendChild(span);
                            }
                        }
                    }

                    // MathJax 렌더링
                    if (window.MathJax?.typesetPromise) {
                        await window.MathJax.typesetPromise([containerRef.current]);
                    }
                }
            } catch (error) {
                console.error('LaTeX 렌더링 오류:', error);
            }
        };

        renderMath();
    }, [text, showOriginal]);

    if (!text) return null;

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
                />
            )}
        </div>
    );
}