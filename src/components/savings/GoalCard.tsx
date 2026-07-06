import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SavingsGoal } from "@/types";
import { differenceInDays } from "date-fns";

export function GoalCard({ goal }: { goal: SavingsGoal }) {
  const percent = goal.progressPercent ?? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const daysLeft = differenceInDays(new Date(goal.deadline), new Date());

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{goal.title}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm mb-2">
          <span>{goal.currentAmount.toFixed(2)}</span>
          <span className="text-muted-foreground">/ {goal.targetAmount.toFixed(2)}</span>
        </div>
        <Progress value={percent} />
        <p className="text-xs text-muted-foreground mt-2">
          {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
        </p>
      </CardContent>
    </Card>
  );
}
