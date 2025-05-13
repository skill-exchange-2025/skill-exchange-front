import {useNavigate, useParams} from 'react-router-dom';
import {useEffect, useRef, useState} from 'react';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
    Bookmark,
    BookmarkCheck,
    Calendar,
    Check,
    ChevronLeft,
    Clock,
    Download,
    FileText,
    Pause,
    Share2,
    ThumbsUp,
    Volume2,
    VolumeX
} from 'lucide-react';
import {toast} from 'sonner';
import {useGetLessonByIdQuery} from '@/redux/features/lessons/lessonApi';
import type {Components} from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import {format} from 'date-fns';
import {Progress} from "@/components/ui/progress";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import AISlider from '@/components/AISlider';

// Custom Markdown Preview component
const MarkdownPreview = ({ content }: { content: string }) => {
    const components: Components = {
        h1: ({ children, ...props }) => (
            <h1 {...props} className="text-3xl font-bold mb-4 text-foreground">
                {children}
            </h1>
        ),
        h2: ({ children, ...props }) => (
            <h2 {...props} className="text-2xl font-semibold mb-3 mt-6 text-foreground">
                {children}
            </h2>
        ),
        h3: ({ children, ...props }) => (
            <h3 {...props} className="text-xl font-medium mb-2 mt-4 text-foreground">
                {children}
            </h3>
        ),
        p: ({ children, ...props }) => (
            <p {...props} className="mb-4 text-muted-foreground leading-relaxed">
                {children}
            </p>
        ),
        ul: ({ children, ...props }) => (
            <ul {...props} className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">
                {children}
            </ul>
        ),
        ol: ({ children, ...props }) => (
            <ol {...props} className="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground">
                {children}
            </ol>
        ),
        li: ({ children, ...props }) => (
            <li {...props} className="text-muted-foreground">
                {children}
            </li>
        ),
        blockquote: ({ children, ...props }) => (
            <blockquote {...props} className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                {children}
            </blockquote>
        ),
        code: ({ children, ...props }) => (
            <code {...props} className="bg-muted rounded px-1.5 py-0.5 text-sm font-mono text-muted-foreground">
                {children}
            </code>
        ),
        pre: ({ children, ...props }) => (
            <pre {...props} className="bg-muted text-muted-foreground rounded-lg p-4 overflow-x-auto my-4">
                {children}
            </pre>
        ),
        a: ({ children, href, ...props }) => (
            <a
                {...props}
                href={href}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        ),
        img: ({ src, alt, ...props }) => (
            <img
                {...props}
                src={src}
                alt={alt}
                className="rounded-lg max-w-full h-auto my-4 border border-border"
            />
        ),
    };

    return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
};

export interface Instructor {
    _id: string;
    name: string;
    email: string;
}

export interface Lesson {
    _id: string;
    instructor?: Instructor;
    title: string;
    description: string;
    duration: number;
    textContent: string;
    order: number;
    status: 'draft' | 'published' | 'archived';
    videoUrl?: string;
    materials: string[];
    imageUrls: string[];
    isPreview: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export function LessonDetail() {
    const { itemId, lessonId } = useParams<{ itemId: string; lessonId: string }>();
    const navigate = useNavigate();
    const [isCompleted, setIsCompleted] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [activeTab, setActiveTab] = useState("content");
    const [readingProgress, setReadingProgress] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speechRate, setSpeechRate] = useState(1.0);
    const speechSynthesis = useRef<SpeechSynthesisUtterance | null>(null);

    const { data: lesson, isLoading, isError } = useGetLessonByIdQuery(lessonId ?? '');

