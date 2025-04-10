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
import { Lock, Check, ChevronRight } from "lucide-react";

export function ManageLessons() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get the listing ID from URL params
    const { itemId } = useParams();
    console.log("listingId", itemId);
    const { currentPage, itemsPerPage } = useSelector(selectPagination);

    const { data, isLoading, isError } = useGetLessonsByListingQuery({ listingId: itemId, page: currentPage, limit: itemsPerPage });

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
        // Navigate to the correct edit route: marketplace/lessons/:lessonId/edit
        navigate(`/marketplace/lessons/${lessonId}/edit`);
    };

    const handleCreate = () => {
        // Navigate to create lesson with the correct itemId
        navigate(`/marketplace/item/${itemId}/create-lesson`);
    };

    const handlePageChange = (page: number) => {
        dispatch(setCurrentPage(page));
    };

    // Navigate to lesson content using the correct route pattern
    const handleViewLesson = (lessonId: string) => {
        // Navigate to the correct lesson detail route: marketplace/item/:itemId/lessons/:lessonId
        navigate(`/marketplace/item/${itemId}/lessons/${lessonId}`);
    };

    // Mock function for determining if a lesson is locked/unread
    // Replace this with your actual logic to determine lesson status
    const isLessonLocked = (lessonId: string) => {
        // This is just placeholder logic - replace with your actual implementation
        return parseInt(lessonId.substring(lessonId.length - 1), 16) % 2 === 0;
    };

    if (isLoading) return <div>Loading lessons...</div>;
    if (isError || !data) return <div>Error loading lessons.</div>;

    return (
        <div className="container py-8">
            <Card className="shadow-md">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-2xl font-bold">Manage Lessons</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
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