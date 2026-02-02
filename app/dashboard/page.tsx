'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type ViewMode = 'upload' | 'library';

export default function DashboardPage() {
    const [view, setView] = useState<ViewMode>('upload');

    // Drag/File States
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    // Form States
    const [name, setName] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const [games, setGames] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (view === 'library') {
            fetchGames();
        }
    }, [view]);

    const fetchGames = async () => {
        setIsFetching(true);
        try {
            const res = await fetch('/api/games');
            if (res.ok) {
                const data = await res.json();
                setGames(data.games || []);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load games');
        } finally {
            setIsFetching(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setThumbnailFile(e.target.files[0]);
        }
    };

    const handleEdit = (game: any) => {
        setEditingId(game.id);
        setName(game.name);
        setGradeLevel(game.grade_level);
        setSubject(game.subject);
        setDescription(game.description || '');
        setSelectedFile(null);
        setThumbnailFile(null);
        toast.success(`Editing "${game.name}"`);
        setView('upload');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this game?')) return;

        try {
            const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setGames(prev => prev.filter(g => g.id !== id));
                toast.success('Game deleted successfully');
            } else {
                toast.error('Failed to delete game');
            }
        } catch (e) {
            toast.error('Error deleting game');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setGradeLevel('');
        setSubject('');
        setDescription('');
        setSelectedFile(null);
        setThumbnailFile(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('gradeLevel', gradeLevel);
        formData.append('subject', subject);
        formData.append('description', description);

        if (selectedFile) formData.append('file', selectedFile);
        if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

        try {
            const url = editingId ? `/api/games/${editingId}` : '/api/games';
            const method = editingId ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            toast.success(editingId ? 'Game updated!' : 'Game published!');
            resetForm();
            setEditingId(null);

            if (!editingId) {
                // If new upload, maybe clear form and stay? Or go to library?
                // Let's stay on upload page as per earlier behavior but maybe offer a link?
                // Actually user usually wants to see it. Let's switch to library to see the new game.
                setView('library');
            } else {
                setView('library');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">

            <div className="flex justify-center">
                <div className="inline-flex items-center p-1 rounded-full bg-zinc-100 border border-zinc-200">
                    <button
                        onClick={() => setView('upload')}
                        className={`px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 ${view === 'upload'
                            ? 'bg-black text-white shadow-md'
                            : 'text-zinc-500 hover:text-black'
                            }`}
                    >
                        {editingId ? 'Edit Game' : 'Upload Game'}
                    </button>
                    <button
                        onClick={() => setView('library')}
                        className={`px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 ${view === 'library'
                            ? 'bg-black text-white shadow-md'
                            : 'text-zinc-500 hover:text-black'
                            }`}
                    >
                        Library
                    </button>
                </div>
            </div>

            <div className="w-full">

                {view === 'upload' && (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-light text-black tracking-tight mb-2">
                                {editingId ? 'Update Game Details' : 'Upload New Game'}
                            </h2>
                            <p className="text-sm text-zinc-500">
                                {editingId ? 'Modify the contents of this game.' : ''}
                            </p>
                        </div>


                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className="block w-full text-lg border-b border-zinc-200 bg-transparent py-2 text-black placeholder-zinc-300 focus:border-black focus:outline-none transition-colors duration-300"
                                    placeholder="Game title"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-1">Subject</label>
                                    <select
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        required
                                        className="block w-full text-lg border-b border-zinc-200 bg-transparent py-2 text-black focus:border-black focus:outline-none transition-colors duration-300 cursor-pointer"
                                    >
                                        <option value="" disabled>Select</option>
                                        <option value="Math">Math</option>
                                        <option value="Science">Science</option>
                                        <option value="English">English</option>
                                        <option value="History">History</option>
                                        <option value="Geography">Geography</option>
                                        <option value="Coding">Coding</option>
                                        <option value="Logic">Logic</option>
                                    </select>
                                </div>
                                <div className="group space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-1">Grade</label>
                                    <select
                                        value={gradeLevel}
                                        onChange={e => setGradeLevel(e.target.value)}
                                        required
                                        className="block w-full text-lg border-b border-zinc-200 bg-transparent py-2 text-black focus:border-black focus:outline-none transition-colors duration-300 cursor-pointer"
                                    >
                                        <option value="" disabled>Select</option>
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="group space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    className="block w-full text-lg border-b border-zinc-200 bg-transparent py-2 text-black placeholder-zinc-300 focus:border-black focus:outline-none transition-colors duration-300 resize-none"
                                    placeholder="Optional description"
                                />
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="group">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-1 mb-2 block">Thumbnail</label>
                                    <div className="relative">
                                        <input type="file" accept="image/*" onChange={handleThumbnailChange} className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer" />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-1 mb-2 block">Game HTML Source {editingId && <span className="text-zinc-400 font-normal normal-case">(Optional update)</span>}</label>
                                    <div
                                        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center cursor-pointer ${dragActive || selectedFile ? 'border-black bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'}`}
                                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    >
                                        <input type="file" name="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".html,.htm" onChange={handleChange} required={!editingId} />
                                        <div className="pointer-events-none flex flex-col items-center gap-2">
                                            {selectedFile ? (
                                                <>
                                                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-black truncate max-w-[200px]">{selectedFile.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                    </div>
                                                    <p className="text-sm text-zinc-500">Drag & drop HTML file here</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                {editingId && (
                                    <button type="button" onClick={handleCancelEdit} className="w-full py-4 text-sm font-medium text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-full transition-colors">
                                        Cancel Edit
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading || (!selectedFile && !editingId)}
                                    className="w-full py-4 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center flex gap-2 shadow-xl shadow-zinc-200"
                                >
                                    {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {editingId ? 'Update Game' : 'Publish Game'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {view === 'library' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-light text-black tracking-tight">Game Library</h2>
                            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">{games.length} Items</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {isFetching ? (
                                <div className="text-center py-20">
                                    <span className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin inline-block mb-2"></span>
                                    <p className="text-zinc-400 text-sm">Loading library...</p>
                                </div>
                            ) : games.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                                    <p className="text-zinc-500 font-medium">No games found.</p>
                                    <p className="text-zinc-400 text-sm mt-1">Upload your first game to get started.</p>
                                </div>
                            ) : (
                                games.map((game) => (
                                    <div key={game.id} className="group relative bg-white border border-zinc-100 rounded-2xl p-4 hover:shadow-xl hover:shadow-zinc-200/50 hover:border-zinc-200 transition-all duration-300 flex gap-6 items-center">
                                        <div className="w-24 h-24 flex-shrink-0 bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center relative">
                                            {game.thumbnail_url ? (
                                                <img src={game.thumbnail_url} alt={game.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl text-zinc-300 font-bold">{game.name.charAt(0)}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-medium text-black truncate tracking-tight">{game.name}</h3>
                                                    <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{game.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                                                    <button onClick={() => handleEdit(game)} className="p-2.5 rounded-full bg-zinc-50 text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(game.id)} className="p-2.5 rounded-full bg-zinc-50 text-zinc-400 hover:text-red-600 hover:bg-zinc-100 transition-all" title="Delete">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-600 uppercase tracking-wide">
                                                    {game.subject}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-600 uppercase tracking-wide">
                                                    Grade {game.grade_level}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-medium ml-auto">
                                                    {new Date(game.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
