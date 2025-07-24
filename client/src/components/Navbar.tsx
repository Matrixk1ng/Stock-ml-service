// --- /components/Navbar.tsx (UPDATED) ---
// This component now has the necessary classes to stick to the top.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Search from "./Search";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "News", href: "/news" },
  { name: "Screener", href: "/screener" },
  { name: "Trends", href: "/trends" },
  { name: "Portfolio", href: "portfolio" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    // --- FIX IS HERE ---
    // Added `sticky top-0 z-50` to the <nav> element.
    // `sticky`: Enables sticky positioning.
    // `top-0`: Tells it to stick to the top of the viewport.
    // `z-50`: Ensures it renders on top of other page content.
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <span className="text-xl font-bold">Stock Analysis</span>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === item.href
                  ? "border-indigo-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <Search />
      </div>
    </nav>
  );
}
