import Image from "next/image";
import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import AuthShell from "@/components/auth/AuthShell";
import AuthNextField from "@/components/auth/AuthNextField";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

interface Props {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}

function normalizeNextPath(value?: string) {
  if (typeof value !== "string") {
    return "/";
  }

  const nextValue = value.trim();
  if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return "/";
  }

  return nextValue;
}

export default async function Signup({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;
  const next = normalizeNextPath(params?.next);

  return (
    <AuthShell alignment="right" imagePosition="left">
      <div className="z-10 w-full max-w-md rounded-3xl bg-white/85 px-6 py-5 shadow-[0_18px_55px_rgba(0,0,0,0.14)] backdrop-blur-xl md:mr-16 lg:mr-30">
        <div className="mb-3 flex justify-center">
          <Image src="/logos/logo3.svg" alt="Logo" width={68} height={68} priority />
        </div>

        <div className="mb-3 text-center">
          <h3 className="text-[20px] font-extrabold text-gray-900">
            Create account
          </h3>
          <p className="mt-0.5 text-[13px] font-medium text-gray-900">
            Get started in a few seconds
          </p>
        </div>

        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-medium text-red-600">
            {decodeURIComponent(error)}
          </div>
        )}
        {message && (
          <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-[12px] font-medium text-green-600">
            {decodeURIComponent(message)}
          </div>
        )}

        <form action={signUp} className="space-y-2.5">
          <AuthNextField fallbackNext={next} />

          <div>
            <label className="text-[11.5px] font-semibold text-gray-700">Full Name</label>
            <input
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
              className="mt-1 h-9 w-full rounded-xl border border-gray-300 px-3.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="text-[11.5px] font-semibold text-gray-700">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="mt-1 h-9 w-full rounded-xl border border-gray-300 px-3.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="text-[11.5px] font-semibold text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              placeholder="********"
              required
              minLength={6}
              className="mt-1 h-9 w-full rounded-xl border border-gray-300 px-3.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="mt-3 flex items-start gap-2 text-[11.5px] text-gray-900">
            <input type="checkbox" required className="mt-0.5 accent-pink-500" />
            <span>
              I agree to the{" "}
              <span className="cursor-pointer font-semibold text-pink-600 hover:underline">
                Terms &amp; Policy
              </span>
            </span>
          </div>

          <button
            type="submit"
            className="mt-3 h-12 w-full rounded-xl bg-linear-to-r from-orange-500 to-pink-500 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            Create Account
          </button>
        </form>

        <div className="my-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-[10.5px] font-medium text-gray-900">OR</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <GoogleAuthButton fallbackNext={next} returnToAuthPath="/auth/signup" />

        <p className="mt-3 text-center text-[11.5px] text-gray-900">
          Already have an account?{" "}
          <Link href={`/auth/signin?next=${encodeURIComponent(next)}`} className="font-semibold text-pink-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
