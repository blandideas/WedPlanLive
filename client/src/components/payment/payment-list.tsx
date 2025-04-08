import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical, Plus } from "lucide-react";
import AddPaymentModal from "./add-payment-modal";

interface Payment {
  id: number;
  vendorId: number;
  amount: number;
  date: string;
  description: string;
  isPaid: boolean;
}

interface Vendor {
  id: number;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
}

export default function PaymentList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("all");

  // Fetch vendors for dropdown
  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  // Fetch payments with vendor filter if applied
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: [
      selectedVendorId === "all"
        ? "/api/payments"
        : `/api/vendors/${selectedVendorId}/payments`,
    ],
  });

  // Toggle payment status mutation
  const togglePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, isPaid }: { id: number; isPaid: boolean }) => {
      return apiRequest(`/api/payments/${id}`, {
        method: "PATCH",
        data: { isPaid },
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
        description: "The payment status has been updated.",
      });
    },
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/payments/${id}`, {
        method: "DELETE",
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
        title: "Payment deleted",
        description: "The payment has been deleted.",
      });
    },
  });

  // Helper to find vendor name by id
  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  // Handle opening the edit modal
  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsAddPaymentOpen(true);
  };

  // Handle payment deletion
  const handleDeletePayment = (id: number) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      deletePaymentMutation.mutate(id);
    }
  };

  // Handle payment status toggle
  const handleTogglePaymentStatus = (id: number, currentStatus: boolean) => {
    togglePaymentStatusMutation.mutate({
      id,
      isPaid: !currentStatus,
    });
  };

  // Handle filter change
  const handleVendorFilterChange = (value: string) => {
    setSelectedVendorId(value);
  };

  // Calculate totals
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = payments
    .filter((payment) => payment.isPaid)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payment Tracker</h2>
          <p className="text-muted-foreground">
            Track payments to vendors for your wedding
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedVendorId}
            onValueChange={handleVendorFilterChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => {
            setSelectedPayment(null);
            setIsAddPaymentOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
        </div>
      </div>

      {/* Payment summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">Total Payments</p>
              <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">Paid</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">Unpaid</p>
              <p className="text-3xl font-bold text-destructive">
                {formatCurrency(unpaidAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No payments found. Add your first payment!
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Checkbox
                        checked={payment.isPaid}
                        onCheckedChange={() => 
                          handleTogglePaymentStatus(payment.id, payment.isPaid)
                        }
                      />
                    </TableCell>
                    <TableCell>{getVendorName(payment.vendorId)}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        {formatCurrency(payment.amount)}
                        <Badge 
                          variant={payment.isPaid ? "success" : "destructive"}
                          className="mt-1"
                        >
                          {payment.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
        payment={selectedPayment}
        vendors={vendors}
      />
    </div>
  );
}