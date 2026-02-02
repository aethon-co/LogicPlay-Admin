'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const email = (e.target as any).email.value;
        const password = (e.target as any).password.value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push('/dashboard');
            } else {
                const data = await res.json();
                alert(data.error || 'Login failed'); 
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#fafafa] px-6">
            <div className="w-full max-w-[400px] animate-slide-up bg-white p-10 rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100">
                <div className="mb-10 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                        <span className="text-white font-bold text-2xl">L</span>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-black mb-2">LogicPlay Admin</h1>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
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
                                className="absolute left-0 top-3 text-zinc-400 text-sm transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black font-medium"
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
                                className="absolute left-0 top-3 text-zinc-400 text-sm transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black font-medium"
                            >
                                Password
                            </label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white h-12 rounded-full font-medium tracking-wide transition-all duration-300 hover:bg-zinc-800 hover:shadow-lg hover:shadow-black/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
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
