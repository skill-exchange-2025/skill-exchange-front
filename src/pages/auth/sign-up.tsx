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
  StepperPrevious,
  StepperTitle,
  Step,
} from "@/components/ui/stepper";
import { BadgeSelector } from "@/components/ui/badge-selector";
import { PostSignupDialog } from "@/components/ui/PostSignupDialog";

const steps = [
  {
    title: "Personal Information",
    description: "Enter your name",
    fields: ["name"],
  },
  {
    title: "Contact Details",
    description: "Enter your phone",
    fields: ["phone"],
  },
  {
    title: "Account Details",
    description: "Enter your email and password",
    fields: ["email", "password"],
  },

  {
    title: "Skills & Interests",
    description: "Enter your skills",
    fields: ["skills", "desiredSkills"],
  },
];

const IT_SKILLS = [
  // Frontend
  "React",
  "Angular",
  "Vue.js",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  // Backend
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  // Database
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "Redis",
  // DevOps
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Git",
  // Mobile
  "React Native",
  "Flutter",
  "iOS",
  "Android",
  // Other
  "GraphQL",
  "REST API",
  "UI/UX",
  "Agile",
  "Scrum",
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(8, "Number must be exactly 8 numbers")
    .max(8, "Number must be exactly 8 numbers")
    .regex(/^\d{8}$/, "Please enter exactly 8 numbers"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9\W]).*$/,
      "Password must contain uppercase, lowercase, and number/special character"
    ),
  skills: z
    .array(
      z.object({
        name: z.string(),
        proficiencyLevel: z.string(),
      })
    )
    .min(1, "Select at least one skill")
    .max(5, "You can select up to 5 skills"),
  desiredSkills: z
    .array(
      z.object({
        name: z.string(),
        desiredProficiencyLevel: z.string(),
      })
    )
    .min(1, "Select at least one skill")
    .max(5, "You can select up to 5 skills"),
});

export function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPostSignup, setShowPostSignup] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      skills: [],
      desiredSkills: [],
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

    // Transform skills and desiredSkills into the expected format
    const transformedSkills = values.skills.map((skill) => ({
      name: skill.name,
      proficiencyLevel: skill.proficiencyLevel,
      description: "", // Optional
    }));

    const transformedDesiredSkills = values.desiredSkills.map((skill) => ({
      name: skill.name,
      desiredProficiencyLevel: skill.desiredProficiencyLevel,
      description: "", // Optional
    }));

    try {
      setLoading(true);
      await signUp(
        values.name,
        values.phone,
        values.email,
        values.password,
        transformedSkills,
        transformedDesiredSkills
      );
      toast.success("Account created successfully");
      setShowPostSignup(true);
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <PostSignupDialog
        isOpen={showPostSignup}
        onClose={() => {
          setShowPostSignup(false);
          navigate("/signin");
        }}
      />
      <div className="container max-w-4xl py-12">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">
              Enter your information to get started
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} />
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter your phone number"
                              maxLength={8}
                              onKeyDown={(e) => {
                                if (
                                  !/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight/.test(
                                    e.key
                                  )
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </StepperContent>

                <StepperContent value={2}>
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
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => {
                        const [showPassword, setShowPassword] = useState(false);
                        return (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a password"
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
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </StepperContent>

                <StepperContent value={3}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <BadgeSelector
                                options={IT_SKILLS}
                                selected={field.value}
                                onChange={field.onChange}
                                maxSelections={5}
                                type="skill"
                              />
                              <p className="text-sm text-muted-foreground">
                                Select up to 5 skills that best describe your
                                expertise
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="desiredSkills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desired Skills</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <BadgeSelector
                                options={IT_SKILLS}
                                selected={field.value}
                                onChange={field.onChange}
                                maxSelections={5}
                                type="desiredSkill"
                              />
                              <p className="text-sm text-muted-foreground">
                                Select up to 5 skills that you want to learn
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </StepperContent>

                <StepperFooter>
                  <StepperPrevious />
                  {currentStep === steps.length - 1 ? (
                    <Button
                      type="button" // Change to 'button' to prevent default submission
                      disabled={loading || !isCurrentStepValid()}
                      onClick={() => {
                        if (isCurrentStepValid()) {
                          form.handleSubmit(onSubmit)();
                        } else {
                          toast.error("Please complete all fields correctly");
                        }
                      }}
                    >
                      {loading ? "Creating account..." : "Sign Up"}
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
          <Link
      to="/signin"
      className="text-sm text-muted-foreground hover:underline float-right"
    >
      Already have an account? Sign in
    </Link>
        </div>
      </div>
    </div>
  );
}
