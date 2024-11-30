"use client";

import LatexRenderer from '@/app/components/LatexRenderer';
import type { OCRResultProps } from './types';
import { useState } from 'react';

export default function OCRResult({
    feedback,
    isSubmitting,
    onEdit,
    onStartGrading
}: OCRResultProps) {
    const [editedText, setEditedText] = useState(feedback.edited_text || feedback.extracted_text);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedText(e.target.value);
        onEdit(e.target.value);
    };

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">OCR 결과</h3>
                
                {/* 원문 텍스트 편집 영역 */}
                <div className="mb-4">
                    <label htmlFor="ocr-text" className="block text-sm font-medium text-gray-700 mb-2">
                        원문 텍스트 (수정 가능)
                    </label>
                    <textarea
                        id="ocr-text"
                        value={editedText}
                        onChange={handleTextChange}
                        className="w-full h-32 p-2 border rounded-md font-mono text-sm"
                        placeholder="OCR 결과가 여기에 표시됩니다..."
                    />
                </div>

                {/* LaTeX 렌더링 결과 */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        수식 미리보기
                    </h4>
                    <div className="bg-white p-4 border rounded-md min-h-[100px]">
                        <LatexRenderer text={editedText} />
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onStartGrading}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    채점 시작
                </button>
            </div>
        </div>
    );
}