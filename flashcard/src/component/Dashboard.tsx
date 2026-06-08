import { motion } from "framer-motion";
import { Zap, BookOpen, ArrowRight } from "lucide-react";
import type { FlashcardSet } from "../types";
import { useUsername } from "../hooks/useUsername";
import type { User } from "firebase/auth";

export const Dashboard = ({
  user,
  sets,
  onOpenSet,
  onViewAll,
}: {
  user: User | null;
  sets: FlashcardSet[];
  onOpenSet: (set: FlashcardSet) => void;
  onViewAll?: () => void;
}) => {
  const { username, isLoading } = useUsername(user);

  const displayName = isLoading
    ? "..."
    : username ||
      user?.displayName?.split(" ")[0] ||
      (user?.isAnonymous ? "Guest" : "Student");

  return (
    <div className="h-[calc(100vh-64px)] w-full p-4 lg:p-6 overflow-hidden">
      {/* The Big Box Background - Handles internal scrolling to keep rounded corners fixed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-y-auto no-scrollbar"
      >
        <div className="max-w-6xl mx-auto p-10 lg:p-14">
          {/* Welcome Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#2d2d66] mb-2 font-display">
              Welcome back, {displayName}
            </h2>
            <p className="text-gray-500 font-medium">
              You've mastered{" "}
              {sets.reduce((a, s) => a + s.cards.length, 0) > 0 ? "some" : "no"}{" "}
              cards today. Keep the momentum going.
            </p>
          </div>

          {/* Status Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Main Featured Card */}
            <div className="lg:col-span-2 bg-[#f4f7fe] rounded-4xl p-10 relative overflow-hidden flex flex-col justify-between min-h-80 group transition-all hover:shadow-xl hover:shadow-blue-900/5">
              <div className="relative z-10">
                <span className="inline-block px-4 py-1 bg-[#c5c8f2] text-[#4d51a3] text-[10px] font-bold uppercase tracking-wider rounded-full mb-6">
                  {sets[0]?.title ? "Current Goal" : "Daily Goal"}
                </span>
                <h3 className="text-4xl font-bold text-[#2d2d66] mb-4 max-w-md leading-tight">
                  {sets[0]?.title || "Master Spanish Vocabulary"}
                </h3>
                <p className="text-gray-500 font-medium max-w-[320px] mb-8 leading-relaxed">
                  {sets[0]?.description ||
                    "You're 85% of the way to your weekly goal. Just 15 more cards to reach your streak!"}
                </p>
                <button
                  onClick={() => sets[0] && onOpenSet(sets[0])}
                  className="bg-[#656799] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#545685] transition-all shadow-lg shadow-purple-900/10 active:scale-95"
                >
                  {sets[0] ? "Continue Set" : "Start Learning"}
                </button>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-[#e9e9ff] rounded-4xl p-8 flex flex-col justify-between shadow-sm border border-white/50 transition-all hover:shadow-xl hover:shadow-indigo-900/5">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#c5c8f2] flex items-center justify-center text-[#4d51a3] mb-6 shadow-sm">
                  <Zap className="w-6 h-6 fill-[#4d51a3]" />
                </div>
                <h3 className="text-2xl font-bold text-[#2d2d66] mb-2 tracking-tight">
                  7 Day Streak
                </h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  You are on fire! Don't let the flame go out.
                </p>
              </div>

              <div className="mt-8">
                {/* Progress Bar */}
                <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden mb-4 border border-white/20 p-0.5">
                  <div className="h-full bg-[#656799] rounded-full w-[85%] transition-all duration-1000 shadow-sm" />
                </div>
                {/* Weekdays */}
                <div className="flex justify-between px-1">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    (day) => (
                      <span
                        key={day}
                        className={`text-[9px] font-bold tracking-tighter ${day === "SAT" ? "text-[#656799]" : "text-gray-400"}`}
                      >
                        {day}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recently Added Sets */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-[#2d2d66]">
                Recently Added Sets
              </h3>
              <button
                onClick={onViewAll}
                className="text-[#6c7df3] font-bold text-sm hover:underline flex items-center gap-2"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {sets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sets.slice(0, 3).map((set) => (
                  <div
                    key={set.id}
                    onClick={() => onOpenSet(set)}
                    className="bg-[#fafbfc] p-6 rounded-4xl border border-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-900/5 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white text-indigo-400 flex items-center justify-center mb-4 shadow-sm group-hover:bg-indigo-50 transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-[#1a1a4b] mb-1 line-clamp-1">
                      {set.title}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium mb-4 line-clamp-1">
                      {set.description}
                    </p>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      {set.cards.length} Cards
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 rounded-[40px] border-2 border-dashed border-gray-100 flex items-center justify-center bg-[#fafbfc]">
                <p className="text-gray-300 font-medium italic">
                  No sets found. Create your first one to see it here!
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
