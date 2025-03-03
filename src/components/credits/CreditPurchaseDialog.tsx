import React, { useState } from 'react';
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
import { CreditCard, Check } from 'lucide-react';
import { useToast } from '@/components/use-toast';
import { StripeProvider } from './StripeProvider';
import { StripePaymentForm } from './StripePaymentForm';
import {
  usePurchaseCreditsMutation,
  useGetUserCreditsQuery,
} from '@/redux/features/credits/creditsApi';

// Credit package options
const CREDIT_PACKAGES = [
  { id: 'basic', amount: 100, price: 9.99, popular: false },
  { id: 'standard', amount: 500, price: 39.99, popular: true },
  { id: 'premium', amount: 1000, price: 69.99, popular: false },
];

interface CreditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditPurchaseDialog({
  open,
  onOpenChange,
}: CreditPurchaseDialogProps) {
  const currentUser = useAppSelector(useCurrentUser);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
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
        dispatch(updateUserCredits(creditsData.credits));
      }

      // Show success toast
      toast({
        title: 'Purchase Successful',
        description: `You have successfully purchased ${selectedPkg.amount} credits.`,
      });

      // Close the dialog
      setShowStripeForm(false);
      onOpenChange(false);
    } catch (error) {
      // Show error toast
      toast({
        title: 'Purchase Failed',
        description:
          'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    toast({
      title: 'Payment Error',
      description: errorMessage,
      variant: 'destructive',
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
            Credits can be used to access premium features and services.
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
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold">{pkg.amount}</div>
                      <div className="text-muted-foreground">Credits</div>
                    </div>
                    <div className="text-center text-2xl font-bold">
                      ${pkg.price}
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
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Current Balance: {currentUser?.credits || 0} credits
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
