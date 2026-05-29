import { useState } from "react";
import { motion } from "framer-motion";
import { auth, googleProvider } from "../lib/firebase";
import {
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
} from "firebase/auth";
import {
  BookOpen,
  LogIn,
  AlertCircle,
  Mail,
  Lock,
  UserCircle,
} from "lucide-react";

export const AuthScreen = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New state for manual login
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signInWithRedirect(auth, googleProvider);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: unknown) {
      console.error("Auth error:", error);

      // Safely tell TypeScript this error object might have Firebase properties
      const err = error as { code?: string; message?: string };

      if (err.code === "auth/invalid-credential") {
        setError("Wrong email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account already exists with this email.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Failed to authenticate.");
      }
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signInAnonymously(auth);
    } catch (error: unknown) {
      console.error("Guest Auth error:", error);
      const err = error as { message?: string };
      setError(err.message || "Failed to sign in as guest");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-xl shadow-indigo-900/5 border border-gray-100 text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-[#6c7df3] flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold text-[#1a1a4b] mb-2">HoloStudy</h1>
        <p className="text-gray-500 font-medium mb-8">
          {isLoginMode
            ? "Sign in to organize your flashcards and projects."
            : "Create an account to get started."}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2 text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* --- MANUAL EMAIL FORM --- */}
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-4 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c7df3]/50 focus:border-[#6c7df3] transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c7df3]/50 focus:border-[#6c7df3] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-[#6c7df3] hover:bg-[#5a6be0] text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-lg shadow-indigo-900/20"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLoginMode ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Toggle between Login and Sign up */}
        <button
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError("");
          }}
          type="button"
          className="text-[#6c7df3] font-semibold text-sm mb-6 hover:underline focus:outline-none"
        >
          {isLoginMode
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        {/* --- GOOGLE BUTTON --- */}
        <button
          onClick={handleGoogleSignIn}
          type="button"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-700 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70"
        >
          <LogIn className="w-5 h-5 text-gray-500" />
          Continue with Google
        </button>
        <button
          onClick={handleGuestSignIn}
          type="button"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-600 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70"
        >
          <UserCircle className="w-5 h-5 text-gray-400" />
          Continue as Guest
        </button>
      </motion.div>
    </div>
  );
};
