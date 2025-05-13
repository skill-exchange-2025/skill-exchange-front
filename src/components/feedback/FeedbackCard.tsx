import React from 'react';
import {IFeedback} from '@/types/feedback.types';

interface Props {
    feedback: IFeedback;
    onEdit?: () => void;
}

export const FeedbackCard: React.FC<Props> = ({ feedback, onEdit }) => {
    return (
        <div className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{feedback.title}</h3>
                <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(feedback.priority)}`}>
                        {feedback.priority}
                    </span>
                </div>
            </div>
            <p className="mt-2 text-gray-600">{feedback.description}</p>
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="mt-4 text-primary hover:underline"
                >
                    Edit
                </button>
            )}
        </div>
    );
};

const getStatusColor = (status: IFeedback['status']) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };
    return colors[status];
};

const getPriorityColor = (priority: IFeedback['priority']) => {
    const colors = {
        low: 'bg-gray-100 text-gray-800',
        medium: 'bg-orange-100 text-orange-800',
        high: 'bg-red-100 text-red-800',
    };
    return colors[priority];
};