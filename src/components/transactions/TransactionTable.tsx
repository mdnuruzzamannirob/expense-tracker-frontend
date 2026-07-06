"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onEdit, onDelete }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id}>
            <TableCell>
              {mounted ? format(new Date(t.date), "MM/dd/yyyy") : ""}
            </TableCell>
            <TableCell>{t.category?.name ?? t.categoryId}</TableCell>
            <TableCell><Badge variant={t.type === "INCOME" ? "default" : "destructive"}>{t.type}</Badge></TableCell>
            <TableCell className="text-right">{t.amount.toFixed(2)}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(t)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
