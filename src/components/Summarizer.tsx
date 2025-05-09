import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Toast} from '@/components/ui/toast';
import {useNavigate, useParams} from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/summarize';

const Summarizer: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [summary, setSummary] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [modelReady, setModelReady] = useState<boolean>(false);
    const navigate = useNavigate();
    const { itemId } = useParams<{ itemId?: string }>();

    useEffect(() => {
        const checkModelStatus = async () => {
            try {
                const response = await axios.post(API_URL, { text: 'Hello' });

                if (response.data.status === 'loading') {
                    setTimeout(checkModelStatus, 2000);
                } else {
                    setModelReady(true);
                }
            } catch (err) {
                console.warn('Model status check failed, retrying...');
                setTimeout(checkModelStatus, 5000);
            }
        };

        checkModelStatus();
    }, []);

    const handleBackToLessons = () => {
        if (itemId) {
            navigate(`/marketplace/item/${itemId}/lessons`);
        } else {
            navigate('/marketplace');
        }
    };

    const summarizeText = async (text: string): Promise<void> => {
        if (!text.trim()) {
            Toast({
                title: 'Missing Text',
                variant: 'destructive'
            });
            return;
        }

        try {
            setLoading(true);
            setSummary('');

            const response = await axios.post<{ summary: string; status?: string }>(API_URL, { text });

            if (response.data.status === 'loading') {
                Toast({
                    title: 'Model Loading',
                    variant: 'default'
                });
                return;
            }

            if (response.data?.summary) {
                setSummary(response.data.summary);
                Toast({
                    title: 'Summary Generated',
                    variant: 'default'
                });
            } else {
                console.error('Unexpected response:', response.data);
                Toast({
                    title: 'Invalid Response',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            Toast({
                title: 'Error Summarizing',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        await summarizeText(text);
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-4xl mx-auto">
            <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">Text Summarizer</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Powered by T5-small model: Enter your text below to generate a concise summary.
                        </p>
                    </div>
                    <button
                        onClick={handleBackToLessons}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
                    >
                        ← Back to Lessons
                    </button>
                </div>
            </div>
            <div className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="text-input" className="text-sm font-medium leading-none">
                            Text to Summarize
                        </label>
                        <textarea
                            id="text-input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste your article, document, or long text here..."
                            rows={10}
                            className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
                        disabled={loading || !text.trim()}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Summarizing...
                            </>
                        ) : (
                            'Summarize'
                        )}
                    </button>

                    {!modelReady && !loading && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                            Note: The model is initializing on the server. This may take a minute.
                        </p>
                    )}
                </form>

                {summary && (
                    <div className="mt-6 border rounded-md p-4 bg-muted/50">
                        <h4 className="font-medium mb-2">Summary</h4>
                        <div className="text-sm mb-4">{summary}</div>
                        <div className="flex gap-2">
                            <button
                                className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                                onClick={() => {
                                    navigator.clipboard.writeText(summary);
                                    Toast({
                                        title: 'Copied!',
                                        variant: 'default'
                                    });
                                }}
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={handleBackToLessons}
                                className="inline-flex h-8 items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow transition-colors hover:bg-secondary/80"
                            >
                                Back to Lessons
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Summarizer;