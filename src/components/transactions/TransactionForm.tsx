"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategoriesQuery } from "@/hooks/useCategories";
import type { Transaction } from "@/types";

const schema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive(),
  categoryId: z.string().min(1),
  date: z.string().min(1),
  note: z.string().optional(),
  tags: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringRule: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<Transaction>;
  onSubmit: (values: FormValues) => void;
  isSubmitting?: boolean;
}

export function TransactionForm({ defaultValues, onSubmit, isSubmitting }: Props) {
  const { data: categories } = useCategoriesQuery();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues as FormValues,
  });

  const isRecurring = watch("isRecurring");

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const tags = values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
        onSubmit({ ...values, tags } as any);
      })}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="type">Type</Label>
        <select id="type" {...register("type")} className="w-full border rounded-md h-9 px-2">
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount")} />
        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <select id="categoryId" {...register("categoryId")} className="w-full border rounded-md h-9 px-2">
          <option value="">Select category</option>
          {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input id="tags" {...register("tags")} />
      </div>
      <div>
        <Label htmlFor="note">Note</Label>
        <Input id="note" {...register("note")} />
      </div>
      <div className="flex items-center gap-2">
        <input id="isRecurring" type="checkbox" {...register("isRecurring")} />
        <Label htmlFor="isRecurring">Recurring</Label>
      </div>
      {isRecurring && (
        <div>
          <Label htmlFor="recurringRule">Recurring Rule</Label>
          <select id="recurringRule" {...register("recurringRule")} className="w-full border rounded-md h-9 px-2">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
      )}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Save Transaction"}
      </Button>
    </form>
  );
}
