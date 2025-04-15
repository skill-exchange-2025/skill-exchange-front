import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGetLessonByIdQuery } from '@/redux/features/lessons/lessonApi';
import ReactMarkdown from 'react-markdown';

interface Lesson {
    _id: string;
    title: string;
    description?: string;
    content?: string;
    materials?: string[];
    duration?: number;
}

export function LessonDetail() {
    const { itemId, lessonId } = useParams<{ itemId: string; lessonId: string }>();
    const navigate = useNavigate();

    // Fetch the lesson data
    const { data: lesson, isLoading, isError } = useGetLessonByIdQuery(lessonId);

    useEffect(() => {
        if (isError) {
            toast.error('Error loading lesson content');
        }
    }, [isError]);

    // Handle navigation back to lessons list
    const handleBackToLessons = () => {
        if (itemId) {
            navigate(`/marketplace/item/${itemId}/lessons`);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center h-40">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="text-gray-500">Loading lesson content...</p>
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
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center h-40">
                            <div className="flex flex-col items-center gap-2 text-red-500">
                                <FileText className="h-8 w-8" />
                                <p>Error loading lesson content.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const typedLesson = lesson as Lesson;

    return (
        <div className="container py-8 max-w-4xl mx-auto">
            <Button
                variant="outline"
                className="mb-6 hover:bg-gray-50"
                onClick={handleBackToLessons}
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Lessons
            </Button>

            <Card className="shadow-sm">
                <CardHeader className="bg-gray-50/50 border-b">
                    <CardTitle className="text-2xl font-bold text-gray-900">{typedLesson.title}</CardTitle>
                    {typedLesson.description && (
                        <p className="text-gray-600 mt-2">{typedLesson.description}</p>
                    )}
                </CardHeader>

                <CardContent className="p-6">
                    {/* Main content */}
                    <div className="mb-8">
                        {typedLesson.content ? (
                            <div className="prose prose-slate max-w-none">
                                {typedLesson.content.startsWith('data:application/pdf') ? (
                                    <iframe
                                        src={typedLesson.content}
                                        className="w-full h-[600px] border rounded-lg"
                                        title="PDF Content"
                                    />
                                ) : (
                                    <ReactMarkdown>{typedLesson.content}</ReactMarkdown>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No content available for this lesson.</p>
                            </div>
                        )}
                    </div>

                    {/* Additional materials */}
                    {typedLesson.materials && typedLesson.materials.length > 0 && (
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Additional Materials</h3>
                            <div className="space-y-2">
                                {typedLesson.materials.map((material: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        <a
                                            href={material}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {material.split('/').pop() || 'Download Material'}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default LessonDetail;