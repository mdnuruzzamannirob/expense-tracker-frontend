"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/hooks/useCategories";
import { extractErrorMessage } from "@/lib/api";
import { Plus, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const [name, setName] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    createMutation.mutate(
      { name: name.trim(), type },
      {
        onSuccess: () => {
          toast.success("Category created");
          setName("");
        },
        onError: (error) => {
          toast.error(extractErrorMessage(error, "Could not create category"));
        },
      },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(id, {
      onError: (error) => {
        toast.error(extractErrorMessage(error, "Could not delete category"));
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-2 max-w-2xl">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label htmlFor="newCategoryName">Name</Label>
              <Input
                id="newCategoryName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New category"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              />
            </div>
            <div className="space-y-1.5 w-[180px]">
              <Label htmlFor="newCategoryType">Type</Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  setType(value as "INCOME" | "EXPENSE")
                }
              >
                <SelectTrigger id="newCategoryType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    onClick={handleCreate}
                    disabled={createMutation.isPending || !name.trim()}
                    className="gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    {createMutation.isPending ? "Adding..." : "Add"}
                  </Button>
                }
              />
              <TooltipContent>Create category</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="size-8" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex justify-between items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.name}</p>
                  <Badge
                    variant={c.type === "INCOME" ? "default" : "destructive"}
                    className="mt-1"
                  >
                    {c.type}
                  </Badge>
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c.id, c.name)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <TooltipContent>Delete category</TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Tag className="h-10 w-10 mb-3" />
            <p className="font-medium">No categories yet</p>
            <p className="text-sm">Create your first category above to start organizing transactions.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
