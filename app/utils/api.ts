'use server'

import type { Student, Grading } from '../types/student';

interface ApiResponse<T> {
    data: T;
    error?: string;
}

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const url = `/api${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

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
            signal: controller.signal,
            headers,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return { data };
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('Request timed out');
            return { data: null as T, error: 'Request timed out' };
        }
        return {
            data: null as T,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// 서버 액션으로 변환된 API 함수들
export async function getAllStudents() {
    console.log('Fetching all students');
    const response = await fetchApi<Student[]>('/students');
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function getStudentById(id: string) {
    const response = await fetchApi<Student>(`/students/${id}`);
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function getStudentResults(id: string) {
    console.log(`Fetching results for student ${id}`);
    const response = await fetchApi<Record<string, Grading[]>>(`/students/${id}/results`);
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function getGradingById(id: number) {
    const response = await fetchApi<Grading>(`/gradings/${id}`);
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
}

// 자율 문항 관련 인터페이스 추가
export interface SubmissionResponse {
    success: boolean;
    message: string;
    data: {
        extracted_text: string;
        feedback: string;
        score: number;
        max_score: number;
    };
}

export interface SubmissionHistory {
    success: boolean;
    submissions: Array<{
        problem_key: string;
        submitted_at: string;
        score: number;
        max_score: number;
        feedback: string;
        extracted_text: string;
    }>;
}

// 자율 문항 제출 및 이력 조회 함수 추가
export async function submitSolution(formData: FormData) {
    const response = await fetchApi<SubmissionResponse>('/evaluation/submit', {
        method: 'POST',
        body: formData,
        headers: {
            // FormData를 사용하므로 Content-Type은 자동으로 설정됨
        },
    });
    
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function getStudentSubmissionHistory(studentId: string) {
    const response = await fetchApi<SubmissionHistory>(`/evaluation/${studentId}/history`);
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function getLatestSubmissions(studentId: string) {
    const response = await fetchApi<{
        success: boolean;
        latest_submissions: Array<{
            problem_key: string;
            submitted_at: string;
            score: number;
            max_score: number;
            feedback: string;
            extracted_text: string;
        }>;
    }>(`/evaluation/${studentId}/latest`);
    
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
}

// 학생 인증 관련 함수 추가
export interface AuthResponse {
    status: string;
    student_id: string;
    nickname: string;
}

export async function loginStudent(nickname: string) {
    const formData = new FormData();
    formData.append('nickname', nickname);

    const response = await fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
    
    console.log('Login response:', response);
    
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
}

export async function getCurrentUser() {
    const response = await fetchApi<{
        status: string;
        data: {
            student_id: string;
            nickname: string;
            created_at: string;
        };
    }>('/auth/me');
    
    if (response.error) {
        if (response.error.includes('세션이 만료')) {
            throw new Error('세션이 만료되었습니다');
        }
        throw new Error(response.error);
    }
    return response.data;
}

export async function logoutStudent() {
    const response = await fetchApi<{ status: string; message: string }>('/auth/logout', {
        method: 'POST',
    });
    
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
}