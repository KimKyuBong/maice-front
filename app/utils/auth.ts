'use client';

async function fetchAuthApi<T>(endpoint: string, options: RequestInit = {}) {
    const url = `/api${endpoint}`;
    
    try {
        const res = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: options.body instanceof FormData 
                ? undefined 
                : {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers,
                }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.error || `Auth API error: ${res.status} ${res.statusText}`);
        }

        return res.json();
    } catch (error) {
        console.error('Auth API error:', error);
        throw error;
    }
}

export interface AuthResponse {
    status: string;
    student_id: string;
    nickname: string;
}

export async function loginStudent(nickname: string) {
    const formData = new FormData();
    formData.append('nickname', nickname);

    const response = await fetchAuthApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: formData,
    });
    
    console.log('Login response:', response);
    return response;
}

export async function getCurrentUser() {
    return await fetchAuthApi('/auth/me');
}

export async function logoutStudent() {
    return await fetchAuthApi('/auth/logout', {
        method: 'POST',
    });
} 