import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Import your API hook for fetching lesson details
// This should match your actual API structure
import { useGetLessonByIdQuery } from '@/redux/features/lessons/lessonApi';

export function LessonDetail() {
    const { itemId, lessonId } = useParams();
    const navigate = useNavigate();

    // Fetch the lesson data
    const { data: lesson, isLoading, isError } = useGetLessonByIdQuery(lessonId);

    // State to track completion status (you might want to store this in your backend)
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        if (isError) {
            toast.error('Error loading lesson content');
        }
    }, [isError]);

    // Handle navigation back to lessons list
    const handleBackToLessons = () => {
        navigate(`/marketplace/item/${itemId}/lessons`);
    };

    // Handle navigation to previous/next lesson
    // You would need to implement proper previous/next logic based on your data structure
    const handlePreviousLesson = () => {
        // This is a placeholder - implement your actual navigation logic
        toast.info('Navigating to previous lesson');
    };

    const handleNextLesson = () => {
        // This is a placeholder - implement your actual navigation logic
        toast.info('Navigating to next lesson');
    };

    // Mark lesson as completed
    const handleMarkAsCompleted = () => {
        setIsCompleted(true);
        toast.success('Lesson marked as completed!');
        // You would typically call an API here to update completion status
    };

    if (isLoading) return <div className="container py-8">Loading lesson content...</div>;
    if (isError || !lesson) return <div className="container py-8">Error loading lesson content.</div>;

    return (
        <div className="container py-8">
            <Button
                variant="outline"
                className="mb-4 flex items-center gap-2"
                onClick={handleBackToLessons}
            >
                <ArrowLeft className="h-4 w-4" /> Back to Lessons
            </Button>

            <Card className="shadow-md">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-2xl font-bold">{lesson.title}</CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Lesson content */}
                    <div className="prose max-w-none">
                        <p className="text-gray-700">{lesson.description}</p>

                        {/* Render lesson content - this would be where you render lesson.content */}
                        <div className="my-6 p-4 bg-white border rounded-md">
                            {/* Replace this with your actual lesson content rendering */}
                            <p>{lesson.content || "No content available for this lesson."}</p>
                        </div>
                    </div>

                    {/* Lesson navigation and actions */}
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handlePreviousLesson}
                                className="flex items-center gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleNextLesson}
                                className="flex items-center gap-1"
                            >
                                Next <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            onClick={handleMarkAsCompleted}
                            disabled={isCompleted}
                            variant={isCompleted ? "outline" : "default"}
                        >
                            {isCompleted ? "Completed" : "Mark as Completed"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default LessonDetail;