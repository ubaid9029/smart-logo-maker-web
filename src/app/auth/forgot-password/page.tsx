import Image from "next/image";
import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";

interface Props {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function ForgotPassword({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fdfbfb] via-[#f6f7fb] to-[#eef2ff] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-lg backdrop-blur-xl">
        <div className="mb-5 flex justify-center">
          <Image src="/logos/logo3.svg" alt="Logo" width={72} height={72} priority />
        </div>

        <div className="mb-5 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Enter your email and we&apos;ll send you a password reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-medium text-red-600">
            {decodeURIComponent(error)}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-[12px] font-medium text-green-600">
            {decodeURIComponent(message)}
          </div>
        )}

        <form action={requestPasswordReset} className="space-y-4">
          <div>
            <label className="text-[11.5px] font-semibold text-gray-700">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-linear-to-r from-orange-500 to-pink-500 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            Send Reset Link
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] text-gray-900">
          Remember your password?{" "}
          <Link href="/auth/signin" className="font-semibold text-pink-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
