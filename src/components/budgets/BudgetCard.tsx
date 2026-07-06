import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Budget } from "@/types";

export function BudgetCard({ budget }: { budget: Budget }) {
  const spent = budget.spent ?? 0;
  const percent = Math.min((spent / budget.limit) * 100, 100);
  const isOver = spent > budget.limit;
  const isNear = percent >= budget.alertThreshold && !isOver;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{budget.category.name ?? budget.categoryId}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm mb-2">
          <span>{spent.toFixed(2)}</span>
          <span className="text-muted-foreground">/ {budget.limit.toFixed(2)}</span>
        </div>
        <Progress value={percent} className={cn(isOver && "[&>div]:bg-red-500", isNear && "[&>div]:bg-yellow-500")} />
      </CardContent>
    </Card>
  );
}
