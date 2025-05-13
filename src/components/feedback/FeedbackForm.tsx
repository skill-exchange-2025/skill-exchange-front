import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ICreateFeedback } from "@/types/feedback.types";
import { useForm } from "react-hook-form";

interface Props {
    initialData?: Partial<ICreateFeedback>;
    onSubmit: (data: ICreateFeedback) => void;
    isLoading?: boolean;
}

export const FeedbackForm: React.FC<Props> = ({
                                                  initialData,
                                                  onSubmit,
                                                  isLoading,
                                              }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ICreateFeedback>({
        defaultValues: initialData,
    });

    const selectedType = watch("type");
    const selectedPriority = watch("priority");

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-xl shadow-md"
            aria-label="Feedback form"
        >
            {/* Title */}
            <div>
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? "title-error" : undefined}
                />
                {errors.title && (
                    <p id="title-error" className="text-sm text-destructive mt-1">
                        {errors.title.message}
                    </p>
                )}
            </div>

            {/* Description */}
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    rows={4}
                    {...register("description", {
                        required: "Description is required",
                    })}
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                    <p id="description-error" className="text-sm text-destructive mt-1">
                        {errors.description.message}
                    </p>
                )}
            </div>

            {/* Type */}
            <div>
                <Label htmlFor="type">Type</Label>
                <Select
                    value={selectedType}
                    onValueChange={(value) => setValue("type", value as any)}
                >
                    <SelectTrigger id="type" aria-label="Feedback type">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && (
                    <p className="text-sm text-destructive mt-1">
                        {errors.type.message}
                    </p>
                )}
            </div>

            {/* Priority */}
            <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                    value={selectedPriority}
                    onValueChange={(value) => setValue("priority", value as any)}
                >
                    <SelectTrigger id="priority" aria-label="Priority level">
                        <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
                {errors.priority && (
                    <p className="text-sm text-destructive mt-1">
                        {errors.priority.message}
                    </p>
                )}
            </div>

            {/* Submit */}
            <div className="pt-2">
                <Button
                    type="submit"
                    disabled={isLoading}
                    aria-busy={isLoading}
                    className="w-full"
                >
                    {isLoading ? "Submitting..." : "Submit"}
                </Button>
            </div>
        </form>
    );
};
