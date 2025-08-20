
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Check } from "lucide-react";

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { resetPassword, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError(null);
    try {
      await resetPassword(data.email);
      setSuccess(true);
      form.reset();
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container pt-8 pb-8">
        <Logo />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
          <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-muted-foreground mb-6">Enter your email to receive password reset instructions</p>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 flex items-start">
              <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Reset email sent!</p>
                <p className="text-sm mt-1">Please check your email for instructions to reset your password.</p>
              </div>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        {...field} 
                        disabled={success}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-hashim-600 hover:bg-hashim-700 text-white" 
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Send Reset Instructions
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Remember your password?</span>{" "}
            <Link to="/login" className="text-hashim-600 hover:underline font-medium">
              Back to login
            </Link>
          </div>
        </div>
        
        <div className="mt-8 flex items-center">
          <Link to="/" className="text-sm text-hashim-600 hover:underline flex items-center">
            Back to home
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
