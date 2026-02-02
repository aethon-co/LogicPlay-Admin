'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        router.push('/dashboard');
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-white px-6">
            <div className="w-full max-w-[380px] animate-slide-up">
                <div className="mb-10">
                    <h1 className="text-4xl font-light tracking-tight text-black mb-3">Login</h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide">WELCOME BACK</p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="group relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="peer w-full border-b border-zinc-200 bg-transparent py-3 text-black placeholder-transparent focus:border-black focus:outline-none transition-colors duration-300"
                                placeholder="Email"
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-0 top-3 text-zinc-400 text-sm transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black"
                            >
                                Email address
                            </label>
                        </div>
                        <div className="group relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="peer w-full border-b border-zinc-200 bg-transparent py-3 text-black placeholder-transparent focus:border-black focus:outline-none transition-colors duration-300"
                                placeholder="Password"
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-0 top-3 text-zinc-400 text-sm transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black"
                            >
                                Password
                            </label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white h-12 rounded-lg font-medium tracking-wide transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
