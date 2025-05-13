import {useNavigate, useParams} from 'react-router-dom';
import {useGetSingleFeedbackQuery, useUpdateFeedbackMutation} from '@/redux/features/feedback/feedbackApi';
import {FeedbackForm} from '@/components/feedback/FeedbackForm';
import {ICreateFeedback} from "@/types/feedback.types.ts";
import {Spin} from 'antd';

export const EditFeedback = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Call hooks unconditionally at the top level
    const [updateFeedback, { isLoading: isUpdating }] = useUpdateFeedbackMutation();

    // Use the skip parameter to conditionally fetch data instead of conditional hook calls
    const { data: feedback, isLoading: isFetchingFeedback } = useGetSingleFeedbackQuery(id || '', {
        skip: !id // Skip the query if id is not available
    });

    const handleSubmit = async (data: ICreateFeedback) => {
        try {
            // Check if id exists before updating
            if (id) {
                await updateFeedback({ id, data }).unwrap();
                navigate('/user/feedback');
            }
        } catch (error) {
            console.error('Failed to update feedback:', error);
        }
    };

    // Show a message if the ID is missing - after all hooks have been called
    if (!id) {
        return <div>Invalid feedback ID</div>;
    }

    if (isFetchingFeedback) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Edit Feedback</h1>
            <FeedbackForm
                onSubmit={handleSubmit}
                isLoading={isUpdating}
                initialValues={feedback}
            />
        </div>
    );
};