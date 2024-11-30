import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MAICE",
    description: "수학 문제 풀이 피드백 시스템",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <head>
                <script type="text/javascript">
                    {`
                        window.MathJax = {
                            tex: {
                                inlineMath: [['$', '$']],
                                displayMath: [['$$', '$$']],
                                processEscapes: true,
                                packages: ['base', 'ams', 'noerrors', 'noundefined']
                            },
                            svg: {
                                fontCache: 'global'
                            },
                            options: {
                                enableMenu: false,
                                processHtmlClass: 'tex2jax_process'
                            },
                            startup: {
                                ready: () => {
                                    MathJax.startup.defaultReady();
                                }
                            }
                        };
                    `}
                </script>
                <script 
                    type="text/javascript" 
                    id="MathJax-script" 
                    src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"
                >
                </script>
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
