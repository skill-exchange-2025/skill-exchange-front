import {useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';
import {
    useResetPasswordMutation,
    useUpdatePasswordMutation,
    useVerifyOTPMutation,
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
  const [otpToken, setOtpToken] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

      // Focus the first OTP input after transitioning to OTP step
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 100);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTPCode(otp: string) {
    if (otp.length === 6) {
      try {
        setLoading(true);
        const response = await verifyOTP({
          email,
          otp: otp.toString(), // Ensure OTP is a string
        }).unwrap();

        if (response.valid) {
          // Store the OTP token if returned from the API
          if (response.token) {
            setOtpToken(response.token);
          }
          // Store the OTP value in the form for later use
          otpForm.setValue('otp', otp);
          toast.success('OTP verified successfully');
          setStep('password');
        } else {
          toast.error('Invalid OTP');
        }
      } catch (error) {
        console.error('OTP verification error:', error);
        toast.error('Failed to verify OTP');
      } finally {
        setLoading(false);
      }
    }
  }

  async function onOTPSubmit(values: z.infer<typeof otpSchema>) {
    await verifyOTPCode(values.otp);
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    try {
      setLoading(true);

      // Get the OTP value
      const otpValue = otpForm.getValues().otp;

      if (!otpValue || otpValue.length !== 6) {
        toast.error('Invalid OTP. Please go back and verify again.');
        return;
      }

      // Include both the OTP token and the OTP value in the payload
      const payload = {
        email,
        password: values.password,
        otp: otpValue.toString(),
        ...(otpToken ? { token: otpToken } : {}),
      };

      console.log('Sending password update payload:', {
        ...payload,
        password: '***',
      });

      await updatePassword(payload).unwrap();
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (error) {
      console.error('Update password error:', error);
      toast.error(
        'Failed to update password. Please verify your OTP and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  // Handle OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    const currentOtp = otpForm.getValues().otp || '';
    const otpArray = currentOtp.split('');
    otpArray[index] = value;
    const newOtp = otpArray.join('');

    otpForm.setValue('otp', newOtp, { shouldValidate: true });

    // Auto-focus next input
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Verify OTP when all digits are entered
    if (newOtp.length === 6) {
      verifyOTPCode(newOtp);
    }
  };

  // Handle backspace in OTP inputs
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      const currentOtp = otpForm.getValues().otp || '';

      // If current field is empty and not the first field, focus previous field
      if (!currentOtp[index] && index > 0 && otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const pastedOtp = pastedData.slice(0, 6).replace(/[^0-9]/g, '');

    if (pastedOtp) {
      otpForm.setValue('otp', pastedOtp, { shouldValidate: true });

      // Fill in the individual inputs
      for (let i = 0; i < pastedOtp.length; i++) {
        const inputRef = otpInputRefs.current[i];
        if (inputRef) {
          inputRef.value = pastedOtp[i];
        }
      }

      // Verify if complete
      if (pastedOtp.length === 6) {
        verifyOTPCode(pastedOtp);
      }
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ email }).unwrap();
      toast.success('New OTP sent. Please check your inbox.');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

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
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 'otp' && (
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(onOTPSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OTP</FormLabel>
                      <FormControl>
                        <div
                          className="flex gap-2 justify-center"
                          onPaste={handleOtpPaste}
                        >
                          {[...Array(6)].map((_, index) => (
                            <Input
                              key={index}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              className="w-12 h-12 text-center text-xl"
                              value={field.value?.[index] || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ''
                                );
                                if (value.length <= 1) {
                                  handleOtpChange(index, value);
                                }
                              }}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              ref={(el) => {
                                otpInputRefs.current[index] = el;
                              }}
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    disabled={loading || otpForm.getValues().otp?.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    Resend OTP
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep('email');
                      otpForm.reset();
                    }}
                  >
                    Change Email
                  </Button>
                </div>
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

                <div className="flex flex-col gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('otp')}
                  >
                    Back to OTP Verification
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
