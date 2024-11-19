"use client";

import { useState } from 'react';
import StudentList from './StudentList';
import GradingResults from './GradingResults';
import type { Student, Grading } from '../types/student';
import { getStudentResults } from '../utils/api';

interface DashboardProps {
    students: Student[];
    initialResults: Record<string, Grading[]>;
    initialStudentId: string | null;
}

export default function Dashboard({ 
    students = [], 
    initialResults,
    initialStudentId
}: DashboardProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudentId);
    const [gradingResults, setGradingResults] = useState<Record<string, Grading[]>>(initialResults);
    const [isLoading, setIsLoading] = useState(false);
    
    const selectedStudent = Array.isArray(students) 
        ? students.find(s => s.id === selectedStudentId)
        : undefined;

    const handleStudentSelect = async (studentId: string) => {
        setSelectedStudentId(studentId);
        setIsLoading(true);
        try {
            const results = await getStudentResults(studentId);
            setGradingResults(results);
        } catch (error) {
            console.error('Error fetching results for student:', studentId, error);
            setGradingResults({});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 min-w-[300px] border-r bg-white p-4 overflow-y-auto">
                <StudentList 
                    students={Array.isArray(students) ? students : []}
                    selectedId={selectedStudentId}
                    onSelect={handleStudentSelect}
                />
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
                {selectedStudent ? (
                    <GradingResults 
                        student={selectedStudent}
                        gradingResults={gradingResults}
                        isLoading={isLoading}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        학생을 선택해주세요
                    </div>
                )}
            </div>
        </div>
    );
} 