import type { GradingResult } from '@/app/utils/clientApi';

export interface FeedbackData {
    extracted_text: string;
    edited_text?: string;
    grading_result: GradingResult | null;
    isGrading?: boolean;
}

export interface UploadFormProps {
    mathTopic: string;
    setMathTopic: (topic: string) => void;
    selectedFile: File | null;
    previewUrl: string | null;
    isSubmitting: boolean;
    studentId: string | null;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export interface OCRResultProps {
    feedback: FeedbackData;
    isEditing: boolean;
    isSubmitting: boolean;
    onEdit: (newText: string) => void;
    onEditToggle: () => void;
    onEditCancel: () => void;
    onStartGrading: () => void;
    showEditControls: boolean;
}

export interface GradingResultProps {
    result: GradingResult;
}

export interface LoadingSpinnerProps {
    message?: string;
}