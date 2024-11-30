"use client";

import { useState, useEffect } from 'react';
import type { CriteriaResponse, CriteriaFormData } from './types';

const DEFAULT_CRITERIA: CriteriaFormData = {
    problem_key: '',
    total_points: 100,
    correct_answer: '',
    description: '',
    detailed_criteria: [
        {
            item: '문제 이해',
            points: 30,
            description: '문제의 정확한 이해와 해석'
        }
    ]
};

export default function CriteriaViewer({ problemKey }: { problemKey: string }) {
    const [criteria, setCriteria] = useState<CriteriaFormData | null>(null);

    useEffect(() => {
        const fetchCriteria = async () => {
            try {
                const response = await fetch(`/api/criteria/${problemKey}`);
                if (response.ok) {
                    const data = await response.json();
                    setCriteria(data);
                }
            } catch (error) {
                console.error('Error fetching criteria:', error);
            }
        };

        if (problemKey) {
            fetchCriteria();
        }
    }, [problemKey]);

    if (!criteria) {
        return <div>채점 기준을 불러오는 중...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">채점 기준</h3>
                    <p className="mt-1 text-sm text-gray-500">{criteria.description}</p>
                </div>

                <div>
                    <h4 className="text-md font-medium text-gray-700">총점: {criteria.total_points}점</h4>
                </div>

                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700">세부 채점 기준</h4>
                    {criteria.detailed_criteria.map((item) => (
                        <div key={item.item} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h5 className="font-medium">{item.item}</h5>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                                <div className="text-lg font-medium">{item.points}점</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 