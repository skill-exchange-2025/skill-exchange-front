import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Calendar, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGetLessonByIdQuery } from '@/redux/features/lessons/lessonApi';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { useTheme } from 'next-themes';

// Custom Markdown Preview component
const MarkdownPreview = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 text-foreground">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-medium mb-2 mt-4 text-foreground">{children}</h3>,
                p: ({ children }) => <p className="mb-4 text-muted-foreground leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground">{children}</ol>,
                li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">{children}</blockquote>
                ),
                code: ({ children }) => (
                    <code className="bg-muted rounded px-1.5 py-0.5 text-sm font-mono text-muted-foreground">{children}</code>
                ),
                pre: ({ children }) => (
                    <pre className="bg-muted text-muted-foreground rounded-lg p-4 overflow-x-auto my-4">{children}</pre>
                ),
                a: ({ children, href }) => (
                    <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                    </a>
                ),
                img: ({ src, alt }) => (
                    <img src={src} alt={alt} className="rounded-lg max-w-full h-auto my-4 border border-border" />
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
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
    const { theme } = useTheme();

    const { data: lesson, isLoading, isError } = useGetLessonByIdQuery(lessonId);

    useEffect(() => {
        if (isError) {
            toast.error('Error loading lesson content');
        }
    }, [isError]);

    const handleBackToLessons = () => {
        if (itemId) {
            navigate(`/marketplace/item/${itemId}/lessons`);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-8">
                <Card className="border-0">
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
                <Card className="border-0">
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
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{typedLesson.duration} minutes</span>
                        </div>
                    )}
                    {typedLesson.updatedAt && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Updated {format(new Date(typedLesson.updatedAt), 'PP')}</span>
                        </div>
                    )}
                    <Badge variant="outline" className={
                        typedLesson.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' :
                            typedLesson.status === 'draft' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-red-500/10 text-red-500'
                    }>
                        {typedLesson.status.charAt(0).toUpperCase() + typedLesson.status.slice(1)}
                    </Badge>
                </div>
            </div>

            <Card className="border-0">
                <CardHeader className="bg-card border-b border-border">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold">{typedLesson.title}</CardTitle>
                        {typedLesson.description && (
                            <CardDescription className="text-base">{typedLesson.description}</CardDescription>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Lesson Content</h3>
                        <Separator />

                        {typedLesson.textContent ? (
                            <ScrollArea className="h-[600px] w-full rounded-lg border bg-background p-4">
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

                        {/* Additional materials */}
                        {typedLesson.materials && typedLesson.materials.length > 0 && (
                            <div className="space-y-4">
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Additional Materials</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {typedLesson.materials.map((material: string, index: number) => (
                                            <Card key={index} className="bg-muted/50">
                                                <CardContent className="flex items-center justify-between p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-background rounded-md">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-medium truncate">
                                                                {material.split('/').pop() || 'Material'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Click to download
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-2"
                                                        asChild
                                                    >
                                                        <a
                                                            href={material}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default LessonDetail;