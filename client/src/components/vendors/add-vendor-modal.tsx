import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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
  name: z.string().min(1, { message: "Vendor name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email" }).optional().or(z.literal("")),
});

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: any;
}

export default function AddVendorModal({ isOpen, onClose, vendor }: AddVendorModalProps) {
  const { toast } = useToast();
  const isEditing = !!vendor;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: vendor?.name || "",
      category: vendor?.category || "",
      contact: vendor?.contact || "",
      phone: vendor?.phone || "",
      email: vendor?.email || "",
    },
  });
  
  useEffect(() => {
    if (vendor) {
      form.reset({
        name: vendor.name,
        category: vendor.category,
        contact: vendor.contact || "",
        phone: vendor.phone || "",
        email: vendor.email || "",
      });
    } else {
      form.reset({
        name: "",
        category: "",
        contact: "",
        phone: "",
        email: "",
      });
    }
  }, [vendor, form]);
  
  // Create vendor mutation
  const createVendorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('/api/vendors', {
        method: 'POST',
        data: data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({ title: "Success", description: "Vendor added successfully" });
      onClose();
      form.reset();
    },
    onError: (error) => {
      console.error("Vendor creation error:", error);
      toast({ 
        title: "Error", 
        description: "There was an error adding the vendor", 
        variant: "destructive" 
      });
    }
  });
  
  // Update vendor mutation
  const updateVendorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest(`/api/vendors/${vendor.id}`, {
        method: 'PATCH',
        data: data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({ title: "Success", description: "Vendor updated successfully" });
      onClose();
    },
    onError: (error) => {
      console.error("Vendor update error:", error);
      toast({ 
        title: "Error", 
        description: "There was an error updating the vendor", 
        variant: "destructive" 
      });
    }
  });
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditing) {
      updateVendorMutation.mutate(data);
    } else {
      createVendorMutation.mutate(data);
    }
  };
  
  const isPending = createVendorMutation.isPending || updateVendorMutation.isPending;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details for this vendor." 
              : "Fill out the form below to add a new vendor."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vendor name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                      <SelectItem value="Venue">Venue</SelectItem>
                      <SelectItem value="Catering">Catering</SelectItem>
                      <SelectItem value="Bakery">Bakery</SelectItem>
                      <SelectItem value="Florist">Florist</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Decoration">Decoration</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact name" {...field} />
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
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" type="email" {...field} />
                  </FormControl>
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
                {isPending ? "Saving..." : isEditing ? "Update Vendor" : "Add Vendor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
