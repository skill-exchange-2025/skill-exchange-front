import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import {
  useCurrentUser,
  updateUserCredits,
} from '@/redux/features/auth/authSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
import cryptoIcon from '@/assets/icons/crypto.png';
import coinIcon from '@/assets/icons/coin.png';
import { toast } from 'sonner';
import { StripeProvider } from './StripeProvider';
import { StripePaymentForm } from './StripePaymentForm';
import {
  usePurchaseCreditsMutation,
  useGetUserCreditsQuery,
} from '@/redux/features/credits/creditsApi';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Credit package options
const CREDIT_PACKAGES = [
  { id: 'basic', amount: 100, price: 9.99, popular: false },
  { id: 'standard', amount: 500, price: 39.99, popular: true },
  { id: 'premium', amount: 1000, price: 69.99, popular: false },
];

interface CreditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customMessage?: string;
}

export function CreditPurchaseDialog({
  open,
  onOpenChange,
  customMessage,
}: CreditPurchaseDialogProps) {
  const currentUser = useAppSelector(useCurrentUser);
  const dispatch = useAppDispatch();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);

  // Use the RTK Query hooks
  const { data: creditsData, refetch: refetchCredits } =
    useGetUserCreditsQuery();
  const [purchaseCredits, { isLoading: isPurchasing }] =
    usePurchaseCreditsMutation();

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handlePurchase = () => {
    if (!selectedPackage) return;

    // Show Stripe form
    setShowStripeForm(true);
  };

  const handlePaymentSuccess = async (paymentMethodId?: string) => {
    if (!selectedPackage || !currentUser) {
      return;
    }

    const selectedPkg = CREDIT_PACKAGES.find(
      (pkg) => pkg.id === selectedPackage
    );

    if (!selectedPkg) {
      return;
    }

    try {
      // Call the API to purchase credits
      await purchaseCredits({
        amount: selectedPkg.amount,
        packageId: selectedPkg.id,
        paymentMethodId,
      }).unwrap();

      // Refetch user credits
      await refetchCredits();

      // Update user credits in auth state
      if (currentUser && creditsData) {
        dispatch(updateUserCredits(creditsData.balance));
      }

      // Show success toast
      toast.success('Purchase Successful', {
        description: `You have successfully purchased ${selectedPkg.amount} credits.`,
      });

      // Close the dialog
      setShowStripeForm(false);
      onOpenChange(false);
    } catch (error) {
      // Show error toast
      toast.error('Purchase Failed', {
        description:
          'There was an error processing your payment. Please try again.',
      });
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    toast.error('Payment Error', {
      description: errorMessage,
    });
  };

  const getSelectedPackageAmount = () => {
    if (!selectedPackage) return 0;
    const pkg = CREDIT_PACKAGES.find((p) => p.id === selectedPackage);
    return pkg ? pkg.price * 100 : 0; // Convert to cents for Stripe
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
          <DialogDescription>
            {customMessage ||
              'Credits can be used to access premium features and services.'}
          </DialogDescription>
        </DialogHeader>

        {!showStripeForm ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-primary ring-2 ring-primary'
                      : 'hover:border-primary/50'
                  } ${pkg.popular ? 'relative' : ''}`}
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  {pkg.popular && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                            <div className="flex items-center justify-center gap-1">
                              <img
                                src={coinIcon}
                                alt="coin"
                                className="w-4 h-4"
                              />
                              <span>Most Popular</span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="center"
                          className="max-w-[200px] z-50"
                          sideOffset={5}
                        >
                          <p>
                            Best value for money! Get 500 credits at the most
                            competitive rate, perfect for regular users.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold flex items-center justify-center gap-2">
                        <img
                          src={cryptoIcon}
                          alt="Credits"
                          className="h-6 w-6"
                        />
                        {pkg.amount}
                      </div>
                    </div>
                    <div className="text-center text-2xl font-bold">
                      {pkg.price} DT
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center pb-6">
                    {selectedPackage === pkg.id ? (
                      <Check className="h-6 w-6 text-primary" />
                    ) : null}
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-2">
                <img src={cryptoIcon} alt="Credits" className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">
                  Current Balance: {creditsData?.balance || 0} credits
                </span>
              </div>
              <Button onClick={handlePurchase} disabled={!selectedPackage}>
                Continue to Payment
              </Button>
            </div>
          </>
        ) : (
          <StripeProvider>
            <StripePaymentForm
              amount={getSelectedPackageAmount()}
              onBack={() => setShowStripeForm(false)}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              isProcessing={isProcessing || isPurchasing}
              setIsProcessing={setIsProcessing}
            />
          </StripeProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}
