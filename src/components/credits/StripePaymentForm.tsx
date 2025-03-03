import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface StripePaymentFormProps {
  amount: number;
  onBack: () => void;
  onSuccess: (paymentMethodId?: string) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

export function StripePaymentForm({
  amount,
  onBack,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);

    try {
      // Get a reference to a mounted CardElement
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // In a real implementation, you would create a payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Payment successful - pass the payment method ID back
      onSuccess(paymentMethod.id);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="text-sm font-medium">Card Details</label>
        <div className="p-3 border rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          You will be charged ${(amount / 100).toFixed(2)} for this purchase.
        </p>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </DialogFooter>
    </form>
  );
}
