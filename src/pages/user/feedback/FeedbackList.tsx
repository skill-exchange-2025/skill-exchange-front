import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useGetUserFeedbacksQuery} from '@/redux/features/feedback/feedbackApi';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Skeleton} from '@/components/ui/skeleton';
import {Edit, Plus} from 'lucide-react'; // Import icons if you're using lucide-react

// Create a loading skeleton
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
    const { data, isLoading, error } = useGetUserFeedbacksQuery({
        page,
        limit: 10
    });
    const navigate = useNavigate();

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

    const feedbacks = data?.data || data || [];

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
                    {feedbacks.map((feedback: { _id: React.Key | null | undefined; title: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; description: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; type: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; priority: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; status: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
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
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/user/feedback/edit/${feedback._id}`)}
                                >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};