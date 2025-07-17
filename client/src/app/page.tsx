"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth"; // Your custom auth hook

export default function HomePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If we have a token and user, they are logged in.
    if (token) {
      // Redirect to the protected dashboard
      router.replace("/dashboard");
    } else {
      // If no token, send them to the login page
      router.replace("/login");
    }
  }, [user, token, router]);

  // Render a loading state while the redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
