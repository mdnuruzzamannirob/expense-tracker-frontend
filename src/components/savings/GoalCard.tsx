"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SavingsGoal } from "@/types";
import { differenceInDays } from "date-fns";
import { useEffect, useState } from "react";

export function GoalCard({ goal }: { goal: SavingsGoal }) {
  const [mounted, setMounted] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    setMounted(true);
    setDaysLeft(differenceInDays(new Date(goal.deadline), new Date()));
  }, [goal.deadline]);

  const percent = goal.progressPercent ?? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

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
          {mounted ? (daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed") : ""}
        </p>
      </CardContent>
    </Card>
  );
}
