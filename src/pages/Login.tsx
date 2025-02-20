import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/auth/authSlice";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { useState } from "react";
import {
  Stepper,
  StepperHeader,
  StepperContent,
  StepperFooter,
  StepperTitle,
  StepperDescription,
  Step,
} from "@/components/ui/stepper";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([
    { title: "Email", description: "Enter your email" },
    { title: "Password", description: "Enter your password" },
  ]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
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

      toast({
        title: "Success",
        description: "You have successfully logged in.",
        variant: "default",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isStepValid = (index: number) => {
    // Implement step validation logic here
    return true;
  };

  const handleNext = () => {
    if (isStepValid(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "Error",
        description: "Please complete previous steps first",
        variant: "destructive",
      });
    }
  };

  const isCurrentStepValid = () => {
    return isStepValid(currentStep);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8">
        <Form {...form}>
          <Stepper
            index={currentStep}
            onIndexChange={(index) => {
              if (isStepValid(index)) {
                setCurrentStep(index);
              } else {
                toast({
                  title: "Error",
                  description: "Please complete previous steps first",
                  variant: "destructive",
                });
              }
            }}
          >
            <StepperHeader className="mb-8">
              {steps.map((step, index) => (
                <Step key={index}>
                  <div className="cursor-pointer">
                    <StepperTitle>{step.title}</StepperTitle>
                    <StepperDescription>{step.description}</StepperDescription>
                  </div>
                </Step>
              ))}
            </StepperHeader>

            <div className="space-y-6">
              <StepperContent value={0}>
                <div className="w-full max-w-xl mx-auto">
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
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </StepperContent>

              <StepperContent value={1}>
                <div className="w-full max-w-xl mx-auto">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <div className="flex justify-end">
                          <Link
                            to="/forgot-password"
                            className="text-sm text-muted-foreground hover:text-primary"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </StepperContent>

              <StepperFooter>
                <div className="w-full max-w-xl mx-auto flex justify-between">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() =>
                      setCurrentStep((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>

                  {currentStep === steps.length - 1 ? (
                    <Button
                      type="button"
                      disabled={isLoading || !isCurrentStepValid()}
                      onClick={form.handleSubmit(onSubmit)}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!isCurrentStepValid()}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </StepperFooter>
            </div>
          </Stepper>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="pl-1"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </Button>
        </p>
      </CardFooter>
      <Toaster />
    </Card>
  );
};

export default LoginForm;
