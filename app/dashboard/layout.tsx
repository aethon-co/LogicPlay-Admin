'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-black font-sans selection:bg-black selection:text-white">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafafa]/80 backdrop-blur-md border-b border-zinc-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between h-16 sm:h-20 items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">L</span>
                            </div>
                            <span className="text-lg font-semibold tracking-tight">LogicPlay</span>
                        </div>

                        <div className="hidden sm:flex items-center gap-6">
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors duration-300"
                            >
                                Log out
                            </button>
                        </div>

                        <div className="sm:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-zinc-500 hover:text-black focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="sm:hidden bg-white border-b border-zinc-100 animate-fade-in">
                        <div className="px-4 py-4 space-y-2">
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-3 py-2 text-sm font-medium text-zinc-500 hover:text-red-600 hover:bg-zinc-50 rounded-lg transition-colors"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                )}
            </nav>
            <main className="max-w-5xl mx-auto py-24 sm:py-32 px-4 sm:px-6 animate-fade-in">
                {children}
            </main>
        </div>
    );
}
