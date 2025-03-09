import { useEffect, useState } from 'react';
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
} from '@/redux/features/marketplace/marketplaceApi';
import {
  setSelectedItem,
  selectSelectedItem,
} from '@/redux/features/marketplace/marketplaceSlice';
import { useCurrentUser } from '@/redux/features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Edit,
  Trash,
  ShoppingCart,
  Calendar,
  User,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ConfirmationDialog } from '@/pages/marketplace/confirmation-dialog';
import { CreditPurchaseDialog } from '@/components/credits/CreditPurchaseDialog';
import { useGetUserCreditsQuery } from '@/redux/features/credits/creditsApi';
import cryptoIcon from '@/assets/icons/crypto.png';
import { Skeleton } from '@/components/ui/skeleton';

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

export function MarketplaceItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedItem = useSelector(selectSelectedItem);
  const currentUser = useSelector(useCurrentUser);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [creditPurchaseDialogOpen, setCreditPurchaseDialogOpen] =
    useState(false);

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
  const { data: creditsData } = useGetUserCreditsQuery();

  useEffect(() => {
    if (item) {
      dispatch(setSelectedItem(item));
    }

    return () => {
      dispatch(setSelectedItem(null));
    };
  }, [item, dispatch]);

  const handleBack = () => {
    navigate('/marketplace');
  };

  const handleEdit = () => {
    navigate(`/marketplace/edit/${id}`);
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await deleteItem(id || '').unwrap();
      toast.success('Item deleted successfully');
      navigate('/marketplace');
    } catch (err) {
      toast.error('Failed to delete item');
      console.error('Failed to delete item:', err);
    }
  };

  const handlePurchaseClick = () => {
    // Check if user has enough credits
    if (creditsData && item && creditsData.balance < item.price) {
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
      await purchaseItem(id || '').unwrap();
      toast.success('Item purchased successfully!');
      navigate('/marketplace');
    } catch (err) {
      toast.error('Failed to purchase item');
      console.error('Failed to purchase item:', err);
    }
  };

  // Determine if current user is the seller
  const isOwner = currentUser && item?.seller?._id === currentUser._id;

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

  return (
    <div className="container py-8">
      <Button variant="outline" onClick={handleBack} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div className="md:flex">
            {item.imagesUrl && (
              <div className="md:w-1/2">
                <img
                  src={item.imagesUrl[0]}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                />
              </div>
            )}
            <div
              className={`md:w-${
                item.imagesUrl ? '1/2' : 'full'
              } flex flex-col`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      Category: {item.category}
                    </div>
                  </div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    <img src={cryptoIcon} alt="Credits" className="h-6 w-6" />
                    {Math.round(item.price)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p>{item.description}</p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Seller Information</h3>
                  <p>{item.seller?.name}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Listed on{' '}
                  {new Date(
                    item.createdAt?.toString() || ''
                  ).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isOwner ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleEdit}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={isDeleting}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handlePurchaseClick} disabled={isPurchasing}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Purchase
                  </Button>
                )}
              </CardFooter>
            </div>
          </div>
        </Card>
      </motion.div>

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
          // If dialog is closed and user now has enough credits, show purchase dialog
          if (
            !open &&
            creditsData &&
            item &&
            creditsData.balance >= item.price
          ) {
            setPurchaseDialogOpen(true);
          }
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
    </div>
  );
}
