'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
    const router = useRouter();

    const handleLoginSuccess = async () => {
        try {
            // 쿠키가 설정될 시간을 주기 위해 약간의 지연
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 세션이 있는지 확인
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            
            if (response.ok) {
                router.push('/students/dashboard');
                router.refresh();
            } else {
                console.error('Session not set properly');
            }
        } catch (error) {
            console.error('Error during login redirect:', error);
        }
    };

    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
} 