"use client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SavingsGoal } from "@/types";
import { differenceInDays } from "date-fns";
import { useEffect, useState } from "react";
import { ContributeDialog } from "./ContributeDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GoalCardProps {
  goal: SavingsGoal;
  onContribute?: (id: string, amount: number) => void;
  onDelete?: (id: string, title: string) => void;
  isDeleting?: boolean;
}

export function GoalCard({ goal, onContribute, onDelete, isDeleting }: GoalCardProps) {
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
      <CardFooter className="flex gap-2">
        {onContribute && (
          <ContributeDialog
            goalId={goal.id}
            onContribute={onContribute}
          />
        )}
        {onDelete && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(goal.id, goal.title)}
                  disabled={isDeleting}
                  aria-label={`Delete ${goal.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
            <TooltipContent>Delete goal</TooltipContent>
          </Tooltip>
        )}
      </CardFooter>
    </Card>
  );
}
