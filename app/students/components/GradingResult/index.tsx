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
                    <img
                        src={result.image_url}
                        alt="제출된 답안"
                        className="max-w-full h-auto rounded-lg border"
                    />
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
            </div>
        </div>
    );
} 