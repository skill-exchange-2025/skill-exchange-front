import { Button } from '@/components/ui/button';
import {Card} from "antd";
import {CardContent} from "@/components/ui/card.tsx";

interface ErrorCardProps {
    message: string;
    onRetry: () => void;
}

const ErrorCard = ({ message, onRetry }: ErrorCardProps) => (
    <div className="container py-8">
        <Card>
            <CardContent className="p-6">
                <p className="text-red-500">{message}</p>
                <Button onClick={onRetry} className="mt-4">
                    Go Back
                </Button>
            </CardContent>
        </Card>
    </div>
);

export default ErrorCard;
