import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { DozerIcon } from "@/components/icons/DozerIcon";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const vendorJoinSchema = z.object({
  // Account info
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Your name is required"),
  // Company info
  vendorName: z.string().min(1, "Company name is required"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  yardAddress: z.string().min(1, "Yard address is required"),
});

type VendorJoinFormValues = z.infer<typeof vendorJoinSchema>;

const steps = [
  { id: 1, title: "Account", description: "Your login credentials" },
  { id: 2, title: "Company", description: "Your business details" },
];

export default function VendorJoin() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

  const form = useForm<VendorJoinFormValues>({
    resolver: zodResolver(vendorJoinSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      vendorName: "",
      phone: "",
      website: "",
      yardAddress: "",
    },
  });

  const validateStep = async (step: number) => {
    const fieldsToValidate =
      step === 1
        ? (["email", "password", "name"] as const)
        : (["vendorName", "phone", "yardAddress"] as const);

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (data: VendorJoinFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Submit to vendor signup endpoint
      const response = await fetch(`${baseUrl}/api/vendors/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          vendorName: data.vendorName,
          phone: data.phone,
          yardAddress: data.yardAddress,
          website: data.website || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || "Failed to create account. Please try again.");
        return;
      }

      // Auto-login after signup
      const loginResult = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (loginResult.error) {
        // Account created but login failed - redirect to login
        navigate("/vendor/login");
      } else {
        navigate("/vendor");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <DozerIcon className="w-10 h-10 text-primary" />
          <span className="text-xl font-bold text-foreground">EquipScout</span>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-bold">Join EquipScout</CardTitle>
            <CardDescription>
              List your equipment and connect with renters
            </CardDescription>
          </CardHeader>

          {/* Step Indicator */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        currentStep >= step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p
                        className={`text-sm font-medium ${
                          currentStep >= step.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-3 ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}

                {/* Step 1: Account Info */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@company.com"
                              autoComplete="email"
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
                            <Input
                              type="password"
                              placeholder="At least 8 characters"
                              autoComplete="new-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="John Smith"
                              autoComplete="name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleNext}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Company Info */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <FormField
                      control={form.control}
                      name="vendorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Austin Equipment Rentals"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(512) 555-1234"
                              autoComplete="tel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://yourcompany.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yardAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yard Address</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="123 Equipment Lane, Austin, TX 78701"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleBack}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>

          <div className="px-6 pb-6 text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/vendor/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
