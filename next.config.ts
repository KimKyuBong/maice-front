import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config, { isServer }) => {
        // 기존 fs fallback 설정
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            };
        }

        // Konva를 위한 canvas 설정 추가
        config.externals = [...(config.externals || []), { canvas: "canvas" }];
        
        return config;
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.NODE_ENV === 'production'
                    ? 'http://127.0.0.1:8000/api/:path*'  // 프로덕션에서는 로컬 루프백 사용
                    : 'http://localhost:8000/api/:path*',  // 개발환경
                basePath: false
            }
        ];
    },
    experimental: {
        allowedRevalidateHeaderKeys: ['Cookie', 'Set-Cookie'],
    }
};

export default nextConfig;