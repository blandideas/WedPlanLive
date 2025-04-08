import { formatCurrency, calculatePercentage } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardProps {
  budget: any;
  tasks: any[];
  expenses: any[];
}

export default function Dashboard({ budget, tasks = [], expenses = [] }: DashboardProps) {
  // Calculate budget stats
  const totalBudget = budget?.amount || 0;
  const spentAmount = expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
  const remainingAmount = totalBudget - spentAmount;
  const budgetUsedPercentage = calculatePercentage(spentAmount, totalBudget);
  
  // Calculate task stats
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((task: any) => task.status === "Completed").length || 0;
  const pendingTasks = totalTasks - completedTasks;
  const tasksCompletedPercentage = calculatePercentage(completedTasks, totalTasks);
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Budget Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-2">Budget Overview</h3>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Total Budget</span>
                <span className="font-medium">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Spent So Far</span>
                <span className="font-medium">{formatCurrency(spentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className={`font-medium ${remainingAmount >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div 
                className={`h-2 rounded-full ${budgetUsedPercentage > 100 ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${Math.min(100, budgetUsedPercentage)}%` }}
              ></div>
            </div>
            <div className="text-xs text-right text-gray-500">
              {budgetUsedPercentage}% of budget used
            </div>
          </CardContent>
        </Card>
        
        {/* Task Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-2">Tasks Overview</h3>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Total Tasks</span>
                <span className="font-medium">{totalTasks}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-medium">{completedTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-medium text-accent">{pendingTasks}</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div 
                className="bg-accent h-2 rounded-full" 
                style={{ width: `${tasksCompletedPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-right text-gray-500">
              {tasksCompletedPercentage}% of tasks completed
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
