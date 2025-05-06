import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetSingleFeedbackQuery, useUpdateFeedbackStatusMutation } from '@/redux/features/feedback/feedbackApi';
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function FeedbackDetails() {
    const router = useRouter();
    const { id } = router.query;

    const { data: feedback, isLoading } = useGetSingleFeedbackQuery(id as string, {
        skip: !id
    });

    const [updateStatus] = useUpdateFeedbackStatusMutation();

    const handleStatusUpdate = async (status: "pending" | "in_progress" | "resolved" | "rejected") => {
        try {
            await updateStatus({
                id: id as string,
                status
            }).unwrap();
            toast.success("Feedback status updated successfully");
        } catch (error) {
            toast.error("Failed to update feedback status");
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (!feedback) return <div>Feedback not found</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Feedback Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold">Title</h3>
                    <p>{feedback.title}</p>
                </div>

                <div>
                    <h3 className="font-semibold">Description</h3>
                    <p>{feedback.description}</p>
                </div>

                <div className="flex gap-4 flex-wrap">
                    <div>
                        <h3 className="font-semibold">Type</h3>
                        <Badge variant={
                            feedback.type === "bug" ? "destructive" :
                                feedback.type === "improvement" ? "outline" : "default"
                        }>
                            {feedback.type}
                        </Badge>
                    </div>

                    <div>
                        <h3 className="font-semibold">Priority</h3>
                        <Badge variant={
                            feedback.priority === "high" ? "destructive" :
                                feedback.priority === "medium" ? "default" : "outline"
                        }>
                            {feedback.priority}
                        </Badge>
                    </div>

                    <div>
                        <h3 className="font-semibold">Status</h3>
                        <Badge variant={
                            feedback.status === "resolved" ? "default" :
                                feedback.status === "rejected" ? "destructive" : "outline"
                        }>
                            {feedback.status}
                        </Badge>
                    </div>
                </div>

                {feedback.attachments?.length > 0 && (
                    <div>
                        <h3 className="font-semibold">Attachments</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {feedback.attachments.map((attachment, index) => (
                                <Badge key={index} variant="outline">
                                    <a href={attachment} target="_blank" rel="noopener noreferrer">
                                        Attachment {index + 1}
                                    </a>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-4 flex-wrap">
                    <div>
                        <h3 className="font-semibold">Created At</h3>
                        <p>{format(new Date(feedback.createdAt), 'PPpp')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Last Updated</h3>
                        <p>{format(new Date(feedback.updatedAt), 'PPpp')}</p>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap mt-4">
                    <Button
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={feedback.status === 'in_progress'}
                    >
                        Mark In Progress
                    </Button>
                    <Button
                        onClick={() => handleStatusUpdate('resolved')}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={feedback.status === 'resolved'}
                    >
                        Mark Resolved
                    </Button>
                    <Button
                        onClick={() => handleStatusUpdate('rejected')}
                        variant="destructive"
                        disabled={feedback.status === 'rejected'}
                    >
                        Reject
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}