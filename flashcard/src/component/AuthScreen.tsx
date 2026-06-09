import { useState } from "react";
import { motion } from "framer-motion";
import { auth, googleProvider, db } from "../lib/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import {
  BookOpen,
  LogIn,
  AlertCircle,
  Mail,
  Lock,
  UserCircle,
  User,
} from "lucide-react";

export const AuthScreen = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form States
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

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

  const handleForgotPassword = async () => {
    if (!identifier) {
      setError(
        "Please enter your username or email in the top field to reset your password.",
      );
      setResetMessage("");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setResetMessage("");

      let resetEmail = identifier.trim();

      // If they entered a username, find their email in the database first
      if (!resetEmail.includes("@")) {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("username", "==", resetEmail.toLowerCase()),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(
            "Username not found. Please enter a valid username or email.",
          );
        }
        resetEmail = querySnapshot.docs[0].data().email;
      }

      const COOLDOWN_DAYS = 5;
      const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
      const storageKey = `pwd_reset_${resetEmail}`; // Unique key for this email
      const lastResetStr = localStorage.getItem(storageKey);

      if (lastResetStr) {
        const lastResetTime = parseInt(lastResetStr, 10);
        const timeSinceLastReset = Date.now() - lastResetTime;

        // If 5 days haven't passed yet, block the request
        if (timeSinceLastReset < COOLDOWN_MS) {
          const timeLeftMs = COOLDOWN_MS - timeSinceLastReset;
          const daysLeft = Math.ceil(timeLeftMs / (1000 * 60 * 60 * 24));
          throw new Error(
            `You can only request a reset once every 5 days. Please try again in ${daysLeft} day(s).`,
          );
        }
      }
      // Send the password reset email
      await sendPasswordResetEmail(auth, resetEmail);

      // Save the current timestamp to Local Storage for the cooldown
      localStorage.setItem(storageKey, Date.now().toString());

      setResetMessage("Password reset email sent! Check your inbox.");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // --- LOG IN FLOW ---
        if (!identifier || !password) {
          throw new Error("Please fill in all fields");
        }

        let loginEmail = identifier.trim();

        if (!loginEmail.includes("@")) {
          const usersRef = collection(db, "users");
          const q = query(
            usersRef,
            where("username", "==", loginEmail.toLowerCase()),
          );
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            throw new Error("Username not found");
          }
          loginEmail = querySnapshot.docs[0].data().email;
        }

        await signInWithEmailAndPassword(auth, loginEmail, password);
      } else {
        // --- SIGN UP FLOW ---
        if (!username || !email || !password) {
          throw new Error("Please fill in all fields");
        }

        const safeUsername = username.trim().toLowerCase();
        if (safeUsername.includes(" ")) {
          throw new Error("Usernames cannot contain spaces");
        }

        // Check if username exists
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", safeUsername));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          throw new Error("That username is already taken");
        }

        // Create Auth user
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        // Save custom username to Firestore
        await setDoc(doc(db, "users", userCred.user.uid), {
          username: safeUsername,
          email: email.toLowerCase(),
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error: unknown) {
      console.error("Auth error:", error);
      const err = error as { code?: string; message?: string };

      if (
        err.message === "Please fill in all fields" ||
        err.message === "Username not found" ||
        err.message === "That username is already taken" ||
        err.message === "Usernames cannot contain spaces"
      ) {
        setError(err.message);
      } else if (err.code === "auth/invalid-credential") {
        setError("Wrong email/username or password.");
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

        {resetMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-medium flex items-center gap-2 text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-6">
          {isLoginMode ? (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Username or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full py-4 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c7df3]/50 focus:border-[#6c7df3] transition-all"
              />
            </div>
          ) : (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Choose a Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full py-4 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c7df3]/50 focus:border-[#6c7df3] transition-all"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-4 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c7df3]/50 focus:border-[#6c7df3] transition-all"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6c7df3]/50 focus:border-[#6c7df3] transition-all"
            />
          </div>

          {isLoginMode && (
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="text-sm text-[#6c7df3] font-semibold hover:underline focus:outline-none disabled:opacity-50"
              >
                Forgot your password?
              </button>
            </div>
          )}

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

        <button
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError("");
            setResetMessage("");
            setIdentifier("");
            setUsername("");
            setEmail("");
            setPassword("");
          }}
          type="button"
          className="text-[#6c7df3] font-semibold text-sm mb-6 hover:underline focus:outline-none"
        >
          {isLoginMode
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        <div className="flex flex-col gap-3">
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
        </div>
      </motion.div>
    </div>
  );
};
