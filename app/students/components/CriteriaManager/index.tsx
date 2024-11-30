"use client";

import CriteriaList from './CriteriaList';

export default function CriteriaManager() {
    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                    <div className="whitespace-nowrap py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                        채점 기준 목록
                    </div>
                </nav>
            </div>
            <CriteriaList />
        </div>
    );
} 