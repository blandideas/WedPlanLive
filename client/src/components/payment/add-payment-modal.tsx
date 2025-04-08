import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define interfaces
interface Vendor {
  id: number;
  name: string;
  category: string;
}

interface Payment {
  id: number;
  vendorId: number;
  amount: number;
  date: string;
  description: string;
  isPaid: boolean;
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  vendors: Vendor[];
}

// Form validation schema
const formSchema = z.object({
  vendorId: z.string().min(1, "Please select a vendor"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Please select a date"),
  description: z.string().optional(),
  isPaid: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddPaymentModal({ 
  isOpen, 
  onClose, 
  payment,
  vendors 
}: AddPaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!payment;

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: payment ? payment.vendorId.toString() : "",
      amount: payment ? payment.amount : 0,
      date: payment ? payment.date : new Date().toISOString().split('T')[0],
      description: payment ? payment.description : "",
      isPaid: payment ? payment.isPaid : false,
    },
  });

  // Reset form when payment changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        vendorId: payment ? payment.vendorId.toString() : "",
        amount: payment ? payment.amount : 0,
        date: payment ? payment.date : new Date().toISOString().split('T')[0],
        description: payment ? payment.description : "",
        isPaid: payment ? payment.isPaid : false,
      });
    }
  }, [isOpen, payment, form]);

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest("/api/payments", {
        method: "POST",
        data: {
          ...data,
          vendorId: parseInt(data.vendorId),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      vendors.forEach((vendor) => {
        queryClient.invalidateQueries({
          queryKey: [`/api/vendors/${vendor.id}/payments`],
        });
      });
      toast({
        title: "Payment added",
        description: "The payment has been added successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async (data: FormValues & { id: number }) => {
      return apiRequest(`/api/payments/${data.id}`, {
        method: "PATCH",
        data: {
          ...data,
          vendorId: parseInt(data.vendorId),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      vendors.forEach((vendor) => {
        queryClient.invalidateQueries({
          queryKey: [`/api/vendors/${vendor.id}/payments`],
        });
      });
      toast({
        title: "Payment updated",
        description: "The payment has been updated successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    if (isEditing && payment) {
      updatePaymentMutation.mutate({ ...data, id: payment.id });
    } else {
      createPaymentMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Payment" : "Add New Payment"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Vendor Selection */}
            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (GHS)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter payment description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Paid Status */}
            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mark as paid</FormLabel>
                    <FormDescription>
                      Check this if you have already made this payment
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPaymentMutation.isPending || updatePaymentMutation.isPending}
              >
                {(createPaymentMutation.isPending || updatePaymentMutation.isPending) ? (
                  "Saving..."
                ) : (
                  isEditing ? "Update Payment" : "Add Payment"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}