'use client';

import type { 
    CriteriaResponse 
} from '@/app/students/components/CriteriaManager/types';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    error: string | null;
    data: T | null;
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

export interface GradingHistoryItem {
    id: number;
    student_id: string;
    problem_key: string;
    problem_type: string;
    submission_id: string;
    extraction_id: string;
    submission_date: string;
    image_path: string;
    extracted_text: string;
    total_score: number;
    max_score: number;
    feedback: string;
    grading_number: number;
    created_at: string;
    detailed_scores: DetailedScore[];
}

export interface SubmissionResponse {
    student_id: string;
    problem_key: string;
    image_path: string;
    extracted_text: string;
    extraction_number: number;
    grading_result: GradingHistoryItem;
}

export interface OCRData {
    submission_id: number;
    extracted_text: string;
    problem_key: string;
    student_id: string;
}

export type OCRResponse = ApiResponse<OCRData>;

export interface GradingListResponse {
    items: GradingHistoryItem[];
    total: number;
    limit: number;
    offset: number;
}

export interface CriteriaFormData {
    problem_key: string;
    problem_type: string;
    items: Array<{
        item: string;
        points: number;
        description: string;
    }>;
}

const TIMEOUT_DURATION = 180000; // 3분

export async function fetchClientApi<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
        const response = await fetch(`/api${url}`, {
            ...options,
            signal: controller.signal,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });
        
        clearTimeout(timeout);
        const data = await response.json();
        
        return {
            success: data.success,
            message: data.message || '',
            error: data.error || null,
            data: data.data
        };
    } catch (error) {
        clearTimeout(timeout);
        return {
            success: false,
            message: '요청 처리 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            data: null
        };
    }
}

async function fetchClientApiFormData<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
        const response = await fetch(`/api${url}`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            credentials: 'include'
        });
        
        clearTimeout(timeout);
        const data = await response.json();
        
        return {
            success: data.success,
            message: data.message || '',
            error: data.error || null,
            data: data.data
        };
    } catch (error) {
        clearTimeout(timeout);
        return {
            success: false,
            message: '요청 처리 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            data: null
        };
    }
}

export async function submitSolution(formData: FormData): Promise<ApiResponse<SubmissionResponse>> {
    return fetchClientApiFormData<SubmissionResponse>('/evaluation/submit', formData);
}

export async function submitOCR(formData: FormData): Promise<OCRResponse> {
    return fetchClientApiFormData<OCRData>('/submission/ocr', formData);
}

export async function submitGrading(submissionId: string, editedText?: string): Promise<ApiResponse<GradingHistoryItem>> {
    return fetchClientApi<GradingHistoryItem>(`/submission/grade/${submissionId}`, {
        method: 'POST',
        body: editedText ? JSON.stringify({ edited_text: editedText }) : undefined
    });
}

export async function fetchGradingHistory(
    studentId?: string,
    problemKey?: string,
    limit = 10,
    offset = 0
): Promise<ApiResponse<GradingListResponse>> {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId);
    if (problemKey) params.append('problem_key', problemKey);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return fetchClientApi<GradingListResponse>(`/gradings/list?${params.toString()}`);
}

export async function createGradingCriteria(data: CriteriaFormData): Promise<ApiResponse<CriteriaResponse>> {
    return fetchClientApi<CriteriaResponse>('/criteria', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function listGradingCriteria(
    skip = 0,
    limit = 10
): Promise<ApiResponse<CriteriaResponse[]>> {
    return fetchClientApi<CriteriaResponse[]>(`/criteria/list?skip=${skip}&limit=${limit}`);
}

export async function updateGradingCriteria(
    criteriaId: number,
    data: Partial<CriteriaFormData>
): Promise<ApiResponse<CriteriaResponse>> {
    return fetchClientApi<CriteriaResponse>(`/criteria/${criteriaId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export async function deleteGradingCriteria(criteriaId: number): Promise<ApiResponse<void>> {
    return fetchClientApi(`/criteria/${criteriaId}`, {
        method: 'DELETE'
    });
}

export async function getCriteriaByProblem(problemKey: string): Promise<ApiResponse<CriteriaResponse>> {
    return fetchClientApi<CriteriaResponse>(`/criteria/${problemKey}/`);
}

export async function fetchGradingDetail(id: number): Promise<ApiResponse<GradingHistoryItem>> {
    return fetchClientApi<GradingHistoryItem>(`/gradings/${id}`);
} 