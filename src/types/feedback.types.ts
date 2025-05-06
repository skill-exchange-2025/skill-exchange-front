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

export interface IFeedbackReply {
    _id: string;
    userId: string; // Admin ID who replied
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface IFeedback extends ICreateFeedback {
    _id: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
    replies: IFeedbackReply[];
    adminComments?: string; // Internal admin comments
    createdAt: string;
    updatedAt: string;
}