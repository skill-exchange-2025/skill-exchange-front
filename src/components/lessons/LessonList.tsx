import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LessonCreator } from './LessonCreator';
import { useGetMarketplaceItemByIdQuery, useUpdateMarketplaceItemMutation } from '@/redux/features/marketplace/marketplaceApi';
import React, { useEffect } from "react";
import { useCreateLessonMutation, useDeleteLessonMutation } from '@/redux/features/lessons/lessonsApi.ts';
import { toast } from 'react-hot-toast'; // Assuming you use toast for notifications

interface Lesson {
    _id: string;
    title: string;
    description: string;
    content: string;
}

interface LessonListProps {
    listingId: string;
    isOwner: boolean;
}

export const LessonList: React.FC<LessonListProps> = ({ listingId, isOwner }) => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const finalCourseId = courseId || listingId; // Use param or prop

    // Fetch course data including lessons with refetch capability
    const {
        data: courseData,
        isLoading,
        refetch,
        error
    } = useGetMarketplaceItemByIdQuery(finalCourseId);

    // Mutations for lesson management
    const [createLesson] = useCreateLessonMutation();
    const [deleteLesson] = useDeleteLessonMutation();

    // Get lessons from courseData or default to empty array
    const lessons = courseData?.lessons || [];

    // Handle error state
    useEffect(() => {
        if (error) {
            toast.error("Failed to load course lessons. Please try again.");
            console.error("Course fetch error:", error);
        }
    }, [error]);

    const handleViewLesson = (lessonId: string) => {
        navigate(`/marketplace/courses/${finalCourseId}/lessons/${lessonId}`);
    };

    const handleEditLesson = (lessonId: string) => {
        navigate(`/marketplace/courses/${finalCourseId}/lessons/${lessonId}/edit`);
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (window.confirm("Are you sure you want to delete this lesson?")) {
            try {
                await deleteLesson(lessonId).unwrap();
                refetch(); // Refetch course data to update lessons list
                toast.success("Lesson deleted successfully");
            } catch (err) {
                toast.error("Failed to delete lesson");
                console.error(err);
            }
        }
    };

    const handleLessonCreated = async (newLesson) => {
        try {
            await createLesson({
                listingId: finalCourseId,
                ...newLesson
            }).unwrap();
            refetch(); // Refetch course data to include new lesson
            toast.success("Lesson created successfully");
        } catch (err) {
            toast.error("Failed to create lesson");
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="text-muted-foreground">Loading lessons...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {isOwner && (
                <LessonCreator
                    listingId={finalCourseId}
                    onCreated={handleLessonCreated}
                />
            )}

            {lessons.length === 0 ? (
                <div className="text-center text-muted-foreground p-4 border rounded-lg">
                    No lessons available yet
                </div>
            ) : (
                <div className="grid gap-4">
                    {lessons.map((lesson: Lesson) => (
                        <div
                            key={lesson._id}
                            className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">{lesson.title}</h3>
                                <div className="flex gap-2">
                                    {isOwner && (
                                        <>
                                            <Button
                                                key={`edit-${lesson._id}`}
                                                variant="outline"
                                                onClick={() => handleEditLesson(lesson._id)}
                                                className="hover:bg-secondary"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                key={`delete-${lesson._id}`}
                                                variant="destructive"
                                                onClick={() => handleDeleteLesson(lesson._id)}
                                                className="hover:bg-destructive/90"
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        key={`view-${lesson._id}`}
                                        onClick={() => handleViewLesson(lesson._id)}
                                        className="hover:bg-primary/90"
                                    >
                                        View
                                    </Button>
                                </div>
                            </div>
                            <p className="text-muted-foreground mt-2 line-clamp-2">
                                {lesson.description}
                            </p>
                        </div>
                    ))}
                </div>
             )}
        </div>
    );
};