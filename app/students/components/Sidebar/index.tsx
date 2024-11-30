"use client";

import { useState, useEffect } from 'react';
import { fetchGradingHistory, fetchGradingDetail } from '@/app/utils/clientApi';
import type { GradingListItem, GradingListResponse } from '@/app/students/types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
    onSelectGrading: (grading: GradingListItem) => void;
    selectedId?: string;
    onNewGrading: () => void;
}

export default function Sidebar({ onSelectGrading, selectedId, onNewGrading }: SidebarProps) {
    const [gradingHistory, setGradingHistory] = useState<GradingListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const loadGradingHistory = async () => {
            try {
                setIsLoading(true);
                const response = await fetchGradingHistory();
                if (response.data?.items) {
                    setGradingHistory(response.data.items);
                }
            } catch (error) {
                console.error('채점 이력 로드 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadGradingHistory();
    }, []);

    const handleGradingSelect = async (item: GradingListItem) => {
        try {
            const detailResponse = await fetchGradingDetail(item.id);
            if (detailResponse.success && detailResponse.data) {
                onSelectGrading(detailResponse.data);
            } else {
                throw new Error('채점 상세 정보를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('채점 상세 정보 로드 실패:', error);
            alert('채점 상세 정보를 불러오는데 실패했습니다.');
        }
    };

    if (isLoading) {
        return (
            <div className={`bg-white border-r border-gray-200 p-4 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
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
        <div className={`relative bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
            {/* 접기/펼치기 버튼 */}
            <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-4 bg-white border border-gray-200 rounded-full p-1 shadow-sm z-10"
            >
                {isCollapsed ? (
                    <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                ) : (
                    <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
                )}
            </button>

            {/* 메인 컨텐츠 */}
            <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'hidden' : ''}`}>
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">채점 이력</h2>
                    <div className="space-y-2">
                        {gradingHistory.map((item) => (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => handleGradingSelect(item)}
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
                                    {new Date(item.created_at).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false
                                    })}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 새 채점 버튼 */}
            <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'hidden' : ''}`}>
                <button
                    type="button"
                    onClick={onNewGrading}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>새 채점</span>
                </button>
            </div>
        </div>
    );
} 