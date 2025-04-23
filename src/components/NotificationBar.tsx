import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAcceptBookingMutation, useDeclineBookingMutation } from '@/redux/features/marketplace/marketplaceApi';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Notification {
    _id: string;
    type: 'booking_request' | 'booking_accepted' | 'booking_declined';
    transactionId: string;
    listing: {
        title: string;
        type: 'course' | 'onlineCourse';
    };
    buyer: {
        name: string;
    };
    meetingStartTime: string;
    status: 'pending' | 'accepted' | 'declined';
}

interface NotificationBarProps {
    notifications: Notification[];
    isSeller: boolean;
}

export function NotificationBar({ notifications, isSeller }: NotificationBarProps) {
    const [acceptBooking] = useAcceptBookingMutation();
    const [declineBooking] = useDeclineBookingMutation();
    const [processing, setProcessing] = useState<string | null>(null);

    const handleAccept = async (notification: Notification) => {
        setProcessing(notification._id);
        try {
            await acceptBooking(notification.transactionId).unwrap();
            toast.success('Booking accepted successfully');
        } catch (error) {
            toast.error('Failed to accept booking');
        } finally {
            setProcessing(null);
        }
    };

    const handleDecline = async (notification: Notification) => {
        setProcessing(notification._id);
        try {
            await declineBooking(notification.transactionId).unwrap();
            toast.success('Booking declined');
        } catch (error) {
            toast.error('Failed to decline booking');
        } finally {
            setProcessing(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'text-green-600';
            case 'declined':
                return 'text-red-600';
            default:
                return 'text-yellow-600';
        }
    };

    return (
        <div className="space-y-4">
            {notifications.map((notification) => (
                <div key={notification._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold">{notification.listing.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {notification.type === 'booking_request' 
                                    ? `${notification.buyer.name} requested a meeting`
                                    : `Booking ${notification.status}`}
                            </p>
                            <p className="text-sm">
                                Scheduled for: {format(new Date(notification.meetingStartTime), 'PPP p')}
                            </p>
                            <p className={`text-sm ${getStatusColor(notification.status)}`}>
                                Status: {notification.status}
                            </p>
                        </div>
                        {isSeller && notification.status === 'pending' && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAccept(notification)}
                                    disabled={!!processing}
                                >
                                    Accept
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDecline(notification)}
                                    disabled={!!processing}
                                >
                                    Decline
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
} 