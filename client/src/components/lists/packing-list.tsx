import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
import PackingItemList from "./packing-item-list";
import AddPackingListModal from "./add-packing-list-modal";

export default function PackingList() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const [expandedList, setExpandedList] = useState<string | null>(null);
  const [listToDelete, setListToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch all packing lists
  const { data: packingLists = [], isLoading } = useQuery({
    queryKey: ['/api/packing-lists'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/packing-lists');
      return res.json();
    },
  });
  
  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (listId: number) => {
      await apiRequest('DELETE', `/api/packing-lists/${listId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packing-lists'] });
      toast({ title: "List deleted", description: "Packing list has been deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "There was an error deleting the packing list", 
        variant: "destructive" 
      });
    }
  });
  
  const handleAddList = () => {
    setEditingList(null);
    setIsAddModalOpen(true);
  };
  
  const handleEditList = (list: any) => {
    setEditingList(list);
    setIsAddModalOpen(true);
  };
  
  const handleDeleteList = (listId: number) => {
    setListToDelete(listId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteList = () => {
    if (listToDelete !== null) {
      deleteListMutation.mutate(listToDelete);
      setIsDeleteDialogOpen(false);
      setListToDelete(null);
    }
  };
  
  // Auto-expand the first list if there's only one
  useEffect(() => {
    if (packingLists?.length === 1) {
      setExpandedList(`list-${packingLists[0].id}`);
    }
  }, [packingLists]);
  
  const expandedValue = expandedList || undefined;
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Packing Lists</h2>
        <Button onClick={handleAddList} className="flex items-center gap-1">
          <Plus size={16} /> Add List
        </Button>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center">Loading packing lists...</div>
      ) : packingLists.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">You don't have any packing lists yet.</p>
          <Button onClick={handleAddList} className="flex items-center gap-1">
            <Plus size={16} /> Create Your First Packing List
          </Button>
        </div>
      ) : (
        <Accordion 
          type="single" 
          collapsible 
          value={expandedValue}
          onValueChange={setExpandedList}
          className="space-y-4"
        >
          {packingLists.map((list: any) => (
            <AccordionItem 
              key={list.id} 
              value={`list-${list.id}`}
              className="border rounded-lg shadow-sm bg-white overflow-hidden"
            >
              <div className="flex justify-between items-center px-4 py-2 bg-gray-50">
                <AccordionTrigger className="py-2 hover:no-underline no-underline">
                  <span className="font-medium text-lg">{list.activity}</span>
                </AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditList(list);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <AccordionContent className="p-0">
                <div className="p-4">
                  {list.description && (
                    <p className="text-gray-600 mb-4">{list.description}</p>
                  )}
                  <PackingItemList listId={list.id} />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      
      {/* Add/Edit List Modal */}
      <AddPackingListModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        list={editingList}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Packing List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this packing list? This will also delete all items in the list. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteList}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}