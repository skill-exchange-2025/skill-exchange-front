import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  useGetMarketplaceItemByIdQuery,
  usePurchaseMarketplaceItemMutation,
  useDeleteMarketplaceItemMutation,
  useCompleteTransactionMutation,
  useCreateReviewMutation,
  useGetWalletQuery,
  Transaction,
  useUpdateMarketplaceItemMutation,
} from '@/redux/features/marketplace/marketplaceApi';
import { setSelectedItem } from '@/redux/features/marketplace/marketplaceSlice';
import { useCurrentUser } from '@/redux/features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Edit,
  Trash,
  ShoppingCart,
  Calendar,
  User,
  Star,
  Eye,
  Clock,
  Tag,
  Sparkles,
  MapPin,
  Users,
  BookOpen,
} from 'lucide-react';
import { ConfirmationDialog } from '@/pages/marketplace/confirmation-dialog';
import { CreditPurchaseDialog } from '@/components/credits/CreditPurchaseDialog';
import cryptoIcon from '@/assets/icons/crypto.png';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getListingTypeInfo,
  renderListingContent,
} from '@/utils/marketplaceUtils';
import { ListingType } from '@/redux/features/marketplace/marketplaceApi';
import { marketplaceApi } from '@/redux/features/marketplace/marketplaceApi';

// Item detail skeleton component
const ItemDetailSkeleton = () => {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Image section */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <Skeleton className="h-[400px] w-full" />
          </Card>
        </div>

        {/* Details section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>

              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description section */}
      <Card className="mt-8">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
  );
};

// Function to get level badge color and icon
const getLevelBadge = (level?: string) => {
  if (!level) return null;

  let color = '';
  let icon = null;

  switch (level.toLowerCase()) {
    case 'beginner':
      color = 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300';
      icon = '🌱'; // Seedling for beginners
      break;
    case 'intermediate':
      color = 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300';
      icon = '🌿'; // Growing plant for intermediate
      break;
    case 'advanced':
      color =
        'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300';
      icon = '🌳'; // Full tree for advanced
      break;
    case 'expert':
      color = 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300';
      icon = '✨'; // Sparkles for expert
      break;
    default:
      color = 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300';
      icon = '📚';
  }

  return (
    <Badge variant="outline" className={`${color} font-medium shadow-sm`}>
      <span className="mr-1">{icon}</span> {level}
    </Badge>
  );
};

