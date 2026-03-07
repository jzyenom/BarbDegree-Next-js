"use client";
import { SessionProvider } from "next-auth/react";

/**
 * AUTO-FUNCTION-COMMENT: SessionWrapper
 * Purpose: Handles session wrapper.
 * Line-by-line:
 * 1. Executes `return <SessionProvider>{children}</SessionProvider>;`.
 */
export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
