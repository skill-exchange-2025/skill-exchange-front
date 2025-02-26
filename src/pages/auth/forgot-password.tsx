import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useResetPasswordMutation,
  useVerifyOTPMutation,
  useUpdatePasswordMutation,
} from '@/redux/features/auth/authApi';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9\W]).*$/,
        'Password must contain uppercase, lowercase, and number/special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const steps = [
  { id: 'email', label: 'Email' },
  { id: 'otp', label: 'Verification' },
  { id: 'password', label: 'New Password' },
] as const;

export function ForgotPassword() {
  const navigate = useNavigate();
  const [resetPassword] = useResetPasswordMutation();
  const [verifyOTP] = useVerifyOTPMutation();
  const [updatePassword] = useUpdatePasswordMutation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onEmailSubmit(values: z.infer<typeof emailSchema>) {
    try {
      setLoading(true);
      await resetPassword({ email: values.email }).unwrap();
      setEmail(values.email);
      toast.success('OTP sent. Please check your inbox.');
      setStep('otp');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function onOTPChange(e: React.ChangeEvent<HTMLInputElement>) {
    const otp = e.target.value;
    if (otp.length === 6) {
      try {
        setLoading(true);
        const response = await verifyOTP({ email, otp }).unwrap();

        if (response.valid) {
          toast.success('OTP verified successfully');
          setStep('password');
        } else {
          toast.error('Invalid OTP');
        }
      } catch (error) {
        toast.error('Failed to verify OTP');
      } finally {
        setLoading(false);
      }
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    try {
      setLoading(true);
      await updatePassword({
        email,
        password: values.password,
      }).unwrap();
      toast.success('Password updated successfully');
      navigate('/signin');
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container max-w-4xl py-12">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground">
              {step === 'email' &&
                "Enter your email address and we'll send you an OTP"}
              {step === 'otp' && 'Enter the OTP sent to your email'}
              {step === 'password' && 'Enter your new password'}
            </p>
          </div>

          <div className="flex justify-between items-center">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold',
                      step === s.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : steps.findIndex((x) => x.id === step) > i
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted bg-muted text-muted-foreground'
                    )}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-sm mt-1',
                      step === s.id
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-[2px] w-full mx-2',
                      steps.findIndex((x) => x.id === step) > i
                        ? 'bg-primary'
                        : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 'email' && (
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/signin')}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 'otp' && (
            <Form {...otpForm}>
              <form className="space-y-4">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OTP</FormLabel>
                      <FormControl>
                        <div className="flex gap-2 justify-center">
                          {[...Array(6)].map((_, index) => (
                            <Input
                              key={index}
                              type="text"
                              maxLength={1}
                              className="w-12 h-12 text-center text-xl"
                              value={field.value[index] || ''}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                const newOtp = field.value.split('');
                                newOtp[index] = newValue;
                                const updatedOtp = newOtp.join('');
                                field.onChange(updatedOtp);

                                if (newValue && index < 5) {
                                  const nextInput =
                                    e.target.parentElement?.nextElementSibling?.querySelector(
                                      'input'
                                    );
                                  if (nextInput) nextInput.focus();
                                }

                                if (updatedOtp.length === 6) {
                                  onOTPChange({
                                    target: { value: updatedOtp },
                                  } as React.ChangeEvent<HTMLInputElement>);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (
                                  e.key === 'Backspace' &&
                                  !field.value[index] &&
                                  index > 0
                                ) {
                                  const prevInput =
                                    e.currentTarget.parentElement?.previousElementSibling?.querySelector(
                                      'input'
                                    );
                                  if (prevInput) prevInput.focus();
                                }
                              }}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pastedData = e.clipboardData
                                  .getData('text')
                                  .slice(0, 6);
                                field.onChange(pastedData);

                                if (pastedData.length === 6) {
                                  onOTPChange({
                                    target: { value: pastedData },
                                  } as React.ChangeEvent<HTMLInputElement>);
                                }
                              }}
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {step === 'password' && (
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
