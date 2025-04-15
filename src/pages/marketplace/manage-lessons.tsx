import {useNavigate, useParams} from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetLessonsByListingQuery, useDeleteLessonMutation } from '@/redux/features/lessons/lessonApi';
import { Lesson } from '@/types/lessons';
import { toast } from 'sonner';
import { Pagination } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentPage, selectPagination } from '@/redux/features/lessons/lessonsSlice';
import { useEffect } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Lock, Check, ChevronRight, BookOpen, GraduationCap, Calendar, Users, Clock, MapPin } from "lucide-react";
import { ListingType, useGetMarketplaceItemByIdQuery } from '@/redux/features/marketplace/marketplaceApi';
import { format } from 'date-fns';

export function ManageLessons() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get the listing ID from URL params
    const { itemId } = useParams();
    const { currentPage, itemsPerPage } = useSelector(selectPagination);

    // Fetch the marketplace item details to determine the course type
    const { data: marketplaceItem, isLoading: isMarketplaceItemLoading } = useGetMarketplaceItemByIdQuery(itemId || '', {
        skip: !itemId
    });

    const { data, isLoading, isError } = useGetLessonsByListingQuery({
        listingId: itemId,
        page: currentPage,
        limit: itemsPerPage
    });

    useEffect(() => {
        if (isError) {
            toast.error('Error fetching lessons.');
        }
    }, [isError]);

    const [deleteLesson, { isLoading: isDeleting }] = useDeleteLessonMutation();

    const handleDelete = async (lessonId: string) => {
        try {
            await deleteLesson(lessonId).unwrap();
            toast.success('Lesson deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete lesson.');
        }
    };

    const handleEdit = (lessonId: string) => {
        navigate(`/marketplace/lessons/${lessonId}/edit`);
    };

    const handleCreate = () => {
        navigate(`/marketplace/item/${itemId}/create-lesson`);
    };

    const handlePageChange = (page: number) => {
        dispatch(setCurrentPage(page));
    };

    const handleViewLesson = (lessonId: string) => {
        navigate(`/marketplace/item/${itemId}/lessons/${lessonId}`);
    };

    const isLessonLocked = (lessonId: string) => {
        return parseInt(lessonId.substring(lessonId.length - 1), 16) % 2 === 0;
    };

    if (isLoading || isMarketplaceItemLoading) return <div>Loading...</div>;
    if (isError || !data || !marketplaceItem) return <div>Error loading content.</div>;

    const isStaticCourse = marketplaceItem.type === ListingType.COURSE;
    const isOnlineCourse = marketplaceItem.type === ListingType.ONLINE_COURSE;

    return (
        <div className="container py-8">
            <Card className="shadow-md">
                <CardHeader className="bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">{marketplaceItem.title}</CardTitle>
                            <p className="text-gray-600 mt-1">{marketplaceItem.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isStaticCourse ? (
                                <div className="flex items-center gap-1 text-amber-600">
                                    <BookOpen className="h-5 w-5" />
                                    <span>Static Course</span>
                                </div>
                            ) : isOnlineCourse ? (
                                <div className="flex items-center gap-1 text-green-600">
                                    <GraduationCap className="h-5 w-5" />
                                    <span>Interactive Course</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Course Details Section */}
                    {isOnlineCourse && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">Course Schedule</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {marketplaceItem.startDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Start Date</p>
                                            <p className="font-medium">{format(new Date(marketplaceItem.startDate), 'PPP')}</p>
                                        </div>
                                    </div>
                                )}
                                {marketplaceItem.endDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">End Date</p>
                                            <p className="font-medium">{format(new Date(marketplaceItem.endDate), 'PPP')}</p>
                                        </div>
                                    </div>
                                )}
                                {marketplaceItem.maxStudents && (
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Max Students</p>
                                            <p className="font-medium">{marketplaceItem.maxStudents}</p>
                                        </div>
                                    </div>
                                )}
                                {marketplaceItem.durationHours && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Duration</p>
                                            <p className="font-medium">{marketplaceItem.durationHours} hours</p>
                                        </div>
                                    </div>
                                )}
                                {marketplaceItem.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Location</p>
                                            <p className="font-medium">{marketplaceItem.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {isStaticCourse && marketplaceItem.contentDescription && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">Course Content</h3>
                            <p className="text-gray-700">{marketplaceItem.contentDescription}</p>
                            {marketplaceItem.contentUrls && marketplaceItem.contentUrls.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium mb-2">Content Materials</h4>
                                    <ul className="space-y-2">
                                        {marketplaceItem.contentUrls.map((url, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {url.split('/').pop()}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <Button onClick={handleCreate} className="mb-6">Create New Lesson</Button>

                    {/* List of Lessons as Accordion */}
                    {data.data.length === 0 ? (
                        <p className="text-center text-gray-500">No lessons available.</p>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {data.data.map((lesson: Lesson, index: number) => (
                                <AccordionItem key={lesson._id} value={`item-${index}`} className="border-b border-gray-200">
                                    <AccordionTrigger className="hover:bg-gray-50 rounded-t-md px-4 py-3 text-left">
                                        <div className="flex items-center w-full gap-3 text-gray-800">
                                            <div className="flex items-center justify-center bg-primary text-white w-8 h-8 rounded-full text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <span className="font-medium flex-grow">{lesson.title}</span>
                                            {isLessonLocked(lesson._id) ? (
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <Check className="h-5 w-5 text-green-500" />
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="bg-gray-50 p-4 rounded-b-md mb-2">
                                            <p className="text-gray-700 mb-4">{lesson.description}</p>

                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="default"
                                                    className="flex items-center gap-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewLesson(lesson._id);
                                                    }}
                                                >
                                                    View Lesson <ChevronRight className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(lesson._id);
                                                    }}
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(lesson._id);
                                                    }}
                                                    disabled={isDeleting}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}

                    {/* Pagination */}
                    {data.meta.total > itemsPerPage && (
                        <div className="mt-6 flex justify-center">
                            <Pagination
                                total={data.meta.total}
                                current={currentPage}
                                pageSize={itemsPerPage}
                                onChange={handlePageChange}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default ManageLessons;