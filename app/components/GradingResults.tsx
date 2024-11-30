"use client";

import { useState } from 'react';
import type { Student, Grading, Submission } from '../types/student';
import GradingDetail from './GradingDetail';
import LatexRenderer from './LatexRenderer';

interface GradingResultsProps {
    student: Student;
    gradingResults: Record<string, Grading[]>;
    isLoading: boolean;
}

export default function GradingResults({ 
    student, 
    gradingResults, 
    isLoading 
}: GradingResultsProps) {
    const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
    const [selectedGradingId, setSelectedGradingId] = useState<string | null>(null);
    const [imageLoadError, setImageLoadError] = useState<boolean>(false);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.error('이미지 로드 실패');
        setImageLoadError(true);
        e.currentTarget.src = '/fallback-image.png';
    };

    const renderImage = (submission: Submission) => {
        if (!submission?.image_data) {
            return (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-gray-500">
                        <p className="mt-2">제출된 이미지가 없습니다</p>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <img 
                    src={`data:${submission.mime_type};base64,${submission.image_data}`}
                    alt="제출된 답안"
                    className="max-w-full h-auto rounded-lg border"
                    onError={handleImageError}
                />
                {imageLoadError && (
                    <div className="mt-2 text-sm text-red-500">
                        이미지를 불러오는데 실패했습니다.
                    </div>
                )}
                <div className="mt-2 text-sm text-gray-500">
                    이미지 데이터 크기: {(submission.image_data.length / 1024).toFixed(2)} KB
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">채점 결과</h2>
            
            {isLoading ? (
                <div className="text-center py-4">채점 결과를 불러오는 중...</div>
            ) : (
                <>
                    {/* 문제 목록 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(gradingResults).map(([problemKey, gradings]) => (
                            <button
                                type="button"
                                key={problemKey}
                                onClick={() => {
                                    setSelectedProblem(selectedProblem === problemKey ? null : problemKey);
                                    setSelectedGradingId(null);
                                }}
                                className={`p-4 rounded-lg border transition-colors text-left ${
                                    selectedProblem === problemKey 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="font-medium">문제 {problemKey}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    채점 횟수: {gradings?.length || 0}회
                                </div>
                                <div className="text-sm text-gray-500">
                                    최근 점수: {gradings[0]?.total_score ?? 0} / {gradings[0]?.max_score ?? 0}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* 선택된 문제의 채점 이력 */}
                    {selectedProblem && gradingResults[selectedProblem] && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4">
                                문제 {selectedProblem} 채점 이력
                            </h3>
                            
                            {/* 원본 이미지 */}
                            <div className="mb-6">
                                <h4 className="font-medium mb-2">제출된 원본 답안</h4>
                                {renderImage(gradingResults[selectedProblem]?.[0]?.submission)}
                            </div>

                            {/* 채점 이력 목록 */}
                            <div className="space-y-4">
                                {gradingResults[selectedProblem].map((grading: Grading) => (
                                    <div 
                                        key={grading.id}
                                        className="border rounded-lg bg-white overflow-hidden"
                                    >
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium">
                                                        {new Date(grading.created_at).toLocaleString('ko-KR', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit',
                                                            hour12: false
                                                        })}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        점수: {grading.total_score} / {grading.max_score}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedGradingId(
                                                        selectedGradingId === grading.id ? null : grading.id
                                                    )}
                                                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    {selectedGradingId === grading.id ? '접기' : '자세히'}
                                                </button>
                                            </div>

                                            {/* OCR 결과 */}
                                            <div className="mt-2">
                                                <div className="text-sm font-medium text-gray-700">OCR 결과:</div>
                                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                                                    <LatexRenderer text={grading.extracted_text || '추출된 텍스트 없음'} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 상세 채점 결과 */}
                                        {selectedGradingId === grading.id && (
                                            <GradingDetail grading={grading} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 