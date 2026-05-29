import { useState } from "react";
import { motion } from "framer-motion";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { BookOpen, LogIn, AlertCircle } from "lucide-react";

export const AuthScreen = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMessage);
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
        <p className="text-gray-500 font-medium mb-10">
          Sign in to organize your flashcards and projects.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2 text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-[#6c7df3] hover:bg-[#5a6be0] text-white rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-lg shadow-indigo-900/20"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Continue with Google
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};
