'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '../components/LoginForm';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string>('');

    const handleLoginSuccess = async (studentId: string, password: string) => {
        try {
            // 로그인 요청
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    student_id: studentId,
                    password: password,
                }),
                credentials: 'include'
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json();
                throw new Error(errorData.detail || '로그인에 실패했습니다');
            }

            // 세션 확인
            const sessionResponse = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            
            if (sessionResponse.ok) {
                router.push('/students/dashboard');
                router.refresh();
            } else {
                throw new Error('세션이 올바르게 설정되지 않았습니다');
            }
        } catch (error) {
            console.error('로그인 중 오류 발생:', error);
            setError(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">학생 로그인</h1>
                <p className="text-sm text-gray-600 mb-4 text-center">
                    최초 로그인 시 계정이 자동으로 생성됩니다
                </p>
                <LoginForm onLoginSuccess={handleLoginSuccess} error={error} />
            </div>
        </div>
    );
} 