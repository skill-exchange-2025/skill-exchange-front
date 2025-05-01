import {useNavigate} from 'react-router-dom';
import {useCreateFeedbackMutation} from '@/redux/features/feedback/feedbackApi';
import {FeedbackForm} from '@/components/feedback/FeedbackForm';
import {ICreateFeedback} from "@/types/feedback.types.ts";

export const CreateFeedback = () => {
    const navigate = useNavigate();
    const [createFeedback, { isLoading }] = useCreateFeedbackMutation();

    const handleSubmit = async (data: ICreateFeedback) => {
        try {
            await createFeedback(data).unwrap();
            navigate('/user/feedback');
        } catch (error) {
            console.error('Failed to create feedback:', error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Create Feedback</h1>
            <FeedbackForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />


        </div>

    );
};