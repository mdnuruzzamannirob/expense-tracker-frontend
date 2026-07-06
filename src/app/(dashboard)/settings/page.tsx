"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { register: registerProfile, handleSubmit: handleProfileSubmit } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset } = useForm();

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <form
        onSubmit={handleProfileSubmit(async (values) => {
          await api.patch("/users/me", values);
          toast.success("Profile updated");
        })}
        className="space-y-4"
      >
        <h2 className="font-medium">Profile</h2>
        <div><Label htmlFor="name">Name</Label><Input id="name" {...registerProfile("name")} /></div>
        <div><Label htmlFor="currency">Currency</Label><Input id="currency" {...registerProfile("currency")} /></div>
        <Button type="submit">Save Profile</Button>
      </form>

      <form
        onSubmit={handlePasswordSubmit(async (values) => {
          try {
            await api.patch("/users/me/password", values);
            toast.success("Password changed");
            reset();
          } catch {
            toast.error("Could not change password");
          }
        })}
        className="space-y-4"
      >
        <h2 className="font-medium">Change Password</h2>
        <div><Label htmlFor="currentPassword">Current Password</Label><Input id="currentPassword" type="password" {...registerPassword("currentPassword")} /></div>
        <div><Label htmlFor="newPassword">New Password (min 8 chars)</Label><Input id="newPassword" type="password" {...registerPassword("newPassword")} /></div>
        <Button type="submit">Change Password</Button>
      </form>
    </div>
  );
}