    // Check if lesson is completed from localStorage
    useEffect(() => {
        if (lessonId) {
            const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '{}');
            setIsCompleted(!!completedLessons[lessonId]);

            const bookmarkedLessons = JSON.parse(localStorage.getItem('bookmarkedLessons') || '{}');
            setIsBookmarked(!!bookmarkedLessons[lessonId]);

            // Simulate reading progress based on stored value or default to 0
            const storedProgress = parseInt(localStorage.getItem(`lessonProgress_${lessonId}`) || '0');
            setReadingProgress(storedProgress);

            // Auto-increment progress as user reads
            const intervalId = setInterval(() => {
                if (!isCompleted && readingProgress < 100) {
                    const newProgress = Math.min(readingProgress + 1, 100);
                    setReadingProgress(newProgress);
                    localStorage.setItem(`lessonProgress_${lessonId}`, newProgress.toString());
                }
            }, 10000); // Update every 10 seconds

            return () => clearInterval(intervalId);
        }
    }, [lessonId, isCompleted, readingProgress]);

    const handleMarkAsComplete = () => {
        if (!lessonId) return;

        const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '{}');

        if (isCompleted) {
            // Uncomplete the lesson
            delete completedLessons[lessonId];
            toast.success('Lesson marked as incomplete');
        } else {
            // Complete the lesson
            completedLessons[lessonId] = true;
            setReadingProgress(100);
            localStorage.setItem(`lessonProgress_${lessonId}`, '100');
            toast.success('Lesson completed! Great job!');
        }

        localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
        setIsCompleted(!isCompleted);
    };

    const handleToggleBookmark = () => {
        if (!lessonId) return;

        const bookmarkedLessons = JSON.parse(localStorage.getItem('bookmarkedLessons') || '{}');

        if (isBookmarked) {
            delete bookmarkedLessons[lessonId];
            toast.success('Bookmark removed');
        } else {
            bookmarkedLessons[lessonId] = true;
            toast.success('Lesson bookmarked');
        }

        localStorage.setItem('bookmarkedLessons', JSON.stringify(bookmarkedLessons));
        setIsBookmarked(!isBookmarked);
    };

    const handleBackToLessons = () => {
        if (itemId) {
            navigate(`/marketplace/item/${itemId}/lessons`);
        } else {
            navigate('/marketplace');
        }
    };
    const handlesumurizeLessons = () => {
        if (itemId) {
            navigate(`/summarize/:lessonId`);
        } else {
            navigate('/summarize');
        }
    };

    const generatePDF = () => {
        toast.success("Generating PDF. Download will start shortly.");
        // Here you would implement actual PDF generation logic
        // For now, we'll just simulate with a timeout
        setTimeout(() => {
            toast.success("PDF ready to download!");
        }, 1500);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: typedLesson?.title || 'Lesson',
                text: typedLesson?.description || 'Check out this lesson',
                url: window.location.href,
            })
                .then(() => toast.success('Lesson shared successfully'))
                .catch(() => toast.error('Error sharing lesson'));
        } else {
            // Fallback for browsers that don't support the Web Share API
            navigator.clipboard.writeText(window.location.href)
                .then(() => toast.success('Link copied to clipboard'))
                .catch(() => toast.error('Failed to copy link'));
        }
    };

    const handleTextToSpeech = () => {
        if (!typedLesson?.textContent) return;

        if (isSpeaking) {
            if (isPaused) {
                window.speechSynthesis.resume();
                setIsPaused(false);
            } else {
                window.speechSynthesis.pause();
                setIsPaused(true);
            }
            return;
        }

        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(typedLesson.textContent);
        speechSynthesis.current = utterance;

        // Configure speech settings
        utterance.rate = speechRate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Event handlers
        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            speechSynthesis.current = null;
        };

        utterance.onpause = () => {
            setIsPaused(true);
        };

        utterance.onresume = () => {
            setIsPaused(false);
        };

        // Start speaking
        window.speechSynthesis.speak(utterance);
    };

    const handleSpeechRateChange = (value: number) => {
        setSpeechRate(value / 100);
        if (isSpeaking && speechSynthesis.current) {
            speechSynthesis.current.rate = value / 100;
        }
    };



    // Cleanup speech synthesis on component unmount
    useEffect(() => {
        return () => {
            if (speechSynthesis.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    if (isLoading) {
        return (
            <div className="container py-8">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center h-[400px]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="text-muted-foreground">Loading lesson content...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError || !lesson) {
        return (
            <div className="container py-8">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center h-[400px]">
                            <div className="flex flex-col items-center gap-3 text-destructive">
                                <FileText className="h-8 w-8" />
                                <p>Error loading lesson content</p>
                                <Button variant="outline" onClick={handleBackToLessons}>
                                    Return to Lessons
                                </Button>

                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const typedLesson = lesson as Lesson;

    const getBadgeVariant = (status: Lesson['status']) => {
        switch (status) {
            case 'published':
                return 'bg-emerald-500/10 text-emerald-500';
            case 'draft':
                return 'bg-amber-500/10 text-amber-500';
            default:
                return 'bg-red-500/10 text-red-500';
        }
    };

    return (
        <div className="container py-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="gap-2 hover:bg-background"
                    onClick={handleBackToLessons}
                >
                    <ChevronLeft className="h-4 w-4" /> Back to Lessons
                </Button>

                <div className="flex items-center gap-4">

                    {typedLesson.duration && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{typedLesson.duration} minutes</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Estimated reading time</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {typedLesson.updatedAt && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Updated {format(new Date(typedLesson.updatedAt), 'PP')}</span>
                        </div>
                    )}
                    <Badge className={getBadgeVariant(typedLesson.status)}>
                        {typedLesson.status.charAt(0).toUpperCase() + typedLesson.status.slice(1)}
                    </Badge>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="bg-card border-b border-border relative">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
                        <Progress value={readingProgress} className="h-full" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold">{typedLesson.title}</CardTitle>
                                {typedLesson.description && (
                                    <CardDescription className="text-base">{typedLesson.description}</CardDescription>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleTextToSpeech}
                                                className="text-muted-foreground hover:text-primary"
                                            >
                                                {isSpeaking ? (
                                                    isPaused ? (
                                                        <VolumeX className="h-5 w-5" />
                                                    ) : (
                                                        <Pause className="h-5 w-5" />
                                                    )
                                                ) : (
                                                    <Volume2 className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{isSpeaking ? (isPaused ? "Resume speech" : "Pause speech") : "Listen to lesson"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {isSpeaking && (
                                    <div className="w-48">
                                        <AISlider
                                            min={50}
                                            max={200}
                                            defaultValue={100}
                                            onChange={handleSpeechRateChange}
                                            tooltip="Adjust speech rate"
                                        />
                                    </div>
                                )}
                                <Button
                                    variant="secondary"
                                    className="gap-2 hover:bg-background"
                                    onClick={handlesumurizeLessons}
                                >
                                    <ChevronLeft className="h-4 w-4" /> sumurize your lesson
                                </Button>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleToggleBookmark}
                                                className="text-muted-foreground hover:text-primary"
                                            >
                                                {isBookmarked ? (
                                                    <BookmarkCheck className="h-5 w-5 text-primary" />
                                                ) : (
                                                    <Bookmark className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{isBookmarked ? "Remove bookmark" : "Bookmark lesson"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleShare}
                                                className="text-muted-foreground hover:text-primary"
                                            >
                                                <Share2 className="h-5 w-5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Share this lesson</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        {typedLesson.instructor && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                                    {typedLesson.instructor.name.charAt(0)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Instructor: <span className="font-medium text-foreground">{typedLesson.instructor.name}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6 pt-1 bg-card">
                        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
                            <TabsTrigger value="content">Lesson Content</TabsTrigger>
                            <TabsTrigger value="materials">
                                Materials
                                {typedLesson.materials && typedLesson.materials.length > 0 && (
                                    <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
                                        {typedLesson.materials.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <CardContent className="p-0">
                        <TabsContent value="content" className="p-6 mt-0">
                            <div className="space-y-6">
                                {typedLesson.textContent ? (
                                    <ScrollArea className="h-[600px] w-full rounded-lg border bg-background p-4 pr-8">
                                        <div className="prose dark:prose-invert max-w-none">
                                            <MarkdownPreview content={typedLesson.textContent} />
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[300px] bg-muted/50 rounded-lg">
                                        <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground">No content available for this lesson.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="materials" className="p-6 mt-0">
                            {typedLesson.materials && typedLesson.materials.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        {typedLesson.materials.map((material: string, index: number) => {
                                            const fileName = material.split('/').pop() || 'Material';
                                            const fileExtension = fileName.split('.').pop()?.toLowerCase();
                                            const isPdf = fileExtension === 'pdf';

                                            return (
                                                <Card key={index} className="bg-background border border-border hover:border-primary/40 transition-colors group">
                                                    <CardContent className="flex items-center justify-between p-4">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className="p-2 bg-primary/10 rounded-md">
                                                                {isPdf ? (
                                                                    <FileText className="h-6 w-6 text-primary" />
                                                                ) : (
                                                                    <FileText className="h-6 w-6 text-primary" />
                                                                )}
                                                            </div>
                                                            <div className="space-y-1 flex-1 min-w-0">
                                                                <p className="font-medium truncate">
                                                                    {fileName}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {isPdf ? "PDF Document" : "Learning Resource"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-2 group-hover:border-primary/40 group-hover:text-primary transition-colors"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={material}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    download={fileName}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                    <span className="hidden sm:inline">Download</span>
                                                                </a>
                                                            </Button>

                                                            {isPdf && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="gap-2 hidden sm:flex"
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={material}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        <span>Preview</span>
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-6">
                                        <Card className="bg-primary/5 border-dashed border-primary/20">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-full">
                                                        <FileText className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">Download Lesson as PDF</h4>
                                                        <p className="text-sm text-muted-foreground">Get this entire lesson in PDF format for offline reading</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="gap-2 border-primary/40 hover:bg-primary/10"
                                                    onClick={generatePDF}
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span>Export to PDF</span>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[300px] bg-muted/50 rounded-lg">
                                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground">No additional materials available for this lesson.</p>
                                </div>
                            )}
                        </TabsContent>
                    </CardContent>
                </Tabs>

                <CardFooter className="p-6 border-t border-border flex items-center justify-between bg-background">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={isCompleted ? "secondary" : "default"}
                            className="gap-2"
                            onClick={handleMarkAsComplete}
                        >
                            {isCompleted ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    <span>Completed</span>
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    <span>Mark as Complete</span>
                                </>
                            )}
                        </Button>

                        {isCompleted && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                {readingProgress}% Complete
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <ThumbsUp className="h-5 w-5" />
                        </Button>

                        {(typedLesson.order > 1 || typedLesson.order < 999) && (
                            <div className="flex items-center gap-2">
                                {typedLesson.order > 1 && (
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <ChevronLeft className="h-4 w-4" /> Previous
                                    </Button>
                                )}

                                {typedLesson.order < 999 && (
                                    <Button variant="outline" size="sm" className="gap-1">
                                        Next <ChevronLeft className="h-4 w-4 rotate-180" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

export default LessonDetail;