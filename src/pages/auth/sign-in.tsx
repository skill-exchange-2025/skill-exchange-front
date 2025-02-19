import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useAuth } from "@/context/auth";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperFooter,
  StepperHeader,
  StepperTitle,
  Step,
} from "@/components/ui/stepper";

const steps = [
  {
    title: "Email",
    description: "Enter your email address",
    fields: ["email"],
  },
  {
    title: "Password",
    description: "Enter your password",
    fields: ["password"],
  },
];

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  // Check if all previous steps are valid
  const isStepValid = (stepIndex: number) => {
    const previousFields = steps
      .slice(0, stepIndex)
      .flatMap((step) => step.fields);

    const fieldValues = form.getValues();
    const fieldErrors = form.formState.errors;

    return previousFields.every(
      (field) =>
        fieldValues[field as keyof typeof fieldValues] &&
        !fieldErrors[field as keyof typeof fieldErrors]
    );
  };

  const isCurrentStepValid = () => {
    const currentFields = steps[currentStep].fields;
    const fieldValues = form.getValues();
    const fieldErrors = form.formState.errors;

    return currentFields.every(
      (field) =>
        fieldValues[field as keyof typeof fieldValues] &&
        !fieldErrors[field as keyof typeof fieldErrors]
    );
  };

  // const handleStepClick = (stepIndex: number) => {
  //   if (isStepValid(stepIndex)) {
  //     setCurrentStep(stepIndex);
  //   } else {
  //     toast.error("Please complete previous steps first");
  //   }
  // };

  const handleNext = () => {
    if (isCurrentStepValid()) {
      setCurrentStep((prev) => prev + 1);
    } else {
      steps[currentStep].fields.forEach((field) => {
        return form.trigger(field as keyof z.infer<typeof formSchema>);
      });
      toast.error("Please complete all fields correctly before proceeding");
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isCurrentStepValid()) {
      return;
    }

    try {
      setLoading(true);
      await signIn(values.email, values.password);
      toast.success("Signed in successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container max-w-4xl py-12">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">
              Enter your credentials to sign in
            </p>
          </div>

          <Stepper
            index={currentStep}
            onIndexChange={(index) => {
              if (isStepValid(index)) {
                setCurrentStep(index);
              } else {
                toast.error("Please complete previous steps first");
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

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <StepperContent value={0}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
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
                  </div>
                </StepperContent>

                <StepperContent value={1}>
                  <div className="space-y-4">
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
                      disabled={loading || !isCurrentStepValid()}
                      onClick={() => {
                        if (isCurrentStepValid()) {
                          form.handleSubmit(onSubmit)();
                        } else {
                          toast.error("Please complete all fields correctly");
                        }
                      }}
                    >
                      {loading ? "Signing in..." : "Sign In"}
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
                </StepperFooter>
              </form>
            </Form>
          </Stepper>
        </div>
      </div>
    </div>
  );
}
