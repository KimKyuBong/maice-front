"use client";

import type { Grading, DetailedScore } from '../types/student';
import LatexRenderer from './LatexRenderer';

interface GradingDetailProps {
    grading: Grading;
}

export default function GradingDetail({ grading }: GradingDetailProps) {
    if (!grading.detailed_scores || grading.detailed_scores.length === 0) {
        return (
            <div className="border-t border-gray-200 p-4">
                <div className="text-gray-500 text-center">
                    세부 채점 결과가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="border-t border-gray-200">
            {grading.feedback && (
                <div className="p-4 border-b border-gray-200">
                    <h4 className="font-medium mb-2">채점 기준 원본</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <LatexRenderer text={grading.feedback} />
                    </div>
                </div>
            )}

            <div className="p-4">
                <h4 className="font-medium mb-3">세부 채점 결과</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">채점 기준</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 w-20">배점</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 w-20">획득 점수</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {grading.detailed_scores.map((score: DetailedScore) => (
                                <tr key={score.id}>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-gray-900">
                                            {score.detailed_criteria?.item || `채점 기준 ${score.detailed_criteria_id}`}
                                        </div>
                                        {score.detailed_criteria?.description && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {score.detailed_criteria.description}
                                            </div>
                                        )}
                                        {score.feedback && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                <LatexRenderer text={score.feedback} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {score.detailed_criteria?.points || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {score.score}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">총점</td>
                                <td className="px-4 py-3 text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        {grading.total_score ?? 0} / {grading.max_score ?? 0}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 