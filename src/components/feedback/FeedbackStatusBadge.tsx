import React from 'react';
import {Badge} from '@/components/ui/badge';

type FeedbackStatus = 'pending' | 'in-progress' | 'resolved' | 'closed';

interface FeedbackStatusBadgeProps {
    status: FeedbackStatus;
}

const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800'
};

export const FeedbackStatusBadge: React.FC<FeedbackStatusBadgeProps> = ({ status }) => {
    return (
        <Badge className={`${statusColors[status]} px-3 py-1 rounded-full`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
};