'use client';

interface ApiResponse<T> {
    data: T;
    error?: string;
}

export interface DetailedScore {
    detailed_criteria_id: number;
    criteria_info: {
        item: string;
        points: number;
        description: string;
    };
    score: number;
    feedback: string;
}

export interface GradingResult {
    total_score: number;
    max_score: number;
    feedback: string;
    detailed_scores: DetailedScore[];
}

export interface SubmissionResponse {
    student_id: string;
    problem_key: string;
    image_path: string;
    extracted_text: string;
    extraction_number: number;
    grading_result: GradingResult;
}

export interface OCRResponse {
    submission_id: string;
    extracted_text: string;
}

import type { GradingHistoryItem } from '@/app/students/types';

export interface GradingListResponse {
    items: GradingHistoryItem[];
    total: number;
    limit: number;
    offset: number;
}

async function fetchClientApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
        const url = `/api${endpoint}`;
        
        const headers = options.body instanceof FormData
            ? undefined
            : {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options.headers,
            };

        const res = await fetch(url, {
            ...options,
            credentials: 'include',
            headers,
        });

        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return { data };
    } catch (error) {
        return {
            data: null as T,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function submitSolution(formData: FormData): Promise<SubmissionResponse> {
    try {
        const response = await fetch('/api/evaluation/submit', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// API 타임아웃 설정
const TIMEOUT_DURATION = 180000; // 3분으로 증가

const fetchWithTimeout = async (url: string, options: RequestInit) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeout);
        return response;
    } catch (error) {
        clearTimeout(timeout);
        throw error;
    }
};

export async function submitOCR(formData: FormData): Promise<OCRResponse> {
    const response = await fetchWithTimeout('/api/submission/ocr', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('OCR 처리 중 오류가 발생했습니다');
    }

    return await response.json();
}

export async function submitGrading(submissionId: string, editedText?: string): Promise<GradingResult> {
    const response = await fetchWithTimeout(`/api/submission/grade/${submissionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: editedText ? JSON.stringify({ edited_text: editedText }) : undefined,
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('채점 중 오류가 발생했습니다');
    }

    return await response.json();
}

export async function fetchGradingHistory(
    studentId?: string,
    problemKey?: string,
    limit = 10,
    offset = 0
): Promise<ApiResponse<GradingListResponse>> {
    const params = new URLSearchParams({
        ...(studentId && { student_id: studentId }),
        ...(problemKey && { problem_key: problemKey }),
        limit: limit.toString(),
        offset: offset.toString()
    });

    return fetchClientApi<GradingListResponse>(`/gradings?${params.toString()}`);
} 