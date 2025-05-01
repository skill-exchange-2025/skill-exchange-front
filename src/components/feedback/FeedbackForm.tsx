import React from 'react';
import {useForm} from 'react-hook-form';
import {ICreateFeedback} from '@/types/feedback.types';

interface Props {
    initialData?: Partial<ICreateFeedback>,
    onSubmit: (data: ICreateFeedback) => void,
    isLoading?: boolean,
    initialValues?: unknown
}

export const FeedbackForm: React.FC<Props> = ({initialData, onSubmit, isLoading}) => {
    const {register, handleSubmit, formState: {errors}} = useForm<ICreateFeedback>({
        defaultValues: initialData,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block mb-1">Title</label>
                <input
                    {...register('title', {required: 'Title is required'})}
                    className="w-full border rounded p-2"
                />
                {errors.title && (
                    <span className="text-red-500 text-sm">{errors.title.message}</span>
                )}
            </div>

            <div>
                <label className="block mb-1">Description</label>
                <textarea
                    {...register('description', {required: 'Description is required'})}
                    className="w-full border rounded p-2"
                    rows={4}
                />
                {errors.description && (
                    <span className="text-red-500 text-sm">{errors.description.message}</span>
                )}
            </div>

            <div>
                <label className="block mb-1">Type</label>
                <select
                    {...register('type', {required: 'Type is required'})}
                    className="w-full border rounded p-2"
                >
                    <option value="bug">Bug</option>
                    <option value="improvement">Improvement</option>
                    <option value="feature">Feature</option>
                </select>
            </div>

            <div>
                <label className="block mb-1">Priority</label>
                <select
                    {...register('priority', {required: 'Priority is required'})}
                    className="w-full border rounded p-2"
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {isLoading ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
};