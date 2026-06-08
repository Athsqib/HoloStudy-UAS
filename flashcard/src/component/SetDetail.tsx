import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import { CreateFlashcard } from "./CreateFlashcard";
import type { FlashcardSet, Project, FlexibleCard } from "../types";

interface SetDetailProps {
  set: FlashcardSet;
  projects: Project[];
  onSave: (set: FlashcardSet) => Promise<void>;
}

export const SetDetail = ({ set, projects, onSave }: SetDetailProps) => {
  const navigate = useNavigate();

  // Toggle State
  const [isEditing, setIsEditing] = useState(false);

  // Flashcard Viewer States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Fallbacks in case your types use 'term/definition' instead of 'front/back'
  const currentCard = set.cards[currentIndex] as FlexibleCard | undefined;

  const frontText = currentCard?.front || currentCard?.term || "No Front Text";
  const backText =
    currentCard?.back || currentCard?.definition || "No Back Text";

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % set.cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(
        (prev) => (prev - 1 + set.cards.length) % set.cards.length,
      );
    }, 150);
  };

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
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/library")}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-[#1a1a4b]">{set.title}</h2>
              <p className="text-sm text-gray-400 font-medium">
                {set.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Set
          </button>
        </div>

        {/* Study Area */}
        {set.cards.length > 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Card {currentIndex + 1} of {set.cards.length}
            </div>

            {/* The Flashcard */}
            <div
              className="relative w-full max-w-2xl h-80 perspective-1000 cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d"
                animate={{ rotateX: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Front */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-gray-100 rounded-3xl shadow-lg flex items-center justify-center p-12 text-center group-hover:border-indigo-100 transition-colors">
                  <h3 className="text-3xl font-bold text-[#2d2d66]">
                    {frontText}
                  </h3>
                  <div className="absolute bottom-6 right-6 text-gray-300 group-hover:text-indigo-300 transition-colors">
                    <RotateCw className="w-6 h-6" />
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-indigo-50 border-2 border-indigo-100 rounded-3xl shadow-lg flex items-center justify-center p-12 text-center [transform:rotateX(180deg)]">
                  <p className="text-2xl font-medium text-indigo-900 leading-relaxed">
                    {backText}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 mt-12">
              <button
                onClick={handlePrev}
                className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md transition-all active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md transition-all active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
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
