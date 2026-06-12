import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Folder } from "lucide-react";
import type { Project, FlashcardSet } from "../types";

interface ProjectDetailProps {
  project: Project;
  sets: FlashcardSet[];
  onOpenSet: (set: FlashcardSet) => void;
}

export const ProjectDetail = ({
  project,
  sets,
  onOpenSet,
}: ProjectDetailProps) => {
  const navigate = useNavigate();

  // Filter sets specifically belonging to this project
  const projectSets = sets.filter((s) => s.projectId === project.id);

  return (
    <div className="h-[calc(100vh-64px)] w-full p-4 lg:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full bg-[#fafbfc] border border-gray-100 rounded-[40px] shadow-sm overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4 sm:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
            <button
              onClick={() => navigate("/projects")}
              className="p-3 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-[#1a1a4b] wrap-break-words break-all">
                {project.title}
              </h2>
              <p className="text-gray-400 font-medium wrap-break-word break-all">
                {project.description}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-indigo-400 mb-2">
                <BookOpen />
              </div>
              <div className="text-2xl font-bold text-[#1a1a4b]">
                {projectSets.length}
              </div>
              <div className="text-sm text-gray-400 font-bold">
                Flashcard Sets
              </div>
            </div>
          </div>

          {/* List of Sets in Project */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">
              Included Sets
            </h3>
            {projectSets.map((set) => (
              <div
                key={set.id}
                onClick={() => onOpenSet(set)}
                className="bg-white p-5 rounded-2xl border border-gray-50 flex items-center justify-between hover:border-indigo-100 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-400 flex items-center justify-center">
                    <Folder className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-[#1a1a4b]">{set.title}</span>
                </div>
                <span className="text-xs font-bold text-gray-400">
                  {set.cards.length} cards
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
