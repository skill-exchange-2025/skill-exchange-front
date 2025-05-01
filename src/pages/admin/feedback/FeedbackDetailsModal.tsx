import {useRouter} from 'next/router';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useGetSingleFeedbackQuery, useUpdateFeedbackStatusMutation} from '@/redux/features/feedback/feedbackApi';
import {toast} from "sonner";
import {Badge} from '@/components/ui/badge';
import {format} from 'date-fns';

export function FeedbackDetails() {
    const router = useRouter();
    const { id } = router.query;

    const {
        data: feedback,
        isLoading
    } = useGetSingleFeedbackQuery(id as string, {
        skip: !id
    });

    const [updateStatus] = useUpdateFeedbackStatusMutation();

    const handleStatusUpdate = async (status: "pending" | "in_progress" | "resolved" | "rejected") => {
        try {
            await updateStatus({ id: id as string, status }).unwrap();
            toast({
                title: "Success",
                description: "Feedback status updated successfully",
            });
        } catch (error) {
            toast({
                description: "Failed to update feedback status",
                title: "Error",
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (!feedback) return <div>Feedback not found</div>;

    // Format dates if available
    const formattedCreatedAt = feedback.createdAt ?
        format(new Date(feedback.createdAt), 'PPP') : 'N/A';
    const formattedUpdatedAt = feedback.updatedAt ?
        format(new Date(feedback.updatedAt), 'PPP') : 'N/A';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Feedback Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Title</h3>
                        <p>{feedback.title || "N/A"}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Description</h3>
                        <p>{feedback.description || "N/A"}</p>
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <h3 className="font-semibold">Type</h3>
                            <Badge variant={
                                feedback.type === "bug" ? "destructive" :
                                    feedback.type === "improvement" ? "outline" : "default"
                            }>
                                {feedback.type || "N/A"}
                            </Badge>
                        </div>
                        <div>
                            <h3 className="font-semibold">Priority</h3>
                            <Badge variant={
                                feedback.priority === "high" ? "destructive" :
                                    feedback.priority === "medium" ? "default" : "outline"
                            }>
                                {feedback.priority || "N/A"}
                            </Badge>
                        </div>
                        <div>
                            <h3 className="font-semibold">Status</h3>
                            <Badge variant={
                                feedback.status === "resolved" ? "default" :
                                    feedback.status === "rejected" ? "destructive" : "outline"
                            }>
                                {feedback.status || "pending"}
                            </Badge>
                        </div>
                    </div>
                    {feedback.attachments && feedback.attachments.length > 0 && (
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
                    <div>
                        <h3 className="font-semibold">User ID</h3>
                        <p>{feedback.userId || "N/A"}</p>
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <h3 className="font-semibold">Created</h3>
                            <p>{formattedCreatedAt}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Last Updated</h3>
                            <p>{formattedUpdatedAt}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleStatusUpdate('in_progress')}>
                            Mark In Progress
                        </Button>
                        <Button onClick={() => handleStatusUpdate('resolved')}
                                className="bg-green-600 hover:bg-green-700">
                            Mark as Resolved
                        </Button>
                        <Button onClick={() => handleStatusUpdate('rejected')}
                                variant="destructive">
                            Reject
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}