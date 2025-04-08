import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useGetWalletQuery,
  useCreatePaymentIntentMutation,
  useProcessPaymentMutation,
} from '@/redux/features/marketplace/marketplaceApi';
import { toast } from 'sonner';
import cryptoIcon from '@/assets/icons/crypto.png';
import { Loader2, Plus } from 'lucide-react';

export function WalletBalance() {
  const [amount, setAmount] = useState(100);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: wallet, isLoading } = useGetWalletQuery();
  const [createPaymentIntent, { isLoading: isCreatingIntent }] =
    useCreatePaymentIntentMutation();
  const [processPayment, { isLoading: isProcessingPayment }] =
    useProcessPaymentMutation();

  const handleAddFunds = async () => {
    try {
      const result = await createPaymentIntent({ amount }).unwrap();
      setPaymentIntentId(result.clientSecret.split('_secret_')[0]);

      // In a real application, you would use the Stripe SDK to handle the payment
      // For this demo, we'll simulate a successful payment
      toast.info('Payment intent created. Processing payment...');
      setIsProcessing(true);

      // Simulate payment processing delay
      setTimeout(async () => {
        try {
          await processPayment({
            paymentIntentId: paymentIntentId || 'pi_simulated',
            amount,
          }).unwrap();

          toast.success('Payment processed successfully!');
          setShowAddFunds(false);
          setIsProcessing(false);
        } catch (error) {
          console.error('Error processing payment:', error);
          toast.error('Failed to process payment');
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to create payment intent');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Balance</CardTitle>
        <CardDescription>
          Your current balance and transaction history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={cryptoIcon} alt="Credits" className="h-8 w-8" />
            <span className="text-2xl font-bold">{wallet?.balance || 0}</span>
            <span className="text-muted-foreground">credits</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddFunds(!showAddFunds)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Funds
          </Button>
        </div>

        {showAddFunds && (
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="font-medium mb-2">Add Credits to Your Wallet</h3>
            <div className="flex gap-2 mb-4">
              <Input
                type="number"
                min="10"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 10)}
                disabled={
                  isCreatingIntent || isProcessingPayment || isProcessing
                }
              />
              <Button
                onClick={handleAddFunds}
                disabled={
                  isCreatingIntent || isProcessingPayment || isProcessing
                }
              >
                {isCreatingIntent || isProcessingPayment || isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Credits'
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              For testing, use Stripe test card: 4242 4242 4242 4242
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleString()}
      </CardFooter>
    </Card>
  );
}
