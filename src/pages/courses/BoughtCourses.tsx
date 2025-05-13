import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useGetTransactionsQuery } from "@/redux/features/marketplace/marketplaceApi";

const BoughtCourses = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');
    const limit = 20;

    const { data: response, isLoading, isError } = useGetTransactionsQuery({
        page,
        limit,
        status: status === 'all' ? undefined : status,
    } as any)

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        setPage(1);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Purchased Courses</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-8 w-3/4"/>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2"/>
                                <Skeleton className="h-4 w-2/3 mb-2"/>
                                <Skeleton className="h-4 w-1/2"/>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Purchased Courses</h1>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-red-500">Failed to load purchased courses. Please try again later.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const transactions = response?.data || [];
    const totalPages = Math.ceil((response?.total || 0) / limit);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Purchased Courses</h1>
                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {transactions.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No transactions found.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {transactions.map((transaction) => (
                            <Card key={transaction._id}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        <span>{transaction.listing.title}</span>
                                        <span className="text-sm font-normal bg-secondary px-2 py-1 rounded">
                                            {transaction.listing.type === 'course' ? 'Course' : 'Online Course'}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Purchased {formatDate(transaction.createdAt)}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Price:</span> ${transaction.listing.price}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Category:</span> {transaction.listing.category}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Skill:</span> {transaction.listing.skillName} ({transaction.listing.proficiencyLevel})
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Seller:</span> {transaction.seller.name}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold">Status:</span>{' '}
                                        <span className={`${
                                            transaction.status === 'completed' ? 'text-green-600' :
                                                transaction.status === 'pending' ? 'text-yellow-600' :
                                                    'text-red-600'
                                        }`}>
                                            {transaction.status}
                                        </span>
                                    </p>
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

export default BoughtCourses;