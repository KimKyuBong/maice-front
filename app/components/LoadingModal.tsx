import { useEffect, useState, useCallback } from 'react';

interface LoadingModalProps {
    isOpen: boolean;
    message: string;
    timeout?: number;
    onClose?: () => void;
}

export default function LoadingModal({ 
    isOpen, 
    message, 
    timeout = 60,
    onClose 
}: LoadingModalProps) {
    const [progress, setProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState(timeout);
    const [showModal, setShowModal] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    // 진행률과 남은 시간을 업데이트하는 함수
    const updateProgress = useCallback(() => {
        if (!startTime) return;
        
        const elapsedTime = Date.now() - startTime;
        const newProgress = Math.min((elapsedTime / (timeout * 1000)) * 100, 100);
        const newTimeLeft = Math.max(timeout - (elapsedTime / 1000), 0);
        
        setProgress(newProgress);
        setTimeLeft(newTimeLeft);

        return newProgress >= 100;
    }, [startTime, timeout]);

    // 모달 상태 관리
    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
            setProgress(0);
            setTimeLeft(timeout);
            setStartTime(Date.now());
        } else {
            setProgress(100);
            const timer = setTimeout(() => {
                setShowModal(false);
                setProgress(0);
                setStartTime(null);
                onClose?.();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, timeout, onClose]);

    // 프로그레스 업데이트 인터벌
    useEffect(() => {
        if (!isOpen || !startTime) return;

        const interval = setInterval(() => {
            const isComplete = updateProgress();
            if (isComplete) {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isOpen, startTime, updateProgress]);

    const handleClose = () => {
        if (isOpen) return;
        setShowModal(false);
        setProgress(0);
        setStartTime(null);
        onClose?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
            handleClose();
        }
    };

    if (!showModal) return null;

    return (
        <button 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full border-0"
            onClick={handleClose}
            onKeyDown={handleKeyDown}
            type="button"
        >
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {message}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {progress < 100 ? `남은 시간: ${Math.ceil(timeLeft)}초` : '완료되었습니다!'}
                    </p>
                </div>
                
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                
                <div className="mt-4 text-sm text-gray-600 text-center">
                    {progress < 100 ? '잠시만 기다려주세요...' : '처리가 완료되었습니다'}
                </div>
            </div>
        </button>
    );
}