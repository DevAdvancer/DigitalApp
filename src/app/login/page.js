"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/appwrite";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");
  const router = useRouter();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
    setTheme(nextTheme);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas font-sans text-body">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-hairline bg-surface-card hover:bg-canvas-soft text-[10px] uppercase font-semibold tracking-wider text-ink transition duration-150"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="z-10 w-full max-w-sm px-6 py-12 animate-fadeIn">
        {/* Logo / Header */}
        <div className="mb-10 text-center">
          <img
            src="/logo.png"
            alt="Digital Marketing Logo"
            className="inline-flex h-9 w-9 rounded object-cover shadow-sm border border-hairline-soft"
          />
          <h1 className="mt-4 text-3xl font-normal tracking-[-0.05em] text-ink leading-tight">
            Digital Marketing Console
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.08em] text-muted">
            Sign in to database
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-hairline bg-surface-card p-8 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded border border-semantic-error/10 bg-semantic-error/5 p-3 text-xs text-semantic-error font-medium">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition duration-150 focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition duration-150 focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center rounded-md bg-primary py-2.5 text-xs font-medium text-white transition-all duration-150 hover:bg-primary-active focus:ring-1 focus:ring-primary/50 focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] text-muted-soft uppercase tracking-[0.05em]">
          DMC &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
