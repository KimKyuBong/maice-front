import type { LoadingSpinnerProps } from './types';

export default function LoadingSpinner({ message = '채점이 진행중입니다...' }: LoadingSpinnerProps) {
    return (
        <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                <p className="text-blue-600">{message}</p>
            </div>
        </div>
    );
}