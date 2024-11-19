"use client";

import { useState } from 'react';
import { loginStudent } from '@/app/utils/auth';

interface LoginFormProps {
    onLoginSuccess: () => void;
}

interface LoginState {
    error?: string;
    isLoading: boolean;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
    const [state, setState] = useState<LoginState>({
        error: undefined,
        isLoading: false
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setState({ isLoading: true, error: undefined });

        const formData = new FormData(event.currentTarget);
        const nickname = formData.get('nickname') as string;

        try {
            const response = await loginStudent(nickname);
            console.log('Login response:', response);
            
            if (response.status === 'success') {
                setState({ isLoading: false, error: undefined });
                await onLoginSuccess();
            } else {
                throw new Error('로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setState({
                isLoading: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        MAICE 수학 피드백 시스템
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        닉네임을 입력하고 시작하세요
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="nickname" className="sr-only">
                            닉네임
                        </label>
                        <input
                            id="nickname"
                            name="nickname"
                            type="text"
                            required
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            placeholder="닉네임을 입력하세요"
                            minLength={2}
                            maxLength={20}
                            disabled={state.isLoading}
                        />
                    </div>

                    {state.error && (
                        <div className="text-red-500 text-sm text-center">
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={state.isLoading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {state.isLoading ? '로그인 중...' : '시작하기'}
                    </button>
                </form>
            </div>
        </div>
    );
} 