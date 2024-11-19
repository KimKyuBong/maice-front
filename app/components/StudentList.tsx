"use client";

import type { Student } from '../types/student';

interface StudentListProps {
    students: Student[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function StudentList({ students, selectedId, onSelect }: StudentListProps) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">학생 목록</h2>
            <div className="space-y-2">
                {students.map((student) => (
                    <button
                        type="button"
                        key={student.id}
                        onClick={() => onSelect(student.id)}
                        className={`w-full p-3 text-left rounded-lg transition-colors ${
                            selectedId === student.id 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <div className="font-medium">학생 ID: {student.id}</div>
                        <div className="text-sm text-gray-500">
                            채점 수: {student.gradings_count}
                        </div>
                        {student.latest_grading && (
                            <div className="text-sm text-gray-500">
                                최근 채점: {new Date(student.latest_grading.created_at).toLocaleDateString()}
                                (문제: {student.latest_grading.problem_key}, 
                                점수: {student.latest_grading.total_score})
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}