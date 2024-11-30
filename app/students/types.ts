export interface GradingListItem {
    id: number;
    problem_key: string;
    total_score: number;
    max_score: number;
    created_at: string;
    grading_number: number;
}

export interface DetailedCriteria {
    id: number;
    item: string;
    points: number;
    description: string;
}

export interface DetailedScore {
    id: number;
    detailed_criteria_id: number;
    score: number;
    feedback: string;
    detailed_criteria: DetailedCriteria;
}

export interface GradingDetail {
    id: number;
    student_id: string;
    problem_key: string;
    submission_id: number;
    extraction_id: number;
    extracted_text: string;
    total_score: number;
    max_score: number;
    feedback: string;
    grading_number: number;
    image_path: string;
    created_at: string;
    detailed_scores: DetailedScore[];
}


// 채점 목록 응답 데이터 타입
export interface GradingListResponse {
  items: GradingListItem[];
  total: number;
  limit: number;
  offset: number;
} 