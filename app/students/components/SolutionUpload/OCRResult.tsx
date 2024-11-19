"use client";

import LatexRenderer from '@/app/components/LatexRenderer';
import type { OCRResultProps } from './types';

export default function OCRResult({
    feedback,
    isEditing,
    isSubmitting,
    onEdit,
    onEditToggle,
    onEditCancel,
    onStartGrading,
    showEditControls
}: OCRResultProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">답안 인식 결과</h3>
                {showEditControls && (
                    <button
                        type="button"
                        onClick={onEditToggle}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        {isEditing ? '수정 취소' : '수식 수정'}
                    </button>
                )}
            </div>
            
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">원본 텍스트:</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                            {feedback.extracted_text}
                        </pre>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">수식 렌더링:</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <LatexRenderer text={feedback.edited_text || feedback.extracted_text} />
                    </div>
                </div>

                {showEditControls && isEditing && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">수식 수정:</h4>
                        <textarea
                            value={feedback.edited_text || feedback.extracted_text}
                            onChange={(e) => onEdit(e.target.value)}
                            className="w-full h-32 p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="수식을 수정하세요..."
                        />
                    </div>
                )}

                {showEditControls && (
                    <div className="mt-4 flex justify-end space-x-3">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={onEditCancel}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
                            >
                                수정 취소
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onStartGrading}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? '채점 중...' : '채점 시작하기'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}