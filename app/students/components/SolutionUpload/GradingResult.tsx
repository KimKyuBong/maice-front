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
                        {result.total_score.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                        / {result.max_score.toFixed(1)}점
                    </span>
                </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
                <LatexRenderer text={result.feedback} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">세부 평가</h3>
            <div className="space-y-4">
                {result.detailed_scores.map((score) => (
                    <div 
                        key={score.detailed_criteria_id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                        <div className="bg-gray-50 p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-gray-900">
                                        {score.criteria_info.item}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {score.criteria_info.description}
                                    </p>
                                </div>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-xl font-semibold text-blue-600">
                                        {score.score.toFixed(1)}
                                    </span>
                                    <span className="text-gray-500">
                                        / {score.criteria_info.points.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-white">
                            <LatexRenderer text={score.feedback} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}