export interface DetailedCriteria {
    id: number;
    item: string;
    points: number;
    description: string;
    grading_criteria_id: number;
    created_at: string;
}

export interface CriteriaResponse {
    id: number;
    problem_key: string;
    total_points: number;
    correct_answer: string | null;
    description: string;
    created_at: string;
    detailed_criteria: DetailedCriteria[];
}

export interface CriteriaFormData {
    problem_key: string;
    total_points: number;
    correct_answer?: string | null;
    description: string;
    detailed_criteria: Array<{
        item: string;
        points: number;
        description: string;
    }>;
}

export interface CriteriaListProps {
    onEdit?: (criteria: CriteriaResponse) => void;
} 