"use client";

import { useState, useEffect } from 'react';
import { listGradingCriteria } from '@/app/utils/clientApi';
import type { CriteriaResponse } from './types';

export default function CriteriaList() {
    const [criteria, setCriteria] = useState<CriteriaResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCriteria();
    }, []);

    const loadCriteria = async () => {
        try {
            setIsLoading(true);
            const response = await listGradingCriteria();
            console.log('Raw API Response:', response);
            
            if (response.success && response.data) {
                console.log('Criteria Data:', response.data);
                setCriteria(response.data);
            } else {
                console.warn('Invalid response format:', response);
            }
        } catch (error) {
            console.error('채점 기준 목록 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (criteria.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">저장된 채점 기준이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {criteria.map((item: CriteriaResponse) => (
                <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-medium text-gray-900">{item.problem_key}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            총점: {item.total_points}점
                        </div>
                    </div>
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">세부 기준</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {item.detailed_criteria.map((criteria, index) => (
                                <div key={criteria.id} className="text-sm text-gray-600 flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <div>
                                        <span className="font-medium">{criteria.item}</span>
                                        <span className="text-gray-500 ml-2">- {criteria.description}</span>
                                    </div>
                                    <span className="text-blue-600 font-medium">{criteria.points}점</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
} 