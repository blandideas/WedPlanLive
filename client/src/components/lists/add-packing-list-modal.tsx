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
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

interface AddPackingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list?: any;
}

const formSchema = z.object({
  activity: z.string().min(1, "Activity name is required"),
  description: z.string().optional(),
});

export default function AddPackingListModal({ isOpen, onClose, list }: AddPackingListModalProps) {
  const { toast } = useToast();
  const isEditing = !!list;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activity: list?.activity || "",
      description: list?.description || "",
    },
  });

  const addListMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (isEditing) {
        const response = await apiRequest('PATCH', `/api/packing-lists/${list.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/packing-lists', data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packing-lists'] });
      toast({ 
        title: isEditing ? "List updated" : "List created", 
        description: isEditing 
          ? "Packing list has been updated successfully" 
          : "New packing list has been created" 
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: isEditing 
          ? "There was an error updating the packing list" 
          : "There was an error creating the packing list", 
        variant: "destructive" 
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addListMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Packing List" : "Create New Packing List"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="activity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Honeymoon Trip, Wedding Ceremony" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a description for this packing list" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
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
                disabled={addListMutation.isPending}
              >
                {addListMutation.isPending ? "Saving..." : isEditing ? "Update List" : "Create List"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}