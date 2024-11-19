import type { DetailedScore } from "../utils/clientApi";

export interface GradingHistoryItem {
    id: number;
    submission_id: string;
    student_id: string;
    problem_key: string;
    problem_type: string;
    submission_date: string;
    image_url: string;
    extracted_text: string;
    solution_steps: string[];
    latex_expressions: string[];
    total_score: number;
    max_score: number;
    feedback: string;
    grading_number: number;
    image_path: string;
    created_at: string;
    detailed_scores: DetailedScore[];
    submission: {
        id: string;
        student_id: string;
        problem_type: string;
        image_path: string;
        extracted_text: string;
        created_at: string;
    };
} 