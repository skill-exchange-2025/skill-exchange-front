import {useGetAllFeedbacksQuery} from '@/redux/features/feedback/feedbackApi';
import {TableWrapper} from "@/components/ui/TableWrapper";
import {columns} from './columns';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

export function FeedbackManagement() {
    const { data, isLoading, error } = useGetAllFeedbacksQuery();

    // Optional: Transform data to match column accessor keys (e.g., if keys are snake_case)
    const feedbacks = data?.map(feedback => ({
        ...feedback,
        subject: feedback.subject || "N/A",
        message: feedback.message || "N/A",
    })) || [];

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Feedback Management</CardTitle>
                </CardHeader>
                <CardContent>Loading...</CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Feedback Management</CardTitle>
                </CardHeader>
                <CardContent>Error loading feedbacks.</CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Feedback Management</CardTitle>
            </CardHeader>
            <CardContent>
                <TableWrapper
                    columns={columns}
                    data={feedbacks}
                    searchKey="userName"
                />
            </CardContent>
        </Card>
    );
}
