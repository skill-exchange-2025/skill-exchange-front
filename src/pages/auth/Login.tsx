import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Eye, EyeOff, Loader2} from 'lucide-react';
import {Card, CardContent, CardFooter} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {toast} from 'sonner';
import {Link, useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {setUser} from '@/redux/features/auth/authSlice';
import {useLoginMutation} from '@/redux/features/auth/authApi';
import {useState} from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await loginMutation(data).unwrap();
      dispatch(
        setUser({
          user: result.user,
          token: result.access_token,
        })
      );

      toast.success('Successfully logged in', {
        description: 'Welcome back to your account!',
      });

      if (result.user.roles.includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'An error occurred during login';

      // Handle different types of errors
      if (errorMessage.toLowerCase().includes('verify')) {
        toast.error('Email Not Verified', {
          description:
            'Please check your email and verify your account before logging in.',
        });
      } else if (errorMessage.toLowerCase().includes('credentials')) {
        toast.error('Invalid Credentials', {
          description: 'The email or password you entered is incorrect.',
        });
      } else if (errorMessage.toLowerCase().includes('not found')) {
        toast.error('Account Not Found', {
          description: 'No account exists with this email address.',
        });
      } else {
        toast.error('Login Failed', {
          description: errorMessage,
        });
      }

      // Set field-specific errors if needed
      if (errorMessage.toLowerCase().includes('email')) {
        form.setError('email', {
          type: 'manual',
          message: 'Invalid email address',
        });
      } else if (errorMessage.toLowerCase().includes('password')) {
        form.setError('password', {
          type: 'manual',
          message: 'Invalid password',
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container max-w-4xl py-12">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            className="w-full"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter your password"
                              type={showPassword ? 'text' : 'password'}
                              className="w-full"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <div className="flex justify-end">
                          <Link
                            to="/forgot-password"
                            className="text-sm text-muted-foreground hover:text-[#00EC96] transition-colors duration-200"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-primary hover:text-[#00EC96] transition-colors duration-200 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
