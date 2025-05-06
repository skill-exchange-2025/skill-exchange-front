// FeedbackManagement.tsx
import { useGetAllFeedbacksQuery } from '@/redux/features/feedback/feedbackApi';
import { TableWrapper } from "@/components/ui/TableWrapper";
import { columns } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IFeedback } from "@/types/feedback.types.ts";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import {Button} from "@/components/ui/button.tsx";

export function FeedbackManagement() {
    const { data, isLoading, error } = useGetAllFeedbacksQuery();
    const feedbacks = (data as unknown as IFeedback[]) || [];


    // Enhanced loading state
    if (isLoading) {
        return (
            <Card className="rounded-lg border bg-card shadow-sm">
                <CardHeader className="border-b p-4">
                    <CardTitle className="text-lg font-semibold">Feedback Management</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full rounded-md" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    // Enhanced error state
    if (error) {
        return (
            <Alert variant="destructive" className="w-[95%] mx-auto mt-4">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Loading Error</AlertTitle>
                <AlertDescription>
                    Failed to load feedbacks. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card className="rounded-lg border bg-card shadow-sm">
            <CardHeader className="border-b p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Feedback Management</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            Export CSV
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <TableWrapper<IFeedback>
                    columns={columns}
                    data={feedbacks}
                    searchKey="title"
                    className="rounded-md border"
                />
            </CardContent>
        </Card>
    );
}