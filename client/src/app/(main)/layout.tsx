// This layout will wrap all pages inside the (main) group.
"use client";

import Navbar from "@/components/Navbar"; // Assuming Navbar is in components

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
