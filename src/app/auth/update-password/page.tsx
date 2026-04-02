"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { createClient } from "@/lib/supabaseClient";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const boot = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(sessionError.message);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setError("Password reset link is invalid or expired. Please request a new one.");
        return;
      }

      setIsReady(true);
    };

    void boot();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("Password updated successfully. Redirecting to sign in...");
    setIsSubmitting(false);

    window.history.replaceState({}, document.title, window.location.pathname);
    router.replace("/auth/signin?message=Password+updated+successfully.+Please+sign+in.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fdfbfb] via-[#f6f7fb] to-[#eef2ff] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-lg backdrop-blur-xl">
        <div className="mb-5 flex justify-center">
          <Image src="/logos/logo3.svg" alt="Logo" width={72} height={72} priority />
        </div>

        <div className="mb-5 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">Set New Password</h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Choose a new password for your account.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-medium text-red-600">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-[12px] font-medium text-green-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11.5px] font-semibold text-gray-700">New Password</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              name="password"
              type="password"
              placeholder="Enter new password"
              required
              minLength={6}
              disabled={!isReady || isSubmitting}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-[11.5px] font-semibold text-gray-700">Confirm Password</label>
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              name="confirmPassword"
              type="password"
              placeholder="Repeat new password"
              required
              minLength={6}
              disabled={!isReady || isSubmitting}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={!isReady || isSubmitting}
            className="w-full rounded-xl bg-linear-to-r from-orange-500 to-pink-500 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] text-gray-900">
          Back to{" "}
          <Link href="/auth/signin" className="font-semibold text-pink-600 hover:underline">
            sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
