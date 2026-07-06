"use client";
import { Button } from "@/components/ui/button";
import { api, tokenStorage } from "@/lib/api";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const refreshToken = tokenStorage.getRefresh();
    try {
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } finally {
      tokenStorage.clear();
      router.push("/login");
    }
  };

  return <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>;
}
