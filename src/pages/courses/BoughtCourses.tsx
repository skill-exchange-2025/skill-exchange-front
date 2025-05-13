import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from 'date-fns';
import { useGetTransactionsQuery } from "@/redux/features/marketplace/marketplaceApi";
import { useGetLessonsByListingQuery } from "@/redux/features/lessons/lessonApi";
import { BookOpen, Clock, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


const BoughtCourses = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);

    const limit = 20;

    const { data: response, isLoading } = useGetTransactionsQuery(
        { page, limit, status },
        { refetchOnMountOrArgChange: true }
    );

    const { data: lessonsData, isLoading: isLoadingLessons } = useGetLessonsByListingQuery(
        {
            listingId: selectedCourse?.listing?._id || '',
            page: 1,
            limit: 50
        },
        {
            skip: !selectedCourse?.listing?._id
        }
    );

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        setPage(1);
    };

    const handlePreviewCourse = (transaction: any) => {
        setSelectedCourse(transaction);
        setIsPreviewOpen(true);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const transactions = response?.data || [];

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Purchased Courses</h1>
                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transactions.map((transaction: any) => (
                    <Card
                        key={transaction._id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handlePreviewCourse(transaction)}
                    >
                        <CardHeader>
                            <CardTitle>{transaction.listing.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Instructor: {transaction.seller.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Purchased: {formatDate(transaction.createdAt)}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Status:</span>
                                    <span className={`text-sm ${
                                        transaction.status === 'completed' ? 'text-green-600' :
                                            transaction.status === 'pending' ? 'text-yellow-600' :
                                                'text-red-600'
                                    }`}>
                                        {transaction.status}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{selectedCourse?.listing.title}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Course Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold">Course Details</h3>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedCourse?.listing.category} - {selectedCourse?.listing.skillName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>Started {formatDate(selectedCourse?.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>Instructor: {selectedCourse?.seller.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold">Course Progress</h3>
                                <div className="p-4 rounded-lg bg-secondary/50">
                                    <div className="text-2xl font-bold mb-1">
                                        {selectedCourse?.status === 'completed' ? '100%' : 'In Progress'}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedCourse?.status === 'completed'
                                            ? 'Course completed'
                                            : 'Continue your learning journey'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Course Content */}
                        <div className="space-y-4">
                            {/* Lessons Section */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Course Lessons</h3>

                                {isLoadingLessons ? (
                                    // Loading state for lessons
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="p-4 rounded-lg border">
                                                <Skeleton className="h-6 w-3/4 mb-2" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        ))}
                                    </div>
                                ) : lessonsData?.data && lessonsData.data.length > 0 ? (
                                    // Render lessons
                                    <div className="space-y-3">
                                        {lessonsData.data.map((lesson: any) => (
                                            <div
                                                key={lesson._id}
                                                className="p-4 rounded-lg bg-card border hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">{lesson.title}</h4>
                                                        {lesson.description && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {lesson.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {lesson.duration} minutes
                                                    </span>
                                                            {lesson.type && (
                                                                <span className="flex items-center gap-1">
                                                            <BookOpen className="h-4 w-4" />
                                                                    {lesson.type}
                                                        </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Navigate to lesson view
                                                            window.location.href = `/courses/lesson/${lesson._id}`;
                                                        }}
                                                    >
                                                        View Lesson
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No lessons available for this course yet.
                                    </p>
                                )}
                            </div>
                            {/* Course Materials */}
                            {selectedCourse?.listing.materials && selectedCourse.listing.materials.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Course Materials</h3>
                                    <div className="grid gap-2">
                                        {selectedCourse.listing.materials.map((material: string, index: number) => (
                                            <a
                                                key={index}
                                                href={material}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline flex items-center gap-2"
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                Material {index + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BoughtCourses;