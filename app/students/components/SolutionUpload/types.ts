export interface DetailedCriteria {
    id?: number;
    item: string;
    points: number;
    description: string;
}

export interface CriteriaResponse {
    problem_key: string;
    total_points: number;
    description?: string;
}

export interface DetailedScore {
    detailed_criteria_id: number;
    score: number;
    feedback: string;
    detailed_criteria: DetailedCriteria;
}

export interface GradingResult {
    id: number;
    student_id: string;
    problem_key: string;
    submission_id: string;
    extraction_id: string;
    extracted_text: string;
    total_score: number;
    max_score: number;
    feedback: string;
    grading_number: number;
    image_path: string;
    created_at: string;
    detailed_scores: DetailedScore[];
}

export interface FeedbackData {
    extracted_text: string;
    edited_text?: string;
    grading_result: GradingResult | null;
    isGrading: boolean;
}

export interface UploadFormProps {
    selectedFile: File | null;
    previewUrl: string | null;
    isSubmitting: boolean;
    studentId: string | null;
    selectedProblemKey: string;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export interface OCRResultProps {
    feedback: FeedbackData;
    isSubmitting: boolean;
    onEdit: (newText: string) => void;
    onStartGrading: () => Promise<void>;
}

export interface GradingResultProps {
    result: GradingResult;
}

export interface LoadingSpinnerProps {
    message?: string;
}