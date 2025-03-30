import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import AddVendorModal from "./add-vendor-modal";
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
import { Pencil, Trash2 } from "lucide-react";

export default function VendorList() {
  const { toast } = useToast();
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch vendors
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['/api/vendors'],
  });
  
  // Delete vendor mutation
  const deleteVendorMutation = useMutation({
    mutationFn: async (vendorId: number) => {
      await apiRequest('DELETE', `/api/vendors/${vendorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({ title: "Vendor deleted", description: "Vendor has been deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "There was an error deleting the vendor", 
        variant: "destructive" 
      });
    }
  });
  
  const handleEditClick = (vendor: any) => {
    setEditingVendor(vendor);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (vendorId: number) => {
    setVendorToDelete(vendorId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (vendorToDelete !== null) {
      deleteVendorMutation.mutate(vendorToDelete);
      setIsDeleteDialogOpen(false);
      setVendorToDelete(null);
    }
  };
  
  return (
    <>
      {isLoading ? (
        <div className="p-8 text-center">Loading vendors...</div>
      ) : vendors.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
          No vendors yet. Add your first wedding vendor!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((vendor: any) => (
            <div key={vendor.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between mb-2">
                <h3 className="font-medium text-lg">{vendor.name}</h3>
                <div className="flex space-x-2">
                  <button 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => handleEditClick(vendor)}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => handleDeleteClick(vendor.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full mb-3">
                {vendor.category}
              </span>
              {vendor.contact && (
                <div className="text-sm text-gray-500 mb-1">
                  <span className="font-medium">Contact:</span> <span>{vendor.contact}</span>
                </div>
              )}
              {vendor.phone && (
                <div className="text-sm text-gray-500 mb-1">
                  <span className="font-medium">Phone:</span> <span>{vendor.phone}</span>
                </div>
              )}
              {vendor.email && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Email:</span> <span>{vendor.email}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Edit Vendor Modal */}
      {editingVendor && (
        <AddVendorModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          vendor={editingVendor}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vendor? This action cannot be undone.
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
    </>
  );
}
