import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackApi, useGetUserFeedbacksQuery } from '@/redux/features/feedback/feedbackApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store.ts';
import { selectFeedbackError, clearSelectedFeedback } from '@/redux/features/feedback/feedbackSlice';
import {IFeedback} from "@/types/feedback.types.ts";

// Move DeleteFeedbackButton outside the FeedbackList component
interface DeleteFeedbackButtonProps {
    feedbackId: string;
    onSuccess?: () => void;
}

const DeleteFeedbackButton = ({ feedbackId, onSuccess }: DeleteFeedbackButtonProps) => {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteFeedback, { isLoading }] = feedbackApi.useDeleteFeedbackMutation();
    const error = useSelector((state: RootState) => selectFeedbackError(state));
    const dispatch = useDispatch();

    const handleDelete = async () => {
        try {
            await deleteFeedback(feedbackId).unwrap();
            dispatch(clearSelectedFeedback());
            onSuccess?.();
        } catch (err) {
            console.error('Failed to delete feedback:', err);
        }
    };

    return (
        <div className="delete-feedback-container ml-2">
            {!confirmDelete ? (
                <button
                    onClick={() => setConfirmDelete(true)}
                    className="delete-button bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    disabled={isLoading}
                >
                    {isLoading ? 'Deleting...' : 'Delete'}
                </button>
            ) : (
                <div className="confirmation-dialog">
                    <p className="confirmation-text text-sm mr-2">Are you sure?</p>
                    <div className="button-group flex">
                        <button
                            onClick={handleDelete}
                            className="confirm-button bg-red-600 text-white px-3 py-1 rounded mr-1 hover:bg-red-700 text-sm"
                            disabled={isLoading}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="cancel-button bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
                        >
                            No
                        </button>
                    </div>
                    {error && <p className="error-message text-red-500 mt-2 text-sm">{error}</p>}
                </div>
            )}
        </div>
    );
};

// Loading skeleton component
const FeedbackSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3].map((i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-4 w-[250px]" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-[300px] mb-4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-[60px]" />
                        <Skeleton className="h-4 w-[60px]" />
                        <Skeleton className="h-4 w-[60px]" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

export const FeedbackList = () => {
    const [page] = React.useState(1);
    const { data, isLoading, error, refetch } = useGetUserFeedbacksQuery({
        page,
        limit: 10
    });
    const navigate = useNavigate();

    const handleDeleteSuccess = () => {
        refetch(); // Refresh the list after successful deletion
    };

    if (isLoading) {
        return <FeedbackSkeleton />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Error loading feedbacks. Please try again.
                    <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    const feedbacks = data?.data || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Feedbacks</h1>
                <Button onClick={() => navigate('/user/feedback/create')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Feedback
                </Button>
            </div>

            {!feedbacks.length ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <p className="text-muted-foreground">No feedbacks found</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => navigate('/user/feedback/create')}
                        >
                            Create your first feedback
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {feedbacks.map((feedback: IFeedback) => (
                        <Card key={feedback._id}>
                            <CardHeader>
                                <CardTitle>{feedback.title}</CardTitle>
                                <CardDescription>{feedback.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-primary/10">
                    {feedback.type}
                  </span>
                                    <span className="px-2 py-1 rounded-full text-xs bg-primary/10">
                    {feedback.priority}
                  </span>
                                    <span className="px-2 py-1 rounded-full text-xs bg-primary/10">
                    {feedback.status}
                  </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(`/user/feedback/edit/${feedback._id}`)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                    <DeleteFeedbackButton
                                        feedbackId={feedback._id}
                                        onSuccess={handleDeleteSuccess}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};