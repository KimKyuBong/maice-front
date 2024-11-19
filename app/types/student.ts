export interface Expression {
    original: string;
    latex: string;
}

export interface SolutionStep {
    step_number: number;
    content: string;
    expressions: Expression[];
}

export interface DetailedCriteria {
    id: number;
    item: string;
    points: number;
    description: string;
}

export interface GradingCriteria {
    id: number;
    problem_key: string;
    total_points: number;
    correct_answer: string;
    detailed_criteria: DetailedCriteria[];
}

export interface DetailedScore {
    id: number;
    detailed_criteria_id: number;
    score: number;
    feedback: string | null;
    detailed_criteria: DetailedCriteria | null;
}

export interface Submission {
    id: number;
    student_id: string;
    problem_key: string;
    image_data: string | null;
    mime_type: string;
    created_at: string;
}

export interface Score {
    criterion: string;
    score: number;
    feedback?: string;
    id: string;
}

export interface Grading {
    id: string;
    student_id: string;
    problem_key: string;
    extracted_text?: string;
    total_score?: number;
    max_score?: number;
    feedback: string;
    grading_number: number;
    created_at: string;
    grading_criteria: GradingCriteria | null;
    detailed_scores: DetailedScore[];
    submission: Submission;
    latex_expressions: Expression[];
}

export interface Student {
    id: string;
    created_at: string;
    gradings_count: number;
    latest_grading?: {
        problem_key: string;
        total_score: number;
        created_at: string;
    };
} 