// feedback.types.ts
export interface IFeedback {
    _id: string;
    title: string;
    description: string;
    type: 'bug' | 'improvement' | 'feature';
    priority: 'low' | 'medium' | 'high';
    attachments: string[];
    status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateFeedback {
    title: string;
    description: string;
    type: 'bug' | 'improvement' | 'feature';
    priority: 'low' | 'medium' | 'high';
    attachments: string[];
}