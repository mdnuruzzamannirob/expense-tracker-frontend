"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoalCard } from "@/components/savings/GoalCard";
import { ContributeDialog } from "@/components/savings/ContributeDialog";
import { useSavingsGoalsQuery, useContributeToGoalMutation, useDeleteGoalMutation, useCreateGoalMutation } from "@/hooks/useSavingsGoals";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";

interface GoalFormValues { title: string; targetAmount: number; deadline: string; }

export default function SavingsGoalsPage() {
  const { data: goals, isLoading } = useSavingsGoalsQuery();
  const contributeMutation = useContributeToGoalMutation();
  const deleteMutation = useDeleteGoalMutation();
  const createMutation = useCreateGoalMutation();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<GoalFormValues>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Savings Goals</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>New Goal</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Savings Goal</DialogTitle></DialogHeader>
            <form
              onSubmit={handleSubmit((values) => {
                createMutation.mutate(values);
                reset();
                setOpen(false);
              })}
              className="space-y-4"
            >
              <div><Label htmlFor="title">Title</Label><Input id="title" {...register("title")} /></div>
              <div><Label htmlFor="targetAmount">Target Amount</Label><Input id="targetAmount" type="number" step="0.01" {...register("targetAmount")} /></div>
              <div><Label htmlFor="deadline">Deadline</Label><Input id="deadline" type="date" {...register("deadline")} /></div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>Create Goal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <Skeleton className="h-64 w-full" /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(goals ?? []).map((g) => (
            <div key={g.id} className="space-y-2">
              <GoalCard goal={g} />
              <div className="flex gap-2">
                <ContributeDialog goalId={g.id} onContribute={(id, amount) => contributeMutation.mutate({ id, amount })} />
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(g.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
