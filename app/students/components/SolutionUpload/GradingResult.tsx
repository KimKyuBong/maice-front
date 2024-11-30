"use client";

import LatexRenderer from '@/app/components/LatexRenderer';
import type { GradingResultProps } from './types';

export default function GradingResult({ result }: GradingResultProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">채점 결과</h3>
                <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-blue-600">
                        {result.total_score}
                    </span>
                    <span className="text-gray-500">
                        / {result.max_score}점
                    </span>
                </div>
            </div>

            {/* 채점 피드백 */}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
                <LatexRenderer text={result.feedback} />
            </div>

            {/* 인식된 텍스트 */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">인식된 답안</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                    <LatexRenderer text={result.extracted_text} />
                </div>
            </div>

            {/* 세부 채점 결과 */}
            <div className="space-y-4">
                {result.detailed_scores?.map((score) => (
                    <div 
                        key={score.detailed_criteria_id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                        <div className="bg-gray-50 p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    {score.detailed_criteria ? (
                                        <>
                                            <h4 className="font-medium text-gray-900">
                                                {score.detailed_criteria.item}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {score.detailed_criteria.description}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-red-500 mt-1">세부 기준 정보가 없습니다.</p>
                                    )}
                                </div>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-xl font-semibold text-blue-600">
                                        {score.score}
                                    </span>
                                    <span className="text-gray-500">
                                        / {score.detailed_criteria?.points || 0}점
                                    </span>
                                </div>
                            </div>
                            {score.feedback && (
                                <div className="mt-2">
                                    <LatexRenderer text={score.feedback} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}