import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  item: z.string().min(1, { message: "Item description is required" }),
  vendor: z.string().optional(),
  amount: z.string()
    .min(1, { message: "Amount is required" })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, { message: "Amount must be a positive number" }),
});

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: any;
}

export default function AddExpenseModal({ isOpen, onClose, expense }: AddExpenseModalProps) {
  const { toast } = useToast();
  const isEditing = !!expense;
  
  // Fetch vendors for the dropdown
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: expense?.category || "",
      item: expense?.item || "",
      vendor: expense?.vendor || "",
      amount: expense?.amount?.toString() || "",
    },
  });
  
  useEffect(() => {
    if (expense) {
      form.reset({
        category: expense.category,
        item: expense.item,
        vendor: expense.vendor || "",
        amount: expense.amount.toString(),
      });
    } else {
      form.reset({
        category: "",
        item: "",
        vendor: "",
        amount: "",
      });
    }
  }, [expense, form]);
  
  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/expenses', {
        ...data,
        amount: Number(data.amount),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({ title: "Success", description: "Expense added successfully" });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "There was an error adding the expense", 
        variant: "destructive" 
      });
    }
  });
  
  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('PATCH', `/api/expenses/${expense.id}`, {
        ...data,
        amount: Number(data.amount),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({ title: "Success", description: "Expense updated successfully" });
      onClose();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "There was an error updating the expense", 
        variant: "destructive" 
      });
    }
  });
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditing) {
      updateExpenseMutation.mutate(data);
    } else {
      createExpenseMutation.mutate(data);
    }
  };
  
  const isPending = createExpenseMutation.isPending || updateExpenseMutation.isPending;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details for this expense." 
              : "Fill out the form below to add a new expense."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Venue & Catering">Venue & Catering</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Videography">Videography</SelectItem>
                      <SelectItem value="Attire">Attire</SelectItem>
                      <SelectItem value="Flowers & Décor">Flowers & Décor</SelectItem>
                      <SelectItem value="Music & Entertainment">Music & Entertainment</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Stationery">Stationery</SelectItem>
                      <SelectItem value="Rings">Rings</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {vendors.map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.name}>
                          {vendor.name}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-7" 
                        min="0" 
                        step="0.01" 
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Saving..." : isEditing ? "Update Expense" : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