// Function to format view count with proper pluralization and styling
const formatViewCount = (views?: number) => {
  if (views === undefined || views === null) return '0 views';

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k ${views === 1000 ? 'view' : 'views'}`;
  }

  return `${views} ${views === 1 ? 'view' : 'views'}`;
};

export function MarketplaceItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(useCurrentUser);
  const hasDispatchedRef = useRef(false);
  const viewCountUpdatedRef = useRef(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [creditPurchaseDialogOpen, setCreditPurchaseDialogOpen] =
    useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const {
    data: item,
    isLoading,
    error,
  } = useGetMarketplaceItemByIdQuery(id || '', {
    skip: !id,
  });

  const [purchaseItem, { isLoading: isPurchasing }] =
    usePurchaseMarketplaceItemMutation();
  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteMarketplaceItemMutation();
  const [completeTransaction] = useCompleteTransactionMutation();
  const [createReview] = useCreateReviewMutation();
  const [updateItem] = useUpdateMarketplaceItemMutation();

  const { data: walletData } = useGetWalletQuery();

  // Set selected item once when data is loaded
  useEffect(() => {
    if (item && !hasDispatchedRef.current) {
      dispatch(setSelectedItem(item));
      hasDispatchedRef.current = true;
    }
  }, [item, dispatch]);

  // Clear selected item on unmount
  useEffect(() => {
    return () => {
      dispatch(setSelectedItem(null));
      hasDispatchedRef.current = false;
      viewCountUpdatedRef.current = false;
    };
  }, [dispatch]);

  // Handle view count increment - separate useEffect that runs only once when component mounts
  useEffect(() => {
    // Create a flag to run this effect only once
    let isMounted = true;

    const updateViewCount = async () => {
      // Only proceed if we have valid ID, item data, and haven't updated view count yet
      if (!id || !item || !isMounted || viewCountUpdatedRef.current) return;

      // Don't increment view count if current user is the seller
      const isOwner =
        currentUser && item.seller && item.seller._id === currentUser._id;
      if (isOwner) {
        console.log(
          'Seller viewing their own item - not incrementing view count'
        );
        return;
      }

      // Generate a unique storage key that will persist for this visit
      const visitorId =
        localStorage.getItem('visitorId') ||
        `visitor_${Math.random().toString(36).substring(2, 15)}`;

      // Store the visitorId if not already set
      if (!localStorage.getItem('visitorId')) {
        localStorage.setItem('visitorId', visitorId);
      }

      // Create a storage key specific to this visitor and this item
      const viewKey = `viewed_${id}_${visitorId}`;

      // Check if this specific visitor has already viewed this specific item
      const hasViewed = localStorage.getItem(viewKey);

      if (hasViewed) {
        console.log(
          'This visitor has already viewed this item - not incrementing view count'
        );
        return;
      }

      // Mark this view to prevent duplicate counts
      viewCountUpdatedRef.current = true;
      localStorage.setItem(viewKey, 'true');

      console.log('Incrementing view count for item:', id);

      try {
        // Update view count in the database
        const newViewCount = (item.views || 0) + 1;
        await updateItem({
          id,
          data: { views: newViewCount },
        }).unwrap();

        console.log('View count updated successfully');

        // Invalidate cache to show updated counts in listings
        dispatch(
          marketplaceApi.util.invalidateTags([
            { type: 'MarketplaceItem', id: 'LIST' },
            { type: 'MarketplaceItem', id: 'COURSES' },
            { type: 'MarketplaceItem', id: 'ONLINE_COURSES' },
          ])
        );
      } catch (err) {
        console.error('Failed to update view count:', err);
        // Reset the flag in case of error
        viewCountUpdatedRef.current = false;
        localStorage.removeItem(viewKey);
      }
    };

    // Call the function
    updateViewCount();

    // Cleanup function
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, item?.seller?._id]); // Minimal dependencies to avoid re-running

  const handleBack = () => {
    // Navigate back to the appropriate listing type page
    if (item?.type === ListingType.COURSE) {
      navigate('/marketplace/courses');
    } else if (item?.type === ListingType.ONLINE_COURSE) {
      navigate('/marketplace/online-courses');
    } else {
      navigate('/marketplace/all');
    }
  };

  const handleEdit = () => {
    navigate(`/marketplace/edit/${id}`);
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await deleteItem(id || '').unwrap();
      toast.success('Item deleted successfully');
      navigate('/marketplace/all');
    } catch (err) {
      toast.error('Failed to delete item');
      console.error('Failed to delete item:', err);
    }
  };

  const handlePurchaseClick = () => {
    // Check if user has enough credits
    if (walletData && item && walletData.balance < item.price) {
      // Show credit purchase dialog if not enough credits
      setCreditPurchaseDialogOpen(true);
    } else {
      // Show purchase confirmation dialog if enough credits
      setPurchaseDialogOpen(true);
    }
  };

  const handlePurchase = async () => {
    setPurchaseDialogOpen(false);
    try {
      const result = await purchaseItem(id || '').unwrap();
      setTransaction(result);

      // Show success message and add notification
      toast.success('Item purchased successfully!', {
        description: 'Your credits have been updated.',
      });

      // Add notification for purchase
      const notification = new CustomEvent('addNotification', {
        detail: {
          message: `Successfully purchased ${item?.title}`,
          type: 'transaction',
        },
      });
      window.dispatchEvent(notification);

      // Invalidate the wallet query to refresh credits amount
      dispatch(marketplaceApi.util.invalidateTags(['Credits']));
      // Navigate back to marketplace
      navigate('/marketplace/all');
    } catch (err) {
      toast.error('Failed to purchase item');
      console.error('Failed to purchase item:', err);
    }
  };

  const handleCompleteTransaction = async () => {
    if (!transaction) return;

    setCompleteDialogOpen(false);
    try {
      await completeTransaction(transaction._id).unwrap();
      toast.success('Transaction completed successfully!');
      // Add notification for transaction completion
      const notification = new CustomEvent('addNotification', {
        detail: {
          message: `Transaction completed for ${item?.title}`,
          type: 'transaction',
        },
      });
      window.dispatchEvent(notification);
      // Show review button instead of automatically opening review dialog
      setReviewDialogOpen(false);
    } catch (err) {
      toast.error('Failed to complete transaction');
      console.error('Failed to complete transaction:', err);
    }
  };

  const handleSubmitReview = async () => {
    if (!transaction) return;

    setReviewDialogOpen(false);
    try {
      await createReview({
        transactionId: transaction._id,
        rating,
        comment: reviewComment,
      }).unwrap();
      toast.success('Review submitted successfully!');
      navigate('/marketplace/all');
    } catch (err) {
      toast.error('Failed to submit review');
      console.error('Failed to submit review:', err);
    }
  };

  // Add function to handle review button click
  const handleReviewClick = () => {
    setReviewDialogOpen(true);
  };

  // Determine if current user is the seller
  const isOwner = currentUser && item?.seller?._id === currentUser._id;

  // Add function to check if user can review
  const canReview = transaction?.status === 'completed' && !transaction?.review;

  if (isLoading) {
    return <ItemDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-500 mb-2">
                Error Loading Item
              </h2>
              <p className="text-muted-foreground mb-4">
                There was a problem loading this marketplace item.
              </p>
              <Button onClick={handleBack}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Item Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The marketplace item you're looking for doesn't exist or has
                been removed.
              </p>
              <Button onClick={handleBack}>Go Back to Marketplace</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get listing type info and content
  const typeInfo = getListingTypeInfo(item);
  const content = renderListingContent(item);

  // Format date for display
  const formattedDate = new Date(
    item.createdAt?.toString() || ''
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container py-8">
      <Button variant="outline" onClick={handleBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Image section */}
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden shadow-md">
              {item.imagesUrl && item.imagesUrl.length > 0 ? (
                <div className="w-full">
                  <img
                    src={item.imagesUrl[0]}
                    alt={item.title}
                    className="w-full h-[400px] object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-[400px] bg-muted flex items-center justify-center">
                  <div className="text-8xl opacity-30">{typeInfo.icon}</div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Details section */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 bg-black/70 text-white shadow-md"
                    >
                      <span className="text-lg">{typeInfo.icon}</span>
                      {typeInfo.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.category && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" />
                        {item.category}
                      </Badge>
                    )}
                    {item.proficiencyLevel &&
                      getLevelBadge(item.proficiencyLevel)}
                    {item.skillName && (
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 border-amber-300"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {item.skillName}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Description
                  </h3>
                  <div className="text-2xl font-bold flex items-center gap-2 bg-primary/10 p-2 rounded-md">
                    <img src={cryptoIcon} alt="Credits" className="h-6 w-6" />
                    {Math.round(item.price)}
                  </div>
                </div>

                <p className="text-muted-foreground">{item.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Listed {formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{formatViewCount(item.views)}</span>
                  </div>
                </div>

                {isOwner ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={isDeleting}
                      className="flex items-center gap-1"
                    >
                      <Trash className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handlePurchaseClick}
                    disabled={isPurchasing}
                    className="flex items-center gap-1 w-full"
                  >
                    <ShoppingCart className="h-4 w-4" /> Purchase Now
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Seller section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm">Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-medium">
                    {item.seller?.name?.charAt(0) ||
                      item.seller?.email?.charAt(0) ||
                      'U'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {item.seller?.name ||
                        item.seller?.email ||
                        'Unknown seller'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Member since{' '}
                      {new Date(item.createdAt || '').getFullYear()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tags section */}
          {item.tags && item.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Add Review Button in the details section */}
          {canReview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4"
            >
              <Card className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Leave a Review</span>
                    </div>
                    <Button
                      onClick={handleReviewClick}
                      className="flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Write Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Listing Type Specific Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <Card className="shadow-md">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{typeInfo.icon}</span>
              {typeInfo.label} Details
            </CardTitle>
            <p className="text-muted-foreground">{typeInfo.description}</p>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Type-specific information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {typeInfo.dateInfo && (
                <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-md">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{typeInfo.dateInfo}</span>
                </div>
              )}
              {typeInfo.locationInfo && (
                <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-md">
                  <MapPin className="h-5 w-5 text-red-500" />
                  <span>{typeInfo.locationInfo}</span>
                </div>
              )}
              {typeInfo.studentsInfo && (
                <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-md">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>{typeInfo.studentsInfo}</span>
                </div>
              )}
              {typeInfo.contentInfo && (
                <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-md">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <span>{typeInfo.contentInfo}</span>
                </div>
              )}
            </div>

            {/* Render the main content based on listing type */}
            <div className="mt-4">{content.mainContent}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
      />

      <ConfirmationDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        title="Purchase Item"
        description={`Are you sure you want to purchase "${
          item.title
        }" for ${Math.round(item.price)} credits?`}
        confirmText="Purchase"
        onConfirm={handlePurchase}
      />

      <CreditPurchaseDialog
        open={creditPurchaseDialogOpen}
        onOpenChange={(open) => {
          setCreditPurchaseDialogOpen(open);
        }}
        customMessage={
          item
            ? `You don't have enough credits to purchase "${
                item.title
              }" (${Math.round(
                item.price
              )} credits required). Please purchase more credits to continue.`
            : undefined
        }
      />

      <ConfirmationDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        title="Complete Transaction"
        description="Are you sure you want to complete this transaction?"
        confirmText="Complete"
        onConfirm={handleCompleteTransaction}
      />

      <ConfirmationDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        title="Submit Review"
        description="Please provide your feedback for this transaction."
        confirmText="Submit Review"
        onConfirm={handleSubmitReview}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating}/5</span>
          </div>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Write your review here..."
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
            rows={4}
          />
        </div>
      </ConfirmationDialog>
    </div>
  );
}
