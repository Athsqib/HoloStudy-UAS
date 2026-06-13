import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle,
} from "lucide-react";
import { CreateFlashcard } from "./CreateFlashcard";
import type { FlashcardSet, Project, FlexibleCard } from "../types";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface SetDetailProps {
  set: FlashcardSet;
  projects: Project[];
  onSave: (set: FlashcardSet) => Promise<void>;
}

export const SetDetail = ({ set, projects, onSave }: SetDetailProps) => {
  const navigate = useNavigate();

  // Toggle State
  const [isEditing, setIsEditing] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);

  // Flashcard Viewer States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Fallbacks in case your types use 'term/definition' instead of 'front/back'
  const currentCard = set.cards[currentIndex] as FlexibleCard | undefined;

  const frontText = currentCard?.front || currentCard?.term || "No Front Text";
  const backText =
    currentCard?.back || currentCard?.definition || "No Back Text";

  const isLastCard = currentIndex === set.cards.length - 1;

  const handleNext = useCallback(() => {
    if (currentIndex === set.cards.length - 1) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % set.cards.length);
    }, 150);
  }, [currentIndex, set.cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev - 1);
    }, 150);
  }, [currentIndex]);

  const handleFinishSet = async () => {
    setIsFinishing(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // Get current date in local YYYY-MM-DD format so midnight resets perfectly
        const d = new Date();
        const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        if (userSnap.exists()) {
          const data = userSnap.data();
          const lastDateStr = data.lastStudyDate;

          // Only update if they haven't already studied today
          if (lastDateStr !== todayStr) {
            const todayDate = new Date(todayStr);
            const lastDate = new Date(lastDateStr || "2000-01-01");
            const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let newStreak = data.streakCount || 0;

            if (diffDays === 1) {
              // Studied yesterday, streak continues!
              newStreak += 1;
            } else if (diffDays > 1) {
              // Missed a day, streak resets to 1
              newStreak = 1;
            }

            await updateDoc(userRef, {
              streakCount: newStreak,
              lastStudyDate: todayStr,
              lastWriteAt: new Date().toISOString(),
            });
          }
        } else {
          // First time they are completing a set, initialize their profile
          await setDoc(userRef, {
            userId: user.uid,
            streakCount: 1,
            lastStudyDate: todayStr,
            lastWriteAt: new Date().toISOString(),
          });
        }
      }

      const setRef = doc(db, "flashcardSets", set.id);
      await updateDoc(setRef, { lastStudied: new Date().toISOString() });

      // Route back to the library/dashboard after saving the streak
      navigate("/library");
    } catch (error) {
      console.error("Error updating streak:", error);
    } finally {
      setIsFinishing(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if we are editing or if there are no cards
      if (isEditing || set.cards.length === 0) return;

      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " " || e.code === "Space") {
        // Prevent default to stop the page from scrolling down when pressing spacebar
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "Enter" && isLastCard && !isFinishing) {
        handleFinishSet();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isEditing,
    set.cards.length,
    handleNext,
    handlePrev,
    isLastCard,
    isFinishing,
    handleFinishSet,
  ]);

  // --- EDIT MODE ---
  if (isEditing) {
    return (
      <CreateFlashcard
        initialSet={set}
        projects={projects}
        onSave={async (updatedSet) => {
          await onSave(updatedSet);
          setIsEditing(false); // Switch back to read-only after saving
        }}
        onDiscard={() => setIsEditing(false)} // Cancel edit mode
      />
    );
  }

  // --- READ ONLY (STUDY) MODE ---
  return (
    <div className="h-[calc(100vh-64px)] w-full p-4 lg:p-6 overflow-hidden flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl h-full bg-[#fafbfc] border border-gray-100 rounded-[40px] shadow-sm flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 gap-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <button
              onClick={() => navigate("/library")}
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="group min-w-0">
              <div
                className={`relative overflow-hidden cursor-pointer transition-all duration-200 ${
                  headerExpanded ? "" : "max-h-20 sm:group-hover:max-h-96"
                }`}
                onClick={() => setHeaderExpanded(!headerExpanded)}
              >
                <h2 className="text-lg sm:text-xl font-bold text-[#1a1a4b] w-full wrap-break-word whitespace-pre-wrap">
                  {set.title}
                </h2>

                <p className="text-sm text-gray-400 font-medium wrap-break-word whitespace-pre-wrap">
                  {set.description || "No description."}
                </p>
                {!headerExpanded && (
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-white to-transparent pointer-events-none sm:group-hover:opacity-0 transition-opacity duration-200" />
                )}
              </div>
              {headerExpanded && (
                <button
                  onClick={() => setHeaderExpanded(false)}
                  className="text-indigo-400 text-xs font-bold hover:underline mt-1"
                >
                  Show less
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 sm:px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Set</span>
          </button>
        </div>

        {/* Study Area */}
        {set.cards.length > 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="text-sm font-bold text-gray-400 mb-6 sm:mb-8 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Card {currentIndex + 1} of {set.cards.length}
            </div>

            {/* The Flashcard */}
            <div
              className="relative w-full max-w-2xl h-56 sm:h-80 perspective-1000 cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d"
                animate={{ rotateX: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Front */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-gray-100 rounded-3xl shadow-lg flex items-center justify-center p-6 sm:p-12 text-center group-hover:border-indigo-100 transition-colors">
                  <h3 className="text-xl sm:text-3xl font-bold text-[#2d2d66] w-full wrap-break-word whitespace-pre-wrap">
                    {frontText}
                  </h3>
                  <div className="absolute bottom-6 right-6 text-gray-300 group-hover:text-indigo-300 transition-colors">
                    <RotateCw className="w-6 h-6" />
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-indigo-50 border-2 border-indigo-100 rounded-3xl shadow-lg flex items-center justify-center p-6 sm:p-12 text-center transform-[rotateX(180deg)]">
                  <p className="text-xl sm:text-2xl font-medium text-indigo-900 leading-relaxed w-full wrap-break-word whitespace-pre-wrap">
                    {backText}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center gp-6 sm:gap-8 mt-6 sm:mt-12">
              <button
                onClick={handlePrev}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md transition-all active:scale-95"
              >
                <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6" />
              </button>

              {isLastCard ? (
                <button
                  onClick={handleFinishSet}
                  disabled={isFinishing}
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-[#656799] text-white font-bold flex items-center gap-2 hover:bg-[#545685] transition-all active:scale-95 shadow-md shadow-indigo-900/10 disabled:opacity-70 disabled:cursor-wait"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isFinishing ? "Saving..." : "Finish Set"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-300 mb-2">
              No Cards Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Click Edit Set to add some flashcards!
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-[#656799] text-white rounded-xl font-bold"
            >
              Add Cards
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
