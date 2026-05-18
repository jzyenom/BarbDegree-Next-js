"use client";

import { Lock } from "lucide-react";
import AuthInput from "@/components/AuthInput";
import { useState } from "react";

interface PasswordSettingsProps {
  hasPassword: boolean;
  onSuccess?: () => void;
}

export default function PasswordSettings({ hasPassword, onSuccess }: PasswordSettingsProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.trim().length < 8 || newPassword.trim().length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    if (hasPassword && currentPassword.trim().length === 0) {
      setError("Enter your current password to update it.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Unable to save password.");
        return;
      }

      setSuccess(json.message || "Password saved successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess?.();
    } catch (err) {
      setError("Unable to save password. Please try again.");
      console.error("[password] Failed to update password", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-lg border border-[#e6e0db] p-4">
      <div className="mb-3">
        <h2 className="text-base font-bold">
          {hasPassword ? "Change Password" : "Add a Password"}
        </h2>
        <p className="text-sm text-[#8a7560]">
          {hasPassword
            ? "Update your account password for email sign-in."
            : "Add a password so you can sign in with email/password in addition to Google."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {hasPassword ? (
          <AuthInput
            type="password"
            placeholder="Current password"
            icon={Lock}
            value={currentPassword}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setCurrentPassword(event.target.value)
            }
          />
        ) : null}

        <AuthInput
          type="password"
          placeholder={hasPassword ? "New password" : "Create a new password"}
          icon={Lock}
          value={newPassword}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setNewPassword(event.target.value)
          }
        />

        <AuthInput
          type="password"
          placeholder="Confirm password"
          icon={Lock}
          value={confirmPassword}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(event.target.value)
          }
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <button
          disabled={isSaving}
          type="submit"
          className="h-12 w-full rounded-xl bg-[#f96b06] text-base font-bold tracking-wide text-[#fcfaf8] shadow-md transition-all hover:bg-[#e66105] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : hasPassword ? "Update password" : "Add password"}
        </button>
      </form>
    </section>
  );
}
