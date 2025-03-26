
// src/components/lessons/LessonViewer.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import React from "react";

interface LessonViewerProps {
    lesson: {
        title: string;
        content: string;
    };
    onClose: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, onClose }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{lesson.title}</h2>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Close
                </Button>
            </div>
            <div className="prose max-w-none">
                {lesson.content}
            </div>
        </div>
    );
};
