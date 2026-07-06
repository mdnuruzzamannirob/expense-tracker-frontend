"use client";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Suspense } from "react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ password: string }>();

  const onSubmit = async (values: { password: string }) => {
    try {
      await api.post("/auth/reset-password", { token, password: values.password });
      toast.success("Password reset successfully");
      router.push("/login");
    } catch {
      toast.error("Reset link invalid or expired");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><Label htmlFor="password">New password (min 8 chars)</Label><Input id="password" type="password" {...register("password")} /></div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
