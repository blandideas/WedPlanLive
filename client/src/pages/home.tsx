import { useState } from "react";
import Dashboard from "@/components/dashboard";
import TaskList from "@/components/tasks/task-list";
import VendorList from "@/components/vendors/vendor-list";
import BudgetDetail from "@/components/budget/budget-detail";
import ExpenseList from "@/components/budget/expense-list";
import PackingList from "@/components/lists/packing-list";
import AddVendorModal from "@/components/vendors/add-vendor-modal";
import SetBudgetModal from "@/components/budget/set-budget-modal";
import AddExpenseModal from "@/components/budget/add-expense-modal";
import { useQuery } from "@tanstack/react-query";

type Tab = "tasks" | "vendors" | "budget" | "lists";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [isSetBudgetModalOpen, setIsSetBudgetModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  
  // Get budget
  const { data: budget } = useQuery<any>({
    queryKey: ['/api/budget'],
  });
  
  // Get expenses
  const { data: expenses = [] } = useQuery<any[]>({
    queryKey: ['/api/expenses'],
  });
  
  // Get tasks
  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ['/api/tasks'],
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Wedding Planner</h1>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard */}
        <Dashboard budget={budget} tasks={tasks} expenses={expenses} />
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`px-1 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "tasks"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("tasks")}
              >
                Tasks
              </button>
              <button
                className={`px-1 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "vendors"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("vendors")}
              >
                Vendors
              </button>
              <button
                className={`px-1 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "budget"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("budget")}
              >
                Budget
              </button>
              <button
                className={`px-1 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "lists"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("lists")}
              >
                Lists
              </button>
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === "tasks" && (
          <div>
            <TaskList />
          </div>
        )}
        
        {activeTab === "vendors" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Vendors</h2>
              <button
                className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                onClick={() => setIsAddVendorModalOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Vendor
              </button>
            </div>
            <VendorList />
            <AddVendorModal isOpen={isAddVendorModalOpen} onClose={() => setIsAddVendorModalOpen(false)} />
          </div>
        )}
        
        {activeTab === "budget" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Budget</h2>
              <div className="flex space-x-2">
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => setIsSetBudgetModalOpen(true)}
                >
                  Set Budget
                </button>
                <button
                  className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  onClick={() => setIsAddExpenseModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Expense
                </button>
              </div>
            </div>
            <BudgetDetail budget={budget} expenses={expenses} />
            <ExpenseList />
            <SetBudgetModal isOpen={isSetBudgetModalOpen} onClose={() => setIsSetBudgetModalOpen(false)} />
            <AddExpenseModal isOpen={isAddExpenseModalOpen} onClose={() => setIsAddExpenseModalOpen(false)} />
          </div>
        )}
        
        {activeTab === "lists" && (
          <div>
            <PackingList />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">Wedding Planner App &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
