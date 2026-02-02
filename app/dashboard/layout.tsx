
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#fafafa] text-black font-sans selection:bg-black selection:text-white">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafafa]/80 backdrop-blur-md border-b border-zinc-100">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">L</span>
                            </div>
                            <span className="text-lg font-semibold tracking-tight">LogicBox</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <button className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors duration-300">
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-5xl mx-auto py-32 px-6 animate-fade-in">
                {children}
            </main>
        </div>
    );
}
