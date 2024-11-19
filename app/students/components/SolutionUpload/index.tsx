"use client";

import { useState, useEffect } from 'react';
import { submitOCR, submitGrading } from '@/app/utils/clientApi';
import { getCurrentUser } from '@/app/utils/auth';
import UploadForm from './UploadForm';
import OCRResult from './OCRResult';
import GradingResult from './GradingResult';
import LoadingSpinner from './LoadingSpinner';
import type { FeedbackData } from './types';
import LoadingModal from '@/app/components/LoadingModal';

export default function SolutionUpload() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mathTopic, setMathTopic] = useState('algebra');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackData | null>(null);
    const [studentId, setStudentId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [submissionId, setSubmissionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudentId = async () => {
            try {
                const userData = await getCurrentUser();
                setStudentId(userData.data.student_id);
            } catch (error) {
                console.error('Failed to get student ID:', error);
                if (error instanceof Error && (
                    error.message.includes('세션이 만료') || 
                    error.message.includes('401') ||
                    error.message.includes('Unauthorized')
                )) {
                    alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/students/login';
                    return;
                }
                alert('사용자 정보를 불러오는데 실패했습니다.');
            }
        };
        fetchStudentId();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleTextEdit = (newText: string) => {
        if (!feedback) return;
        setFeedback({
            ...feedback,
            edited_text: newText
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !studentId) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('solution_image', selectedFile);
        formData.append('problem_type', mathTopic);
        formData.append('student_id', studentId);

        try {
            const ocrResult = await submitOCR(formData);
            setSubmissionId(ocrResult.submission_id);
            setFeedback({
                extracted_text: ocrResult.extracted_text,
                grading_result: null,
                isGrading: false
            });
            setIsEditing(true);
        } catch (error) {
            console.error('Submit error:', error);
            if (error instanceof Error) {
                alert(`제출에 실패했습니다: ${error.message}`);
            } else {
                alert('제출에 실패했습니다. 다시 시도해주세요.');
            }
            setFeedback(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const startGrading = async () => {
        if (!submissionId || !feedback) return;
        
        try {
            setIsSubmitting(true);
            setFeedback(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    isGrading: true
                };
            });

            const gradingResult = await submitGrading(
                submissionId, 
                feedback.edited_text || feedback.extracted_text
            );
            
            setFeedback(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    grading_result: gradingResult,
                    isGrading: false
                };
            });
        } catch (error) {
            console.error('Grading error:', error);
            alert('채점 중 오류가 발생했습니다.');
            setFeedback(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    isGrading: false
                };
            });
        } finally {
            setIsSubmitting(false);
            setIsEditing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            <LoadingModal 
                isOpen={isSubmitting} 
                message="답안을 분석하고 있습니다" 
                timeout={60}
            />
            <h2 className="text-2xl font-bold mb-6">수학 문제 풀이 제출</h2>
            
            <UploadForm
                mathTopic={mathTopic}
                setMathTopic={setMathTopic}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                isSubmitting={isSubmitting}
                studentId={studentId}
                onFileSelect={handleFileSelect}
                onSubmit={handleSubmit}
            />

            {feedback && (
                <div className="mt-6 space-y-6">
                    <OCRResult
                        feedback={feedback}
                        isEditing={isEditing}
                        isSubmitting={isSubmitting}
                        onEdit={handleTextEdit}
                        onEditToggle={() => setIsEditing(!isEditing)}
                        onEditCancel={() => setIsEditing(false)}
                        onStartGrading={startGrading}
                        showEditControls={!feedback.grading_result}
                    />

                    {feedback.isGrading && <LoadingSpinner />}

                    {feedback.grading_result && (
                        <GradingResult result={feedback.grading_result} />
                    )}
                </div>
            )}
        </div>
    );
}