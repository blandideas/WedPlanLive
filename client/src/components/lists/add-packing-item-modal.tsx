import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

interface AddPackingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: number;
  item?: any;
}

const formSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  quantity: z.coerce.number().int().positive().default(1),
  packed: z.boolean().default(false),
});

export default function AddPackingItemModal({ isOpen, onClose, listId, item }: AddPackingItemModalProps) {
  const { toast } = useToast();
  const isEditing = !!item;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item: item?.item || "",
      quantity: item?.quantity || 1,
      packed: item?.packed || false,
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = {
        ...data,
        listId,
      };
      
      if (isEditing) {
        const response = await apiRequest('PATCH', `/api/packing-items/${item.id}`, payload);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/packing-items', payload);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packing-lists', listId, 'items'] });
      toast({ 
        title: isEditing ? "Item updated" : "Item added", 
        description: isEditing 
          ? "Item has been updated successfully" 
          : "Item has been added to your packing list" 
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: isEditing 
          ? "There was an error updating the item" 
          : "There was an error adding the item", 
        variant: "destructive" 
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addItemMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Item" : "Add Item to Packing List"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="What do you need to pack?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded-md">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 mt-1 rounded border-gray-300"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Already packed</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addItemMutation.isPending}
              >
                {addItemMutation.isPending ? "Saving..." : isEditing ? "Update Item" : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}