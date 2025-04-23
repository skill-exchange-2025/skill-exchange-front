import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useGetBuyerTransactionsQuery,
  useCompleteTransactionMutation,
  useCreateReviewMutation,
  Transaction,
} from '@/redux/features/marketplace/marketplaceApi';
import { ArrowLeft, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

// Define an extended Transaction type that includes review
interface ExtendedTransaction extends Transaction {
  review?: {
    rating: number;
    comment: string;
  };
}

export function TransactionsPage() {
  const navigate = useNavigate();
  const [, setActiveTab] = useState('purchases');
  const [selectedTransaction, setSelectedTransaction] =
    useState<ExtendedTransaction | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const { data, isLoading, refetch } = useGetBuyerTransactionsQuery(undefined);

  const [completeTransaction, { isLoading: isCompleting }] =
    useCompleteTransactionMutation();
  const [createReview, { isLoading: isReviewing }] = useCreateReviewMutation();

  const handleBack = () => {
    navigate('/marketplace/all');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleCompleteTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      await completeTransaction(selectedTransaction._id).unwrap();
      toast.success('Transaction completed successfully');
      setCompleteDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to complete transaction');
      console.error('Failed to complete transaction:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedTransaction) return;

    try {
      await createReview({
        transactionId: selectedTransaction._id,
        rating,
        comment: reviewComment,
      }).unwrap();
      toast.success('Review submitted successfully');
      setReviewDialogOpen(false);
      setRating(5);
      setReviewComment('');
      refetch();
    } catch (error) {
      toast.error('Failed to submit review');
      console.error('Failed to submit review:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-green-500 text-white">
            Completed
          </Badge>
        );
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Safely access the transactions data
  const transactions = data?.data || [];

  return (
    <div className="container py-8">
      <Button variant="outline" onClick={handleBack} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
      </Button>

      <h1 className="text-3xl font-bold mb-8">My Transactions</h1>

      <Tabs defaultValue="purchases" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="sales">My Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Purchases</CardTitle>
              <CardDescription>
                View all your marketplace purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      // Type assertion to ExtendedTransaction
                      const extTransaction = transaction as ExtendedTransaction;
                      return (
                        <TableRow key={extTransaction._id}>
                          <TableCell className="font-medium">
                            {extTransaction.listing?.title || 'Unknown Item'}
                          </TableCell>
                          <TableCell>{extTransaction.amount}</TableCell>
                          <TableCell>
                            {formatDate(extTransaction.createdAt)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(extTransaction.status)}
                          </TableCell>
                          <TableCell>
                            {extTransaction.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(extTransaction);
                                  setCompleteDialogOpen(true);
                                }}
                              >
                                Complete
                              </Button>
                            )}
                            {extTransaction.status === 'completed' &&
                              !extTransaction.review && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTransaction(extTransaction);
                                    setReviewDialogOpen(true);
                                  }}
                                >
                                  Leave Review
                                </Button>
                              )}
                            {extTransaction.status === 'completed' &&
                              extTransaction.review && (
                                <div className="flex items-center">
                                  <span className="text-yellow-500 mr-1">
                                    {extTransaction.review.rating}
                                  </span>
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                </div>
                              )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-1/3" />
                      <Skeleton className="h-12 w-1/6" />
                      <Skeleton className="h-12 w-1/6" />
                      <Skeleton className="h-12 w-1/6" />
                      <Skeleton className="h-12 w-1/6" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    You haven't made any purchases yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales</CardTitle>
              <CardDescription>View all your marketplace sales</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      // Type assertion to ExtendedTransaction
                      const extTransaction = transaction as ExtendedTransaction;
                      return (
                        <TableRow key={extTransaction._id}>
                          <TableCell className="font-medium">
                            {extTransaction.listing?.title || 'Unknown Item'}
                          </TableCell>
                          <TableCell>
                            {extTransaction.buyer?.name || 'Unknown Buyer'}
                          </TableCell>
                          <TableCell>{extTransaction.amount}</TableCell>
                          <TableCell>
                            {formatDate(extTransaction.createdAt)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(extTransaction.status)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-1/4" />
                      <Skeleton className="h-12 w-1/4" />
                      <Skeleton className="h-12 w-1/6" />
                      <Skeleton className="h-12 w-1/6" />
                      <Skeleton className="h-12 w-1/6" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    You haven't made any sales yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete Transaction Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this transaction as complete? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCompleteTransaction} disabled={isCompleting}>
              {isCompleting ? 'Processing...' : 'Complete Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with this purchase.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${
                      star <= rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts about this purchase..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={isReviewing}>
              {isReviewing ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
