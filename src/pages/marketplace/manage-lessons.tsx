
import {useNavigate, useParams} from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetLessonsByListingQuery, useDeleteLessonMutation } from '@/redux/features/lessons/lessonApi';
import { Lesson } from '@/types/lessons';
import { toast } from 'sonner';
import { Pagination } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentPage, selectPagination } from '@/redux/features/lessons/lessonsSlice';
import {useEffect} from "react";

export function ManageLessons() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Replace "your-valid-listing-id" with the actual listing id or retrieve from URL params.
    const {itemId: listingId} = useParams();
    console.log("listingId", listingId);
    const { currentPage, itemsPerPage } = useSelector(selectPagination);

    const { data, isLoading, isError } = useGetLessonsByListingQuery({ listingId, page: currentPage, limit: itemsPerPage });

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

    const handleEdit = (lesson: Lesson) => {
        navigate(`/marketplace/manage-lessons/${lesson._id}`);
    };

    const handleCreate = () => {
        navigate(`/marketplace/create-lesson`);
    };

    const handlePageChange = (page: number) => {
        dispatch(setCurrentPage(page));
    };

    if (isLoading) return <div>Loading lessons...</div>;
    if (isError || !data) return <div>Error loading lessons.</div>;

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleCreate} className="mb-4">Create New Lesson</Button>

                    {/* List of Lessons */}
                    {data.data.length === 0 ? (
                        <p>No lessons available.</p>
                    ) : (
                        data.data.map((lesson: Lesson) => (
                            <div key={lesson._id} className="mb-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{lesson.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{lesson.description}</p>
                                        <Button onClick={() => handleEdit(lesson)}>Edit</Button>
                                        <Button
                                            onClick={() => handleDelete(lesson._id)}
                                            className="ml-2"
                                            disabled={isDeleting}
                                        >
                                            Delete
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    )}

                    {/* Pagination */}
                    <Pagination
                        total={data.meta.total}
                        current={currentPage}
                        pageSize={itemsPerPage}
                        onChange={handlePageChange}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

export default ManageLessons;