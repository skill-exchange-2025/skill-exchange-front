// src/pages/marketplace/edit-lesson.tsx
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {toast} from 'sonner';
import {useGetLessonByIdQuery, useUpdateLessonMutation} from '@/redux/features/lessons/lessonApi';

export function EditLesson() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();

    const { data: lessonData, isLoading: isLoadingLesson, error } = useGetLessonByIdQuery(lessonId as string);
    const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 0,
        TextContent: '',
        materials: '',
        videoUrl: ''
    });

    useEffect(() => {
        if (lessonData) {
            setFormData({
                title: lessonData.title,
                description: lessonData.description,
                duration: lessonData.duration,
                content: lessonData.TextContent,
                materials: lessonData.materials?.join(', ') || '',
                videoUrl: lessonData.videoUrl || ''
            });
        }
    }, [lessonData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'duration' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lessonId) {
            toast.error('No lesson ID provided.');
            return;
        }

        const payload = {
            title: formData.title,
            description: formData.description,
            duration: Number(formData.duration),
            content: formData.content,
            materials: formData.materials
                ? formData.materials.split(',').map((s) => s.trim())
                : [],
            videoUrl: formData.videoUrl
        };

        try {
            const result = await updateLesson({ id: lessonId, data: payload }).unwrap();
            toast.success('Lesson updated successfully!');
            navigate(`/marketplace/item/${result.listing}`);
        } catch (error: any) {
            console.error('Failed to update lesson:', error);
            toast.error(error?.data?.message || 'Failed to update lesson');
        }
    };

    if (isLoadingLesson) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-red-500">Error loading lesson. Please try again.</p>
                        <Button onClick={() => navigate(-1)} className="mt-4">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Lesson</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block font-medium">Title</label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter lesson title"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Description</label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter lesson description"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Duration (minutes)</label>
                            <Input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="e.g., 60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Content (Markdown/HTML)</label>
                            <Textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Enter lesson content"
                                required
                                rows={6}
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Materials (comma-separated URLs)</label>
                            <Input
                                name="materials"
                                value={formData.materials}
                                onChange={handleChange}
                                placeholder="https://example.com/doc1.pdf, https://example.com/doc2.pdf"
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Video URL</label>
                            <Input
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/lesson-video.mp4"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <Button type="submit" disabled={isUpdating} className="flex-1">
                                {isUpdating ? 'Updating...' : 'Update Lesson'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}

export default EditLesson;