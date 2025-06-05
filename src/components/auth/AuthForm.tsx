import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(['user', 'admin'] as const).optional(),
  bloodType: z.enum(BLOOD_TYPES as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a blood type." }),
  }).optional().default("A+"),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }).optional(),
  dateOfBirth: z.date({
    required_error: "Please select your date of birth.",
  }).optional(),
  address: z.string().min(5, { message: "Please enter a valid address." }).optional(),
  lastDonation: z.date({
    required_error: "Please select your last donation date.",
  }).optional(),
  isAvailable: z.boolean().default(true),
});

interface AuthFormProps {
  type: 'login' | 'register' | 'registerDonor';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(
      type === 'login' 
        ? formSchema.pick({ email: true, password: true }) 
        : type === 'register'
          ? formSchema.pick({ email: true, password: true })
          : formSchema
    ),
    defaultValues: {
      email: '',
      password: '',
      bloodType: 'A+',
      phone: '',
      address: '',
      isAvailable: true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (type === 'registerDonor') {
        const bloodType = values.bloodType as BloodType;
        
        const { data, error } = await signUp(
          values.email,
          values.password,
          {
            blood_type: bloodType,
            contact_number: values.phone || '',
            location: values.address || '',
            last_donation_date: values.lastDonation ? values.lastDonation.toISOString() : new Date().toISOString(),
            is_available: values.isAvailable
          }
        );

        if (error) throw error;

        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account.",
        });
        navigate('/login');
      } else if (type === 'register') {
        const { data, error } = await signUp(values.email, values.password);
        
        if (error) throw error;

        if (data?.user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: values.role || 'user'
            });

          if (roleError) throw roleError;
        }

        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account.",
        });
        navigate('/login');
      } else if (type === 'login') {
        const { data, error } = await signIn(values.email, values.password);
        
        if (error) throw error;
        
        toast({
          title: "Login successful",
          description: "You are now logged in.",
        });
        navigate(state?.from?.pathname || '/', { replace: true });
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: type === 'login' ? "Login failed" : "Registration failed",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const DatePickerFormField = ({ field, label }: { field: any; label: string }) => (
    <>
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">
          {type === 'login' ? 'Login' : type === 'register' ? 'Register' : 'Register as Donor'}
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} type="email" />
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
                    <Input placeholder="Enter your password" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'register' && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === 'registerDonor' && (
              <>
                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a blood type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BLOOD_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <Input placeholder="Enter your phone number" {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <DatePickerFormField field={field} label="Date of Birth" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastDonation"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <DatePickerFormField field={field} label="Last Donation Date" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Processing...' : type === 'login' ? 'Login' : 'Register'}
            </Button>
            
            {type === 'login' && (
              <div className="text-center mt-4">
                <p>Don't have an account? 
                  <Button 
                    variant="link" 
                    className="p-0 ml-2" 
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </p>
              </div>
            )}
            
            {type === 'register' && (
              <div className="text-center mt-4">
                <p>Already have an account? 
                  <Button 
                    variant="link" 
                    className="p-0 ml-2" 
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                </p>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AuthForm;
