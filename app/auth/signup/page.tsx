import Image from "next/image";
import Link from "next/link";
import { signUp, signInWithGoogle } from "@/app/auth/actions";

interface Props {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function Signup({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-linear-to-br from-[#fdfbfb] via-[#f6f7fb] to-[#eef2ff] px-4 md:px-12">

      {/* RIGHT SIDE (ILLUSTRATION) */}
      <div className="hidden md:flex flex-1 relative justify-center items-center h-125">

        <div className="absolute w-96 h-96 bg-purple-400/50 rounded-full blur-3xl -top-16 -right-16 animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-pink-400/40 rounded-full blur-2xl -bottom-16 -left-12 animate-pulse"></div>
        <div className="absolute w-80 h-80 bg-blue-400/30 rounded-full blur-2xl -bottom-10 right-10 animate-pulse"></div>

        <div className="relative z-10 w-72 h-72">
          <Image
            src="/logo3.svg"
            alt="illustration"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="absolute w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>


      {/* LEFT SIDE (FORM) */}
      <div className="w-full max-w-md bg-white/85 backdrop-blur-xl rounded-3xl shadow-[0_18px_55px_rgba(0,0,0,0.14)] px-6 py-5 z-10">

        <div className="flex justify-center mb-3">
          <Image src="/logo3.svg" alt="Logo" width={68} height={68} priority />
        </div>

        <div className="text-center mb-3">
          <h3 className="text-[20px] font-extrabold text-gray-900">
            Create account
          </h3>
          <p className="text-[13px] text-gray-900 mt-0.5 font-medium">
            Get started in a few seconds
          </p>
        </div>

        {/* Error / Success messages */}
        {error && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium">
            {decodeURIComponent(error)}
          </div>
        )}
        {message && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-600 text-[12px] font-medium">
            {decodeURIComponent(message)}
          </div>
        )}

        <form action={signUp} className="space-y-2.5">
          <div>
            <label className="text-[11.5px] font-semibold text-gray-700">Full Name</label>
            <input
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
              className="mt-1 w-full h-9 px-3.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="text-[11.5px] font-semibold text-gray-700">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="mt-1 w-full h-9 px-3.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="text-[11.5px] font-semibold text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="mt-1 w-full h-9 px-3.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex items-start gap-2 mt-3 text-[11.5px] text-gray-900">
            <input type="checkbox" required className="accent-pink-500 mt-0.5" />
            <span>
              I agree to the{" "}
              <span className="text-pink-600 font-semibold hover:underline cursor-pointer">
                Terms &amp; Policy
              </span>
            </span>
          </div>

          <button
            type="submit"
            className="w-full mt-3 h-9 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-orange-500 to-pink-500 hover:opacity-90 transition shadow-md"
          >
            Create Account
          </button>
        </form>

        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-[10.5px] text-gray-900 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full h-9 rounded-xl border border-gray-300 flex items-center justify-center gap-2 text-sm text-gray-900 font-medium hover:bg-gray-100 transition"
          >
            <img src="/google.png" className="w-4 h-4" alt="Google" />
            Continue with Google
          </button>
        </form>

        <p className="mt-3 text-[11.5px] text-center text-gray-900">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-pink-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>

      </div>

    </div>
  );
}