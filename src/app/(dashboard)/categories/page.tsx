"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } from "@/hooks/useCategories";

export default function CategoriesPage() {
  const { data: categories } = useCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const [name, setName] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <div className="flex gap-2 max-w-md">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" />
        <select value={type} onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")} className="border rounded-md h-9 px-2">
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <Button onClick={() => createMutation.mutate({ name, type })} disabled={!name}>Add</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(categories ?? []).map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p>{c.name}</p>
                <Badge variant={c.type === "INCOME" ? "default" : "destructive"} className="mt-1">{c.type}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(c.id)}>Delete</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
