"use client";

import { useState, useEffect } from 'react';
import { fetchGradingHistory } from '@/app/utils/clientApi';
import type { GradingHistoryItem } from '@/app/students/types';

interface SidebarProps {
    onSelectGrading: (grading: GradingHistoryItem) => void;
    selectedId?: string;
}

export default function Sidebar({ onSelectGrading, selectedId }: SidebarProps) {
    const [gradingHistory, setGradingHistory] = useState<GradingHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadGradingHistory = async () => {
            try {
                setIsLoading(true);
                const response = await fetchGradingHistory();
                if (response.data) {
                    setGradingHistory(response.data.items);
                } else if (response.error) {
                    console.error('채점 이력 로드 실패:', response.error);
                }
            } catch (error) {
                console.error('채점 이력 로드 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadGradingHistory();
    }, []);

    if (isLoading) {
        return (
            <div className="w-80 bg-white border-r border-gray-200 p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-100 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto h-screen">
            <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">채점 이력</h2>
                <div className="space-y-2">
                    {gradingHistory.map((item) => (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => onSelectGrading(item)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onSelectGrading(item);
                                }
                            }}
                            className={`w-full text-left p-3 rounded-lg ${
                                selectedId === item.id.toString()
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">
                                    {item.problem_key}
                                </span>
                                <span className="text-sm text-blue-600 font-semibold">
                                    {item.total_score}/{item.max_score}점
                                </span>
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(item.created_at).toLocaleDateString()}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
} 