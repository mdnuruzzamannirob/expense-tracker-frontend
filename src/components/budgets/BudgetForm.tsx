"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategoriesQuery } from "@/hooks/useCategories";

interface BudgetFormValues {
  categoryId: string;
  limit: number;
  alertThreshold: number;
  month: number;
  year: number;
}

interface Props {
  onSubmit: (values: BudgetFormValues) => void;
  defaultValues?: Partial<BudgetFormValues>;
  isSubmitting?: boolean;
}

export function BudgetForm({ onSubmit, defaultValues, isSubmitting }: Props) {
  const { data: categories } = useCategoriesQuery("EXPENSE");
  const now = new Date();
  const { register, handleSubmit } = useForm<BudgetFormValues>({
    defaultValues: { month: now.getMonth() + 1, year: now.getFullYear(), alertThreshold: 80, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <select id="categoryId" {...register("categoryId")} className="w-full border rounded-md h-9 px-2">
          <option value="">Select category</option>
          {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="limit">Monthly Limit</Label>
        <Input id="limit" type="number" step="0.01" {...register("limit")} />
      </div>
      <div>
        <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
        <Input id="alertThreshold" type="number" {...register("alertThreshold")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label htmlFor="month">Month</Label><Input id="month" type="number" min={1} max={12} {...register("month")} /></div>
        <div><Label htmlFor="year">Year</Label><Input id="year" type="number" {...register("year")} /></div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Save Budget"}
      </Button>
    </form>
  );
}
