import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useDispatch } from 'react-redux';
import { useGetLessonByIdQuery } from '@/redux/features/lessons/lessonApi';
import { setError } from '@/redux/features/lessons/lessonsSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorCard from '@/components/ui/ErrorCard';
import { useEffect } from 'react';

export function LessonDetail() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Guard clause for missing lessonId
    if (!lessonId) {
        return <div>Error: Lesson ID is missing!</div>;
    }

    // Fetch lesson data using the lessonId
    const { data: lesson, isLoading, error } = useGetLessonByIdQuery(lessonId);

    // Handle error state outside of render
    useEffect(() => {
        if (error) {
            dispatch(setError('Error loading lesson. Please try again.'));
        }
    }, [error, dispatch]);

    // Loading spinner while fetching data
    if (isLoading) return <LoadingSpinner />;

    // Error handling if lesson or data is missing
    if (error || !lesson) {
        return <ErrorCard message="Error loading lesson. Please try again." onRetry={() => navigate(-1)} />;
    }

    return (
        <div className="container py-8">
            <Card>
                <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold">{lesson.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" onClick={() => navigate(-1)}>
                                Back
                            </Button>
                            <Button variant="outline" onClick={() => navigate(`/marketplace/lessons/${lessonId}/edit`)}>
                                Edit
                            </Button>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Duration: {lesson.duration} minutes</div>
                </CardHeader>
                <CardContent className="py-6">
                    <LessonContent lesson={lesson} />
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => navigate(`/marketplace/item/${lesson.listing}`)}>
                        Back to Course
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default LessonDetail;
