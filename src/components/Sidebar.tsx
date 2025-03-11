"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Film, Newspaper, LogOut } from "lucide-react";
import { lusitana } from "@/utils/fonts";
import { useAuth } from "@/context/AuthContext";
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOutUser } = useAuth();

  const navItems = [
    { name: "Home", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Leads", path: "/dashboard/leads", icon: <Users size={20} /> },
    { name: "Cinemas", path: "/dashboard/cinemas", icon: <Film size={20} /> },
    { name: "News", path: "/dashboard/news", icon: <Newspaper size={20} /> },
  ];

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push("/"); // Redirect to home (or sign‑in) page after sign out.
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="w-64 h-screen flex flex-col border-r shadow-md">
      <div className="mb-2 flex h-20 items-end justify-start bg-blue-600 p-4 md:h-40 m-2 rounded-lg">
        <div className="w-32 text-white md:w-40 -ml-2">
          <div className={`${lusitana.className} flex flex-row items-center leading-none text-white`}>
            <Image src="/PT Logo.png" alt="PictureTime Logo" width={60} height={60}/>
            <p className="text-[28px]">PictureTime</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 mt-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg mx-2 transition ${
              pathname === item.path
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={handleSignOut}
        className="flex items-center space-x-3 px-4 py-3 mx-2 mb-4 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
      >
        <LogOut size={20} />
        <span className="font-medium">Sign Out</span>
      </button>
    </aside>
  );
}
