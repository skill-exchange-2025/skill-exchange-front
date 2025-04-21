import {useNavigate, useParams} from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetLessonsByListingQuery, useDeleteLessonMutation } from '@/redux/features/lessons/lessonApi';
import { Lesson } from '@/types/lessons';
import { toast } from 'sonner';
import { Pagination } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {setCurrentPage, selectPagination, setSelectedLesson} from '@/redux/features/lessons/lessonsSlice';
import { useEffect } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Lock,
    Check,
    BookOpen,
    GraduationCap,
    Plus,
    Trash2,
    Edit2,
    Eye
} from "lucide-react";
import { ListingType, useGetMarketplaceItemByIdQuery } from '@/redux/features/marketplace/marketplaceApi';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from 'next-themes';

export function ManageLessons() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useTheme();

    const { itemId } = useParams<{ itemId: string }>();
    const { currentPage, itemsPerPage } = useSelector(selectPagination);

    const { data: marketplaceItem, isLoading: isMarketplaceItemLoading } = useGetMarketplaceItemByIdQuery(itemId ?? '', {
        skip: !itemId
    });

    const { data, isLoading, isError } = useGetLessonsByListingQuery({
        listingId: itemId ?? '',
        page: currentPage,
        limit: itemsPerPage
    }, {
        skip: !itemId
    });

    useEffect(() => {
        if (isError) {
            toast.error('Error fetching lessons.');
        }
    }, [isError]);

    const [deleteLesson, { isLoading: isDeleting }] = useDeleteLessonMutation();

    if (!itemId) {
        return <div className="flex items-center justify-center h-[60vh] text-muted-foreground">Error: Missing listing ID</div>;
    }

    const handleDelete = async (lessonId: string) => {
        try {
            await deleteLesson(lessonId).unwrap();
            toast.success('Lesson deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete lesson.');
        }
    };

    const handleEdit = (lessonId: string) => {
        navigate(`/marketplace/item/${itemId}/lessons/${lessonId}/edit`);
    };

    const handleCreate = () => {
        navigate(`/marketplace/item/${itemId}/create-lesson`);
    };

    const handlePageChange = (page: number) => {
        dispatch(setCurrentPage(page));
    };

    const handleViewLesson = (lessonId: string) => {
        if (data && data.data) {
            const selectedLesson = data.data.find((lesson: Lesson) => lesson._id === lessonId);
            if (selectedLesson) {
                dispatch(setSelectedLesson(selectedLesson));
            }
        }
        navigate(`/marketplace/item/${itemId}/lessons/${lessonId}`);
    };

    const isLessonLocked = (lessonId: string) => {
        return parseInt(lessonId.substring(lessonId.length - 1), 16) % 2 === 0;
    };

    if (isLoading || isMarketplaceItemLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError || !data || !marketplaceItem) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                <p>Error loading content.</p>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-6">
            <Card className="shadow-md border-0 dark:bg-background">
                <CardHeader className="border-b border-border bg-card">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">{marketplaceItem.title}</CardTitle>
                            <p className="text-muted-foreground">{marketplaceItem.description}</p>
                        </div>
                        <Badge variant="outline" className={marketplaceItem.type === ListingType.ONLINE_COURSE ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}>
                            {marketplaceItem.type === ListingType.ONLINE_COURSE ? (
                                <div className="flex items-center gap-1">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>Interactive Course</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Static Course</span>
                                </div>
                            )}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">



                    {/* Create Lesson Button */}
                    <div className="flex justify-end">
                        <Button onClick={handleCreate} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create New Lesson
                        </Button>
                    </div>

                    {/* Lessons List */}
                    <ScrollArea className="h-[600px] pr-4">
                        {!data.data || data.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                                <p>No lessons available.</p>
                                <p className="text-sm">Create your first lesson to get started.</p>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="w-full">
                                {data.data.map((lesson: Lesson, index: number) => (
                                    <AccordionItem
                                        key={lesson._id}
                                        value={`item-${index}`}
                                        className="border border-border rounded-lg mb-3 overflow-hidden bg-card"
                                    >
                                        <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 [&[data-state=open]]:bg-muted/50">
                                            <div className="flex items-center w-full gap-3">
                                                <div className="flex items-center justify-center bg-primary/10 text-primary w-8 h-8 rounded-md text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <span className="font-medium flex-grow text-left">{lesson.title}</span>
                                                {isLessonLocked(lesson._id) ? (
                                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <Check className="h-5 w-5 text-emerald-500" />
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="p-4 space-y-4">
                                                <p className="text-muted-foreground">{lesson.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewLesson(lesson._id);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View Lesson
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(lesson._id);
                                                        }}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(lesson._id);
                                                        }}
                                                        disabled={isDeleting}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </ScrollArea>

                    {/* Pagination */}
                    {data.meta && data.meta.total > itemsPerPage && (
                        <div className="flex justify-center pt-4">
                            <Pagination
                                total={data.meta.total}
                                current={currentPage}
                                pageSize={itemsPerPage}
                                onChange={handlePageChange}
                                className={theme === 'dark' ? 'ant-pagination-dark' : ''}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default ManageLessons;