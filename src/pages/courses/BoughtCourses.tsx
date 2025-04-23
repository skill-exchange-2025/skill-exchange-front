import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetBuyerTransactionsQuery, useBookMeetingMutation } from '@/redux/features/marketplace/marketplaceApi';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns'; // Removed unused 'format'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BookingDialog } from "@/components/BookingDialog";
import { toast } from 'sonner';

interface Purchase {
    id: string;
    purchaseDate: string;
    listing: {
        id: string;
        title: string;
        price: number;
        description: string;
        type: 'course' | 'onlineCourse';
        skillName: string;
        proficiencyLevel: string;
        category: string;
        status: string;
    };
    seller: {
        id: string;
        name: string;
        email: string;
    };
    status: 'completed' | 'pending' | 'cancelled' | 'pending_approval' | 'accepted' | 'declined';
    meetingLink?: string;
}

const PurchaseHistory = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');
    const limit = 20;
    const [bookMeeting] = useBookMeetingMutation();
    const [isBooking, setIsBooking] = useState(false);

    const { data: response, isLoading, isError, error: fetchError } = useGetBuyerTransactionsQuery({
        page,
        limit,
        status: status !== 'all' ? status : undefined,
    });

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        setPage(1); // Reset to first page when filter changes
    };

    const handleBooking = async (purchase: Purchase, date: Date) => {
        setIsBooking(true);
        try {
            // Ensure date is properly formatted as ISO string
            const meetingStartTime = new Date(date).toISOString();
            
            const bookingData = {
                transactionId: purchase.id,
                meetingStartTime,
                listingId: purchase.listing.id,
                meetingDuration: 60 // Default duration of 60 minutes
            };
            
            // Log detailed booking information
            console.log('Booking request details:', {
                ...bookingData,
                sellerId: purchase.seller.id,
                sellerName: purchase.seller.name,
                sellerEmail: purchase.seller.email,
                courseTitle: purchase.listing.title,
                courseType: purchase.listing.type,
                transactionStatus: purchase.status,
                formattedDate: new Date(meetingStartTime).toLocaleString()
            });
            
            const result = await bookMeeting(bookingData).unwrap();
            
            // Enhanced logging for debugging
            console.log('Booking response details:', {
                success: !!result,
                transaction: result,
                hasMeetingLink: !!result.meetingLink,
                hasNotificationStatus: !!result.notificationStatus
            });
            
            if (!result.meetingLink) {
                console.warn('No meeting link in response:', result);
                toast.warning('Meeting booking in progress', {
                    description: (
                        <div className="mt-2 space-y-2">
                            <p>The meeting has been scheduled with {purchase.seller.name}.</p>
                            <p className="text-sm text-muted-foreground">
                                The meeting link will be available soon. Please check back later.
                            </p>
                        </div>
                    ),
                    duration: 8000
                });
            } else {
                toast.success('Meeting booked successfully!', {
                    description: (
                        <div className="mt-2 space-y-2">
                            <p>The seller ({purchase.seller.name}) has been notified about your meeting request.</p>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Meeting scheduled for: {new Date(date).toLocaleString()}</p>
                                <a 
                                    href={result.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline block"
                                >
                                    Click here to join the meeting
                                </a>
                            </div>
                        </div>
                    ),
                    duration: 8000
                });
            }
        } catch (error: any) {
            // Enhanced error logging
            console.error('Booking failed:', {
                error: error,
                transactionDetails: {
                    id: purchase.id,
                    listingId: purchase.listing.id,
                    type: purchase.listing.type,
                    title: purchase.listing.title,
                    status: purchase.status,
                    sellerId: purchase.seller.id,
                    sellerName: purchase.seller.name
                }
            });
            
            if (error?.status === 400 && error?.data?.message === 'This listing is no longer available') {
                toast.error('Unable to book meeting', {
                    description: (
                        <div className="space-y-1">
                            <p>This course has been marked as sold.</p>
                            <p className="text-sm text-muted-foreground">
                                Please contact {purchase.seller.name} directly to schedule a meeting.
                            </p>
                        </div>
                    )
                });
            } else if (error?.status === 404) {
                toast.error('Unable to book meeting', {
                    description: 'The course listing could not be found. Please contact support if this issue persists.'
                });
            } else {
                toast.error('Booking failed', {
                    description: (
                        <div className="space-y-1">
                            <p>There was a problem booking the meeting.</p>
                            <p className="text-sm text-muted-foreground">
                                Error: {error?.data?.message || 'Unknown error occurred'}
                            </p>
                        </div>
                    )
                });
            }
        } finally {
            setIsBooking(false);
        }
    };

    const getBookingStatus = (purchase: Purchase) => {
        if (purchase.status === 'pending_approval') {
            return 'Waiting for seller approval';
        }
        if (purchase.status === 'accepted') {
            return 'Booking confirmed';
        }
        if (purchase.status === 'declined') {
            return 'Booking declined';
        }
        return '';
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Purchase History</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-8 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-4" />
                                <Skeleton className="h-10 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        console.error('Error fetching transactions:', fetchError);
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Purchase History</h1>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-red-500">Failed to load purchase history. Please try again later.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const purchases: Purchase[] = response?.data || []; 
    const totalPages = Math.ceil((response?.total || 0) / limit); // Calculate total pages based on total items and limit

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Purchase History</h1>
                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {purchases.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No purchases found.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {purchases.map((purchase: Purchase) => (
                            <Card key={purchase.id} className="overflow-hidden">
                            <CardHeader className="bg-muted">
                                    <CardTitle className="flex justify-between items-center">
                                        <span>{purchase.listing.title}</span>
                                        <span className="text-sm font-normal bg-secondary px-2 py-1 rounded">
                                            {purchase.listing.type === 'course' ? 'Course' : 'Online Course'}
                                        </span>
                                    </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Purchased {formatDate(purchase.purchaseDate)}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold">Price:</span> ${purchase.listing.price}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold">Category:</span> {purchase.listing.category}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold">Skill:</span> {purchase.listing.skillName} ({purchase.listing.proficiencyLevel})
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold">Seller:</span> {purchase.seller.name}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold">Status:</span>{' '}
                                            <span className={`${
                                                purchase.status === 'completed' ? 'text-green-600' :
                                                    purchase.status === 'pending' ? 'text-yellow-600' :
                                                        'text-red-600'
                                            }`}>
                                                {purchase.status}
                                            </span>
                                        </p>
                                        {purchase.meetingLink && (
                                            <div className="mt-2 pt-2 border-t">
                                                <p className="text-sm font-semibold mb-1">Meeting Link:</p>
                                                <a 
                                                    href={purchase.meetingLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline text-sm break-all"
                                                >
                                                    {purchase.meetingLink}
                                                </a>
                                            </div>
                                        )}
                                        {purchase.listing.type === 'onlineCourse' && (
                                            <div className="mt-4 pt-4 border-t">
                                                {purchase.status === 'pending_approval' && (
                                                    <div className="text-yellow-600 mb-4">
                                                        {getBookingStatus(purchase)}
                                                    </div>
                                                )}
                                                {purchase.status === 'accepted' && purchase.meetingLink && (
                                                    <div className="mb-4">
                                                        <div className="text-green-600 mb-2">
                                                            {getBookingStatus(purchase)}
                                                        </div>
                                                        <a
                                                            href={purchase.meetingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            Join Meeting
                                                        </a>
                                                    </div>
                                                )}
                                                {purchase.status === 'declined' && (
                                                    <div className="text-red-600 mb-4">
                                                        {getBookingStatus(purchase)}
                                                    </div>
                                                )}
                                                {(!purchase.status || purchase.status === 'completed') && !purchase.meetingLink && !purchase.status?.includes('pending') && (
                                                    <BookingDialog
                                                        sellerName={purchase.seller.name}
                                                        courseTitle={purchase.listing.title}
                                                        transactionId={purchase.id}
                                                        onBook={(date) => handleBooking(purchase, date)}
                                                        isBooking={isBooking}
                                                    />
                                                )}
                                            </div>
                                        )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="py-2 px-4">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PurchaseHistory;