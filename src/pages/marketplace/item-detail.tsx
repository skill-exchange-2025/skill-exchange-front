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
import cryptoIcon from '@/assets/icons/crypto.png';

export function MarketplaceItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedItem = useSelector(selectSelectedItem);
  const currentUser = useSelector(useCurrentUser);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const {
    data: item,
    isLoading,
    error,
  } = useGetMarketplaceItemByIdQuery(id || '');
  const [purchaseItem, { isLoading: isPurchasing }] =
    usePurchaseMarketplaceItemMutation();
  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteMarketplaceItemMutation();

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
    try {
      await deleteItem(id || '').unwrap();
      toast.success('Item deleted successfully');
      navigate('/marketplace');
    } catch (err) {
      toast.error('Failed to delete item');
      console.error('Failed to delete item:', err);
    }
  };

  const handlePurchase = async () => {
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
    return (
      <div className="container py-8 flex justify-center">
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container py-8">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Button>
        <div className="mt-8 text-center">
          <p className="text-red-500">Error loading item details</p>
        </div>
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
                  Listed on {new Date(item.createdAt?.toString() || '').toLocaleDateString()}
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
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handlePurchase} disabled={isPurchasing}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Purchase
                  </Button>
                )}
              </CardFooter>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
