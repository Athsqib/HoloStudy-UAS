import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, MoreVertical, Trash2 } from "lucide-react";
import type { FlashcardSet, Project } from "../types";
import { useViewControls } from "../hooks/useViewControls";
import { FilterBar } from "./FilterBar";

interface LibraryProps {
  sets: FlashcardSet[];
  projects: Project[];
  onCreateFirst: () => void;
  onOpenSet: (set: FlashcardSet) => void;
  onDeleteSet: (setId: string) => void;
}

export const Library = ({
  sets,
  projects,
  onCreateFirst,
  onOpenSet,
  onDeleteSet,
}: LibraryProps) => {
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filteredItems: filteredSets,
  } = useViewControls(
    sets,
    (set, query) =>
      set.title.toLowerCase().includes(query) ||
      set.description.toLowerCase().includes(query),
  );

  const totalCards = sets.reduce((acc, set) => acc + set.cards.length, 0);

  return (
    <div className="h-[calc(100vh-64px)] w-full p-4 lg:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full bg-[#fafbfc] border border-gray-100 rounded-[40px] shadow-sm overflow-y-auto no-scrollbar"
      >
        <div className="max-w-5xl mx-auto py-16 px-8 flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1a1a4b] mb-3">
              My Library
            </h2>
            <p className="text-gray-500 font-medium tracking-tight">
              Browse and manage all your flashcard sets
            </p>
          </div>

          <div className="h-px bg-gray-100 w-full max-w-2xl mb-12" />

          {/* Stats Bar */}
          <div className="w-full max-w-3xl bg-white rounded-4xl p-8 shadow-sm border border-gray-50 flex items-center justify-around mb-12">
            <div className="text-center">
              <span className="block text-4xl font-bold text-[#656799] mb-1">
                {sets.length}
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Total Sets
              </span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-bold text-[#656799] mb-1">
                {totalCards}
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Total Cards
              </span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-bold text-[#7b81ff] mb-1">
                Not yet
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Last Studied
              </span>
            </div>
          </div>

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            placeholder="Search flashcard sets..."
          />

          {sets.length > 0 ? (
            <div
              className={`w-full ${
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                  : "flex flex-col gap-4 max-w-3xl"
              } pb-20`}
            >
              <div
                onClick={onCreateFirst}
                className={`rounded-4xl border-2 border-dashed border-gray-100 flex items-center justify-center gap-4 text-gray-300 hover:border-[#6c7df3] hover:text-[#6c7df3] hover:bg-white transition-all group ${
                  viewMode === "grid"
                    ? "flex-col h-64"
                    : "flex-row h-24 px-8 w-full justify-start"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-[#6c7df3]/10 flex items-center justify-center transition-colors">
                  <BookOpen className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest">
                  Create New Set
                </span>
              </div>

              <AnimatePresence>
                {filteredSets.map((set) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onOpenSet(set)}
                    className={`bg-white rounded-4xl border border-gray-50 shadow-sm hover:shadow-md transition-all group cursor-pointer relative
                    ${
                      viewMode === "grid"
                        ? "p-6 flex flex-col h-full overflow-hidden"
                        : "p-4 pr-6 flex flex-row items-center gap-6"
                    }
                    `}
                  >
                    {viewMode === "grid" ? (
                      // Grid Layout
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div className="relative group/menu">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="p-2 text-gray-300 hover:text-gray-600 transition-colors"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            <div className="absolute top-10 right-0 bg-white border border-gray-100 rounded-xl py-2 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteSet(set.id);
                                }}
                                className="w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 whitespace-nowrap"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Set
                              </button>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-[#1a1a4b] mb-2">
                          {set.title}
                        </h3>
                        <p className="text-sm text-gray-400 font-medium mb-6 line-clamp-2">
                          {set.description}
                        </p>

                        {set.projectId && (
                          <div className="mb-4">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded text-[10px] font-bold uppercase tracking-wider">
                              {projects.find((p) => p.id === set.projectId)
                                ?.title || "Unknown Project"}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{set.cards.length} Cards</span>
                          </div>
                          <span className="text-[#6c7df3] font-bold text-sm hover:underline">
                            Open Set
                          </span>
                        </div>
                      </>
                    ) : (
                      // List Layout
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                          <BookOpen className="w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-[#1a1a4b] truncate max-w-full">
                              {set.title}
                            </h3>
                            {set.projectId && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 mt-1 sm:mt-0">
                                {projects.find((p) => p.id === set.projectId)
                                  ?.title || "Unknown"}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 font-medium truncate">
                            {set.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 shrink-0 ml-auto">
                          <div className="items-center gap-2 text-xs font-bold text-gray-400 hidden sm:flex">
                            <Clock className="w-4 h-4" />
                            <span>{set.cards.length} Cards</span>
                          </div>
                          <span className="text-[#6c7df3] font-bold text-sm hover:underline hidden sm:block">
                            Open Set
                          </span>

                          <div className="relative group/menu">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="p-2 text-gray-300 hover:text-gray-600 transition-colors"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            <div className="absolute top-10 right-0 bg-white border border-gray-100 rounded-xl py-2 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteSet(set.id);
                                }}
                                className="w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 whitespace-nowrap"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Set
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                No Flashcard Sets Yet
              </h3>
              <p className="text-gray-400/80 font-medium mb-8">
                Create your first flashcard set to see it here!
              </p>
              <button
                onClick={onCreateFirst}
                className="bg-[#6c7df3] text-white px-10 py-4 rounded-full font-bold hover:bg-[#5a6be0] transition-all shadow-lg shadow-blue-900/10 active:scale-95"
              >
                Create First Set
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
