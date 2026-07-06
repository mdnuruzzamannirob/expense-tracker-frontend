"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import { useBudgetsQuery, useSetBudgetMutation } from "@/hooks/useBudgets";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetsPage() {
  const now = new Date();
  const { data: budgets, isLoading } = useBudgetsQuery(now.getMonth() + 1, now.getFullYear());
  const setBudgetMutation = useSetBudgetMutation();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>Set Budget</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Set Monthly Budget</DialogTitle></DialogHeader>
            <BudgetForm
              isSubmitting={setBudgetMutation.isPending}
              onSubmit={(values) => { setBudgetMutation.mutate(values); setOpen(false); }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <Skeleton className="h-64 w-full" /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(budgets ?? []).map((b) => <BudgetCard key={b.id} budget={b} />)}
        </div>
      )}
    </div>
  );
}
