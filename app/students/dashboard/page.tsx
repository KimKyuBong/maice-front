"use client";

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SolutionUpload from '../components/SolutionUpload';
import GradingResult from '../components/GradingResult';
import type { GradingHistoryItem } from '../types';

export default function StudentDashboard() {
    const [selectedGrading, setSelectedGrading] = useState<GradingHistoryItem | null>(null);

    const handleGradingSelect = (grading: GradingHistoryItem) => {
        setSelectedGrading(grading);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <Sidebar 
                    onSelectGrading={handleGradingSelect}
                    selectedId={selectedGrading?.id?.toString()}
                />
                <div className="flex-1 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        학생 대시보드
                    </h1>
                    {selectedGrading ? (
                        <div className="bg-white rounded-lg shadow p-6">
                            <GradingResult result={selectedGrading} />
                        </div>
                    ) : (
                        <SolutionUpload />
                    )}
                </div>
            </div>
        </div>
    );
} 