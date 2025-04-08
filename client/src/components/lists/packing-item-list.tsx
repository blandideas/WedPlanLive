import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, ListPlus } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import AddPackingItemModal from "./add-packing-item-modal";
import AddBulkPackingItemsModal from "./add-bulk-packing-items-modal";

interface PackingItemListProps {
  listId: number;
}

export default function PackingItemList({ listId }: PackingItemListProps) {
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch packing items
  const { data: items = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/packing-lists', listId, 'items'],
    queryFn: async () => {
      const res = await apiRequest(`/api/packing-lists/${listId}/items`);
      return res.json();
    },
  });
  
  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest(`/api/packing-items/${itemId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packing-lists', listId, 'items'] });
      toast({ title: "Item deleted", description: "Item has been deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "There was an error deleting the item", 
        variant: "destructive" 
      });
    }
  });
  
  // Update item mutation (for checkbox)
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, packed }: { id: number, packed: boolean }) => {
      const response = await apiRequest(`/api/packing-items/${id}`, {
        method: 'PATCH',
        data: { packed }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packing-lists', listId, 'items'] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "There was an error updating the item", 
        variant: "destructive" 
      });
    }
  });
  
  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (itemId: number) => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (itemToDelete !== null) {
      deleteItemMutation.mutate(itemToDelete);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
  const handleCheckboxChange = (id: number, packed: boolean) => {
    updateItemMutation.mutate({ id, packed: !packed });
  };
  
  return (
    <>
      {/* Action Buttons */}
      <div className="flex justify-end mb-4 space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsBulkAddModalOpen(true)}
          className="flex items-center"
        >
          <ListPlus className="h-4 w-4 mr-1" />
          Add Multiple Items
        </Button>
        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>
    
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No items in this packing list yet. Add your first item!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center w-12">Packed</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item: any) => (
                  <tr key={item.id} className={item.packed ? "bg-gray-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Checkbox 
                        className="mx-auto"
                        checked={item.packed} 
                        onCheckedChange={() => handleCheckboxChange(item.id, item.packed)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${item.packed ? "line-through text-gray-500" : "text-gray-900"}`}>{item.item}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-sm ${item.packed ? "text-gray-500" : "text-gray-900"}`}>{item.quantity || 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => handleEditClick(item)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Edit Item Modal */}
      {editingItem && (
        <AddPackingItemModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          listId={listId}
          item={editingItem}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Item Modal */}
      <AddPackingItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        listId={listId}
      />

      {/* Add Bulk Items Modal */}
      <AddBulkPackingItemsModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        listId={listId}
      />
    </>
  );
}