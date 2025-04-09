// src/pages/marketplace/ManageLessons.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetLessonsByListingQuery, useDeleteLessonMutation } from '@/redux/features/lessons/lessonApi';
import { Lesson } from '@/types/lessonsTypes.ts';
import { toast } from 'sonner';
import { Pagination } from 'antd';

export function ManageLessons() {
    const navigate = useNavigate();
    const [deleteLesson] = useDeleteLessonMutation();
    const listingId = "your-listing-id";  // Retrieve from URL params or props
    const { data, isLoading, isError } = useGetLessonsByListingQuery({ listingId, page: 1, limit: 10 });

    useEffect(() => {
        if (isError) {
            toast.error('Error fetching lessons.');
        }
    }, [isError]);

    const handleDelete = async (lessonId: string) => {
        try {
            await deleteLesson(lessonId).unwrap();
            toast.success('Lesson deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete lesson.');
        }
    };

    const handleEdit = (lesson: Lesson) => {
        navigate(`/marketplace/manage-lessons/${lesson._id}`);
    };

    const handleCreate = () => {
        navigate(`/marketplace/create-lesson`);
    };

    if (isLoading) return <div>Loading lessons...</div>;
    if (isError || !data) return <div>Error loading lessons.</div>;

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleCreate} className="mb-4">Create New Lesson</Button>

                    {/* List of Lessons */}
                    {data?.lessons.length === 0 ? (
                        <p>No lessons available.</p>
                    ) : (
                        data.lessons.map((lesson) => (
                            <div key={lesson._id} className="mb-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{lesson.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{lesson.description}</p>
                                        <Button onClick={() => handleEdit(lesson)}>Edit</Button>
                                        <Button onClick={() => handleDelete(lesson._id)} className="ml-2" variant="danger">Delete</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    )}

                    {/* Pagination */}
                    <Pagination
                        total={data?.meta.total || 0}
                        pageSize={10}
                        onChange={(page) => console.log('Page changed:', page)} // Add your pagination logic here
                    />
                </CardContent>
            </Card>
        </div>
    );
}

export default ManageLessons;
