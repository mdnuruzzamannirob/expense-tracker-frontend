"use client"
import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, extractErrorMessage } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { ApiResponse, AuthData } from "@/types"
import { RegisterFormValues, registerSchema } from "@/lib/schema"

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null)
    try {
      const { data } = await api.post<ApiResponse<AuthData>>("/auth/register", values)
      setUser(data.data.user)
      toast.success("Account created")
      router.push("/")
    } catch (error) {
      const message = extractErrorMessage(
        error,
        "We couldn't create your account. Please check your details and try again.",
      )
      setSubmitError(message)
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password (min 8 chars)</Label>
          <Input
            id="password"
            type="password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        {submitError && (
          <p
            role="alert"
            className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-2"
          >
            {submitError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create account"}
        </Button>
      </form>
      <p className="text-sm text-center">
        Already have an account?{" "}
        <Link href="/login" className="hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
