import type { GradingHistoryItem } from '../../types';
import LatexRenderer from '@/app/components/LatexRenderer';

interface GradingResultProps {
    result: GradingHistoryItem;
}

export default function GradingResult({ result }: GradingResultProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">채점 결과</h2>
                <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-blue-600">
                        {result.total_score}
                    </span>
                    <span className="text-gray-500">/ {result.max_score}점</span>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">제출된 답안</h3>
                    {result.image_data ? (
                        <img
                            src={`data:image/jpeg;base64,${result.image_data}`}
                            alt="제출된 답안"
                            className="max-w-full h-auto rounded-lg border"
                        />
                    ) : (
                        <div className="bg-gray-100 rounded-lg border p-4 text-center text-gray-500">
                            이미지를 불러올 수 없습니다
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">채점 피드백</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <LatexRenderer text={result.feedback} />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">인식된 수식</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <LatexRenderer text={result.extracted_text} />
                    </div>
                </div>

                {result.detailed_scores && result.detailed_scores.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">세부 채점 결과</h3>
                        <div className="space-y-2">
                            {result.detailed_scores.map((score) => (
                                <div 
                                    key={score.detailed_criteria_id}
                                    className="bg-gray-50 p-4 rounded-md"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                {score.detailed_criteria?.item}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {score.detailed_criteria?.description}
                                            </p>
                                        </div>
                                        <div className="flex items-baseline space-x-1">
                                            <span className="text-lg font-semibold text-blue-600">
                                                {score.score}
                                            </span>
                                            <span className="text-gray-500">
                                                / {score.detailed_criteria?.points}점
                                            </span>
                                        </div>
                                    </div>
                                    {score.feedback && (
                                        <div className="text-sm text-gray-600">
                                            <LatexRenderer text={score.feedback} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 