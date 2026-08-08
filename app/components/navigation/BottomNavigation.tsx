"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  Music2,
  Mail,
  Images,
  Settings,
} from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",

        bottom:
          "max(20px, env(safe-area-inset-bottom))",

        left: "50%",

        transform: "translateX(-50%)",

        width:
          "min(620px, calc(100vw - 32px))",

        background:
          "rgba(255,255,255,.72)",

        backdropFilter:
          "blur(30px)",

        WebkitBackdropFilter:
          "blur(30px)",

        borderRadius: 9999,

        border:
          "1px solid rgba(255,255,255,.45)",

        boxShadow:
          "0 15px 45px rgba(0,0,0,.08)",

        display: "flex",

        justifyContent:
          "space-around",

        alignItems: "center",

        padding: "10px 12px",

        zIndex: 1000,
      }}
    >
      {/* HOME */}

      <Link
        href="/"
        style={{
          textDecoration: "none",
        }}
      >
        <NavButton
          active={pathname === "/"}
        >
          <House size={22} />
        </NavButton>
      </Link>

      {/* SOUNDTRACK */}

      <Link
        href="/soundtrack"
        style={{
          textDecoration: "none",
        }}
      >
        <NavButton
          active={pathname.startsWith(
            "/soundtrack"
          )}
        >
          <Music2 size={22} />
        </NavButton>
      </Link>

      {/* LETTER */}

      <Link
        href="/letter"
        style={{
          textDecoration: "none",
        }}
      >
        <NavButton
          active={pathname === "/letter"}
        >
          <Mail size={22} />
        </NavButton>
      </Link>

      {/* MEMORIES */}

      <Link
        href="/memories"
        style={{
          textDecoration: "none",
        }}
      >
        <NavButton
          active={pathname.startsWith(
            "/memories"
          )}
        >
          <Images size={22} />
        </NavButton>
      </Link>

      {/* SETTINGS */}

      <Link
        href="/settings"
        style={{
          textDecoration: "none",
        }}
      >
        <NavButton
          active={pathname.startsWith(
            "/settings"
          )}
        >
          <Settings size={22} />
        </NavButton>
      </Link>

      {/* ADMIN */}
    </nav>
  );
}

function NavButton({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      style={{
        width: 52,

        height: 52,

        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        borderRadius: "50%",

        background: active
          ? "#456C57"
          : "transparent",

        color: active
          ? "white"
          : "#5B7463",

        cursor: "pointer",

        transition:
          "all .28s cubic-bezier(.22,1,.36,1)",

        transform: active
          ? "translateY(-2px) scale(1.06)"
          : "translateY(0px) scale(1)",

        boxShadow: active
          ? "0 8px 20px rgba(69,108,87,.30)"
          : "none",
      }}
    >
      {children}
    </div>
  );
}