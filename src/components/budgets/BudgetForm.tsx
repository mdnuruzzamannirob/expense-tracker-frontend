"use client";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const { register, handleSubmit, control, formState: { errors } } = useForm<BudgetFormValues>({
    defaultValues: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      alertThreshold: 80,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="categoryId">Category</Label>
        <Controller
          control={control}
          name="categoryId"
          rules={{ required: "Please select a category" }}
          render={({ field }) => (
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger id="categoryId" className="w-full" aria-invalid={!!errors.categoryId}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-sm text-red-500">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="limit">Monthly Limit</Label>
        <Input
          id="limit"
          type="number"
          step="0.01"
          inputMode="decimal"
          {...register("limit", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
        <Input
          id="alertThreshold"
          type="number"
          min={0}
          max={100}
          {...register("alertThreshold", { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="month">Month</Label>
          <Input
            id="month"
            type="number"
            min={1}
            max={12}
            {...register("month", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            {...register("year", { valueAsNumber: true })}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Save Budget"}
      </Button>
    </form>
  );
}
