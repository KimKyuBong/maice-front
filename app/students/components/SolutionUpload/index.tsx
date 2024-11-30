"use client";

import { useState, useEffect, useRef } from 'react';
import { submitOCR, submitGrading, listGradingCriteria } from '@/app/utils/clientApi';
import { getCurrentUser } from '@/app/utils/auth';
import UploadForm from './UploadForm';
import OCRResult from './OCRResult';
import GradingResult from './GradingResult';
import LoadingSpinner from './LoadingSpinner';
import type { FeedbackData } from './types';
import LoadingModal from '@/app/components/LoadingModal';
import type { CriteriaResponse } from '@/app/students/components/CriteriaManager/types';

export default function SolutionUpload() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackData | null>(null);
    const [studentId, setStudentId] = useState<string | null>(null);
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [problemKeys, setProblemKeys] = useState<string[]>([]);
    const [selectedProblemKey, setSelectedProblemKey] = useState<string>('');
    const [allCriteria, setAllCriteria] = useState<CriteriaResponse[]>([]);

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

    useEffect(() => {
        const fetchCriteria = async () => {
            try {
                const response = await listGradingCriteria();
                if (response.data) {
                    setAllCriteria(response.data);
                    const keys = response.data.map((c: CriteriaResponse) => c.problem_key);
                    setProblemKeys(keys);
                    
                    const defaultCriteria = response.data.find(c => c.problem_key === "default");
                    if (defaultCriteria) {
                        setSelectedProblemKey(defaultCriteria.problem_key);
                    } else if (keys.length > 0) {
                        setSelectedProblemKey(keys[0]);
                    }
                }
            } catch (error) {
                console.error('채점 기준 조회 실패:', error);
            }
        };
        fetchCriteria();
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const newPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(newPreviewUrl);
        }
    };

    const textEditTimeoutRef = useRef<NodeJS.Timeout>();
    
    const handleTextEdit = (newText: string) => {
        if (!feedback) return;
        
        if (textEditTimeoutRef.current) {
            clearTimeout(textEditTimeoutRef.current);
        }
        
        textEditTimeoutRef.current = setTimeout(() => {
            setFeedback({
                ...feedback,
                edited_text: newText
            });
        }, 300);
    };

    useEffect(() => {
        return () => {
            if (textEditTimeoutRef.current) {
                clearTimeout(textEditTimeoutRef.current);
            }
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !studentId || !selectedProblemKey) {
            alert('파일, 학생 ID, 문제 키가 모두 필요합니다.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('solution_image', selectedFile);
        formData.append('problem_key', selectedProblemKey);
        formData.append('student_id', studentId);

        try {
            const ocrResult = await submitOCR(formData);
            if (!ocrResult.success || !ocrResult.data) {
                throw new Error(ocrResult.message || 'OCR 결과가 없습니다.');
            }

            const extractedText = ocrResult.data.extracted_text;
            if (!extractedText.includes('$$')) {
                console.warn('OCR 결과에 LaTeX 수식이 없거나 올바르지 않은 형식입니다.');
            }

            setSubmissionId(String(ocrResult.data.submission_id));
            setFeedback({
                extracted_text: extractedText,
                grading_result: null,
                isGrading: false,
                edited_text: extractedText
            });
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
        
        const textToGrade = feedback.edited_text || feedback.extracted_text;
        if (!textToGrade.includes('$$')) {
            if (!confirm('수식이 올바른 형식($$)으로 감싸져 있지 않을 수 있습니다. 계속하시겠습니까?')) {
                return;
            }
        }
        
        try {
            setIsSubmitting(true);
            setFeedback(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    isGrading: true
                };
            });

            const gradingResultResponse = await submitGrading(
                submissionId, 
                textToGrade
            );

            if (!gradingResultResponse.data) {
                throw new Error('채점 결과가 없습니다.');
            }

            setFeedback(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    grading_result: gradingResultResponse.data,
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
        }
    };

    const handleProblemKeySelect = (key: string) => {
        setSelectedProblemKey(key);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            <LoadingModal 
                isOpen={isSubmitting} 
                message="답안을 분석하고 있습니다" 
                timeout={20}
            />
            <h2 className="text-2xl font-bold mb-6">수학 문제 풀이 제출</h2>
            
            <div className="mb-6">
                <div className="flex flex-col">
                    <label htmlFor="problem-select" className="block text-sm font-medium text-gray-700 mb-2">
                        채점 기준 선택
                    </label>
                    <select 
                        id="problem-select"
                        value={selectedProblemKey}
                        onChange={(e) => handleProblemKeySelect(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm"
                    >
                        {problemKeys.map(key => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                    </select>
                </div>
            </div>

            <UploadForm
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                isSubmitting={isSubmitting}
                studentId={studentId}
                selectedProblemKey={selectedProblemKey}
                onFileSelect={handleFileSelect}
                onSubmit={handleSubmit}
            />

            {feedback && (
                <div className="mt-6 space-y-6">
                    <OCRResult
                        feedback={feedback}
                        isSubmitting={isSubmitting}
                        onEdit={handleTextEdit}
                        onStartGrading={startGrading}
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