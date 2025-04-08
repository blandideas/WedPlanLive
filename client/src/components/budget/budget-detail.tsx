import { formatCurrency, calculatePercentage, groupExpensesByCategory } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetDetailProps {
  budget: any;
  expenses: any[];
}

export default function BudgetDetail({ budget, expenses = [] }: BudgetDetailProps) {
  // Calculate budget stats
  const totalBudget = budget?.amount || 0;
  const spentAmount = expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
  const remainingAmount = totalBudget - spentAmount;
  const budgetUsedPercentage = calculatePercentage(spentAmount, totalBudget);
  
  // Group expenses by category
  const expenseSummary = groupExpensesByCategory(expenses);
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="font-medium text-lg">Budget Summary</h3>
            <p className="text-sm text-gray-500">Track your wedding expenses</p>
          </div>
          <div className="mt-2 md:mt-0">
            <div className="flex flex-col md:items-end">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Total Budget:</span>
                <span className="font-bold text-lg">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Remaining:</span>
                <span className={`font-bold text-lg ${remainingAmount >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Progress 
          value={Math.min(100, budgetUsedPercentage)} 
          className="h-3 mb-2" 
          indicatorClassName={budgetUsedPercentage > 100 ? "bg-destructive" : "bg-primary"} 
        />
        <div className="text-sm text-right text-gray-500 mb-4">
          {budgetUsedPercentage}% of budget used ({formatCurrency(spentAmount)} of {formatCurrency(totalBudget)})
        </div>
        
        {expenseSummary.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {expenseSummary.map((category, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-500 mb-1">{category.category}</div>
                <div className="font-medium">{formatCurrency(category.amount)}</div>
                <div className="text-xs text-gray-500">{category.percentage}% of total</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            No expenses added yet. Start by adding your wedding expenses.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
