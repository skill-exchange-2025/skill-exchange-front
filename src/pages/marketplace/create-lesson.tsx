import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useCreateLessonMutation } from '@/redux/features/lessons/lessonApi';

export function CreateLesson() {
    // Extract listingId from URL params.
    const { id: listingId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [createLesson, { isLoading }] = useCreateLessonMutation();

    // Our form state reflects our backend CreateLessonDto structure.
    const [lessonData, setLessonData] = useState({
        title: '',
        description: '',
        duration: 0,
        content: '',
        materials: '', // entered as comma separated list
        videoUrl: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLessonData((prev) => ({
            ...prev,
            [name]: name === 'duration' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!listingId) {
            toast.error('No listing ID provided.');
            return;
        }
        // Prepare payload: convert duration to number and parse materials into an array.
        const payload = {
            title: lessonData.title,
            description: lessonData.description,
            duration: Number(lessonData.duration),
            content: lessonData.content,
            materials: lessonData.materials
                ? lessonData.materials.split(',').map((s) => s.trim())
                : [],
            videoUrl: lessonData.videoUrl
        };

        try {
            await createLesson({ listingId, data: payload }).unwrap();
            toast.success('Lesson created successfully!');
            navigate(`/marketplace/item/${listingId}`);
        } catch (error: any) {
            console.error('Failed to create lesson:', error);
            toast.error(error?.data?.message || 'Failed to create lesson');
        }
    };

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create Lesson</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block font-medium">Title</label>
                            <Input
                                name="title"
                                value={lessonData.title}
                                onChange={handleChange}
                                placeholder="Enter lesson title"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Description</label>
                            <Textarea
                                name="description"
                                value={lessonData.description}
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
                                value={lessonData.duration}
                                onChange={handleChange}
                                placeholder="e.g., 60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Content (Markdown/HTML)</label>
                            <Textarea
                                name="content"
                                value={lessonData.content}
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
                                value={lessonData.materials}
                                onChange={handleChange}
                                placeholder="https://example.com/doc1.pdf, https://example.com/doc2.pdf"
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Video URL</label>
                            <Input
                                name="videoUrl"
                                value={lessonData.videoUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/lesson-video.mp4"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Creating...' : 'Create Lesson'}
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}

export default CreateLesson;