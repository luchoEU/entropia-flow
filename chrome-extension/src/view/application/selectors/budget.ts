import { BudgetState } from "../state/budget";

export const getBudget = (state: any): BudgetState => state.budget

export const getBudgetPendingCount = (state: any): number => {
    const budget: BudgetState = state.budget
    if (!budget?.list?.items) return 0
    return budget.list.items.reduce((sum, item) => sum + (item.pendingLines?.length || 0), 0)
}
