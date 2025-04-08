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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormDescription 
} from "@/components/ui/form";

interface AddBulkPackingItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: number;
}

const formSchema = z.object({
  itemsText: z.string().min(1, "Please enter at least one item"),
});

export default function AddBulkPackingItemsModal({ isOpen, onClose, listId }: AddBulkPackingItemsModalProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemsText: "",
    },
  });

  const addBulkItemsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Parse the input - each line is a separate item
      const itemLines = data.itemsText.split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Prepare the items array for the API
      const items = itemLines.map(line => ({
        item: line,
        quantity: 1,
        packed: false,
        listId,
      }));

      // Make the API call to add all items
      const response = await apiRequest('/api/packing-items/bulk', {
        method: 'POST',
        data: { items }
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/packing-lists', listId, 'items'] });
      const count = data.length || 0;
      toast({ 
        title: "Items added", 
        description: `Successfully added ${count} item${count === 1 ? '' : 's'} to your packing list` 
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "There was an error adding the items", 
        variant: "destructive" 
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addBulkItemsMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Multiple Items</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="itemsText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Items</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter one item per line, e.g:
Sunscreen
Beach towel
Passport
Camera" 
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter one item per line. Each item will have a quantity of 1 by default.
                  </FormDescription>
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
                disabled={addBulkItemsMutation.isPending}
              >
                {addBulkItemsMutation.isPending ? "Adding..." : "Add Items"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}