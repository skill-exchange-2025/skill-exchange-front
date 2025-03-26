
// src/components/lessons/LessonEditor.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface LessonEditorProps {
    lesson: {
        _id: string;
        title: string;
        description: string;
        content: string;
    };
    onCancel: () => void;
    onUpdated: () => void;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({ lesson, onUpdated }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // API call will be implemented later
            toast.success('Lesson updated successfully');
            navigate(-1);
        } catch (error) {
            toast.error('Failed to update lesson');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                placeholder="Lesson Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
            />
            <Textarea
                placeholder="Short Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
            />
            <Textarea
                placeholder="Lesson Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                className="min-h-[200px]"
            />
            <div className="flex gap-2">
                <Button type="submit">Update Lesson</Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};