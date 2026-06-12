import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  BookOpen,
  ArrowRight,
  Edit2,
  Check,
  Target,
  Clock,
} from "lucide-react";
import type { FlashcardSet, UserProfile } from "../types";
import { useUsername } from "../hooks/useUsername";
import type { User } from "firebase/auth";
import { SelectDropdown } from "./SelectDropdown";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

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

  // Goal States
  const [goalSetId, setGoalSetId] = useState<string>("");
  const [dailyTarget, setDailyTarget] = useState<number>(15);
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);

  // Determine the active goal set (defaults to the first set if none is explicitly chosen)
  const activeGoalSet = sets.find((s) => s.id === goalSetId) || sets[0];

  // State to hold streak data based on UserProfile type
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [hasCompletedToday, setHasCompletedToday] = useState<boolean>(false);

  const displayName = isLoading
    ? "..."
    : username ||
      user?.displayName?.split(" ")[0] ||
      (user?.isAnonymous ? "Guest" : "Student");

  // Format the sets array to match the DropdownOption structure expected by our new component
  const dropdownOptions = sets.map((set) => ({
    id: set.id,
    label: set.title,
    subLabel: `${set.cards.length} cards`,
  }));

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);

    // Listen for real-time updates so the UI never gets stuck
    const unsubscribe = onSnapshot(
      userRef,
      (userSnap) => {
        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;

          // Default to 0 if streakCount doesn't exist
          setCurrentStreak(userData.streakCount || 0);

          let completed = false;

          // FIX: Look for 'lastStudyDate' (which SetDetail saves)
          // Fallback to 'lastStreakDate' just in case old accounts use it
          const savedDate = userData.lastStudyDate || userData.lastStreakDate;

          if (savedDate) {
            try {
              let lastDate: Date;

              // 1. Check if it's a String FIRST
              if (typeof savedDate === "string") {
                if (savedDate.includes("-")) {
                  const [year, month, day] = savedDate.split("-");
                  lastDate = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                  );
                } else {
                  lastDate = new Date(savedDate);
                }
              }
              // 2. Safely check if it's an object with a toDate function (Firebase Timestamp)
              // By checking 'typeof === "object"' and '"toDate" in', TS knows it's safe.
              else if (
                savedDate &&
                typeof savedDate === "object" &&
                "toDate" in savedDate
              ) {
                // We cast it to a specific inline type instead of 'any' to satisfy ESLint
                lastDate = (savedDate as { toDate: () => Date }).toDate();
              }
              // 3. Fallback for any other number format
              else {
                lastDate = new Date(savedDate as number);
              }

              // Make sure the date is valid before checking it
              if (!isNaN(lastDate.getTime())) {
                const today = new Date();

                if (
                  lastDate.getDate() === today.getDate() &&
                  lastDate.getMonth() === today.getMonth() &&
                  lastDate.getFullYear() === today.getFullYear()
                ) {
                  completed = true;
                }
              }
            } catch (err) {
              console.error("Gagal memproses data streak:", err);
            }
          }

          setHasCompletedToday(completed);
        }
      },
      (error) => {
        console.error("Error fetching user streak:", error);
      },
    );

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [user]);

  const maxStreakDisplay = 7;
  const progressPercentage = Math.min(
    (currentStreak / maxStreakDisplay) * 100,
    100,
  );

  // --- STREAK CYCLE MATH ---
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison

  let daysSinceCycleStart;

  if (hasCompletedToday) {
    daysSinceCycleStart = currentStreak > 0 ? (currentStreak - 1) % 7 : 0;
  } else {
    daysSinceCycleStart = currentStreak % 7;
  }

  const startOfWeek = new Date(todayDate);
  startOfWeek.setDate(todayDate.getDate() - daysSinceCycleStart);

  const currentWeekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);

    const isToday = d.getTime() === todayDate.getTime();
    const distanceFromToday = Math.round(
      (todayDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );

    let isPartOfStreak;
    if (hasCompletedToday) {
      isPartOfStreak =
        distanceFromToday >= 0 && distanceFromToday < currentStreak;
    } else {
      isPartOfStreak =
        distanceFromToday > 0 && distanceFromToday <= currentStreak;
    }

    return {
      id: i,
      label: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(), // e.g. "MON", "TUE"
      isToday,
      isPartOfStreak,
    };
  });

  return (
    <div className="h-[calc(100vh-64px)] w-full p-4 lg:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-y-auto no-scrollbar"
      >
        <div className="max-w-6xl mx-auto p-4 sm:p-10 lg:p-14">
          {/* Welcome Header */}
          <div className="mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2d2d66] mb-2 font-display">
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
            {/* Main Featured Card - Dynamic Goal Selector */}
            <div className="lg:col-span-2 bg-[#f4f7fe] rounded-4xl p-4 sm:p-10 relative flex flex-col justify-between min-h-80 group transition-all hover:shadow-xl hover:shadow-blue-900/5">
              <div className="relative z-10 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-4 py-1 bg-[#c5c8f2] text-[#4d51a3] text-[10px] font-bold uppercase tracking-wider rounded-full w-max">
                      Current Goal
                    </span>

                    {/* Editable Daily Target */}
                    {isEditingTarget ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white px-3 py-1 rounded-2xl border border-indigo-200 shadow-sm">
                        <input
                          type="number"
                          min="1"
                          value={dailyTarget}
                          onChange={(e) =>
                            setDailyTarget(Number(e.target.value))
                          }
                          className="w-12 outline-none font-bold text-[#4d51a3] text-xs bg-transparent"
                          autoFocus
                          onKeyDown={(e) =>
                            e.key === "Enter" && setIsEditingTarget(false)
                          }
                        />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          cards/day
                        </span>
                        <button
                          onClick={() => setIsEditingTarget(false)}
                          className="ml-1 text-green-500 hover:text-green-600 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-2 group/target cursor-pointer"
                        onClick={() => setIsEditingTarget(true)}
                      >
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#4d51a3] bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm transition-colors group-hover/target:border-indigo-300">
                          <Target className="w-3.5 h-3.5" />
                          Target: {dailyTarget} cards/day
                        </span>
                        <button className="opacity-0 group-hover/target:opacity-100 transition-opacity p-1 text-gray-400 hover:text-[#656799]">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reusable Dropdown Component */}
                  {sets.length > 0 && (
                    <SelectDropdown
                      options={dropdownOptions}
                      value={activeGoalSet?.id || ""}
                      onChange={(newId) => setGoalSetId(newId)}
                      placeholder="Select Goal"
                      className="w-full sm:w-55"
                    />
                  )}
                </div>

                <h3 className="text-2xl sm:text-4xl font-bold text-[#2d2d66] mb-4 max-w-md leading-tight line-clamp-2 wrap-break-word whitespace-pre-wrap break-all">
                  {activeGoalSet
                    ? `Master "${activeGoalSet.title}"`
                    : "Set Your Daily Goal"}
                </h3>

                <p className="text-gray-500 font-medium max-w-90 mb-8 leading-relaxed line-clamp-3">
                  {activeGoalSet
                    ? `Keep reviewing this set to hit your goal of ${dailyTarget} cards today.`
                    : "Create your first flashcard set to start setting and tracking your learning goals!"}
                </p>

                <button
                  onClick={() => activeGoalSet && onOpenSet(activeGoalSet)}
                  disabled={!activeGoalSet}
                  className="bg-[#656799] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#545685] transition-all shadow-lg shadow-purple-900/10 active:scale-95 w-max"
                >
                  {activeGoalSet ? "Continue Set" : "Start Learning"}
                </button>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-[#e9e9ff] rounded-4xl p-8 flex flex-col justify-between shadow-sm border border-white/50 transition-all hover:shadow-xl hover:shadow-indigo-900/5">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#c5c8f2] flex items-center justify-center text-[#4d51a3] shadow-sm">
                    <Zap className="w-6 h-6 fill-[#4d51a3]" />
                  </div>

                  {/* --- NEW STATUS BADGE --- */}
                  {hasCompletedToday ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                      <Check className="w-3.5 h-3.5" /> Done Today
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                      <Clock className="w-3.5 h-3.5" /> Not Yet Studied
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-[#2d2d66] mb-2 tracking-tight">
                  {currentStreak} Day Streak
                </h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  {currentStreak >= 3
                    ? "You are on fire! Don't let the flame go out."
                    : "Great start! Keep going to build your streak."}
                </p>
              </div>

              <div className="mt-8">
                {/* Progress Bar */}
                <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden mb-4 border border-white/20 p-0.5">
                  <div
                    className="h-full bg-[#656799] rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {/* Fixed Weekdays */}
                <div className="flex justify-between px-1">
                  {currentWeekDays.map((day) => (
                    <span
                      key={day.id}
                      className={`text-[9px] font-bold tracking-tighter transition-colors ${
                        day.isToday
                          ? "text-[#2d2d66] scale-110"
                          : day.isPartOfStreak
                            ? "text-[#656799]"
                            : "text-gray-400"
                      }`}
                    >
                      {day.label}
                    </span>
                  ))}
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
