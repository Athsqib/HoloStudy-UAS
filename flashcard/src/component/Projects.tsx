import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Plus,
  MoreVertical,
  LayoutGrid,
  ArrowLeft,
  BookOpen,
  Clock,
  Trash2,
} from "lucide-react";
import type { Project, FlashcardSet } from "../types";
import { useViewControls } from "../hooks/useViewControls";
import { FilterBar } from "./FilterBar";
import { useNavigate } from "react-router-dom";

interface ProjectsProps {
  projects: Project[];
  sets: FlashcardSet[];
  onSaveProject: (project: Project) => void;
  onOpenSet: (set: FlashcardSet) => void;
  onDeleteProject: (projectId: string) => void;
  onDeleteSet: (setId: string) => void;
}

export const Projects = ({
  projects,
  sets,
  onSaveProject,
  onOpenSet,
  onDeleteProject,
  onDeleteSet,
}: ProjectsProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const projectSets = sets.filter((s) => s.projectId === selectedProjectId);
  const navigate = useNavigate();

  // Hook for filtering/viewing main Projects
  const {
    searchQuery: projectSearchQuery,
    setSearchQuery: setProjectSearchQuery,
    viewMode: projectViewMode,
    setViewMode: setProjectViewMode,
    filteredItems: filteredProjects,
  } = useViewControls(
    projects,
    (project, query) =>
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query),
  );

  // Hook for filtering/viewing Sets inside a selected Project
  const {
    searchQuery: setSearchQuery,
    setSearchQuery: setSetSearchQuery,
    viewMode: setViewMode,
    setViewMode: setSetViewMode,
    filteredItems: filteredProjectSets,
  } = useViewControls(
    projectSets,
    (set, query) =>
      set.title.toLowerCase().includes(query) ||
      set.description.toLowerCase().includes(query),
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newProjectTitle.trim();
    if (!title) return;

    const isDuplicate = projects.some(
      (p) => p.title.toLowerCase() === title.toLowerCase(),
    );

    if (isDuplicate) {
      alert(
        "A project folder with this name already exists! Please choose a different name.",
      );
      return;
    }

    const newProject: Project = {
      id: Math.random().toString(36).slice(2, 11),
      title: newProjectTitle,
      description: newProjectDesc,
      createdAt: new Date().toISOString(),
      color: "blue",
    };

    onSaveProject(newProject);
    setNewProjectTitle("");
    setNewProjectDesc("");
    setIsCreatingProject(false);
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full p-4 lg:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full bg-[#fafbfc] border border-gray-100 rounded-[40px] shadow-sm overflow-y-auto no-scrollbar"
      >
        <div className="max-w-5xl mx-auto py-16 px-8">
          <AnimatePresence mode="wait">
            {!selectedProjectId ? (
              <motion.div
                key="project-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center"
              >
                {/* Header */}
                <div className="text-center mb-12">
                  <div className="w-16 h-16 bg-[#edf2f7] rounded-3xl flex items-center justify-center text-[#4d51a3] mx-auto mb-6">
                    <Folder className="w-8 h-8" />
                  </div>
                  <h2 className="text-4xl font-bold text-[#1a1a4b] mb-3">
                    Project Folders
                  </h2>
                  <p className="text-gray-500 font-medium tracking-tight">
                    Organize your flashcard sets into subject-specific projects
                  </p>
                </div>

                {/* Filter and View Toggle */}
                <div className="w-full flex justify-center mb-12">
                  <FilterBar
                    searchQuery={projectSearchQuery}
                    onSearchChange={setProjectSearchQuery}
                    viewMode={projectViewMode}
                    onViewModeChange={setProjectViewMode}
                    placeholder="Search projects..."
                  />
                </div>

                {/* Grid/List Container */}
                <div
                  className={`w-full ${
                    projectViewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "flex flex-col gap-4 max-w-3xl w-full mx-auto"
                  }`}
                >
                  {/* Create New Project Button/Form */}
                  {!isCreatingProject ? (
                    <button
                      onClick={() => setIsCreatingProject(true)}
                      className={`rounded-4xl border-2 border-dashed border-gray-100 flex items-center justify-center gap-4 text-gray-300 hover:border-[#6c7df3] hover:text-[#6c7df3] hover:bg-white transition-all group ${
                        projectViewMode === "grid"
                          ? "flex-col h-64"
                          : "flex-row h-24 px-8 w-full justify-start"
                      }`}
                    >
                      <div className="w-12 h-12 shrink-0 rounded-full bg-gray-50 group-hover:bg-[#6c7df3]/10 flex items-center justify-center transition-colors">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Create New Project
                      </span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white p-8 rounded-4xl border border-gray-100 shadow-xl flex flex-col ${
                        projectViewMode === "grid" ? "h-64" : "w-full"
                      }`}
                    >
                      <form
                        onSubmit={handleCreateProject}
                        className="flex-1 flex flex-col gap-4"
                      >
                        <input
                          autoFocus
                          type="text"
                          placeholder="Project Title"
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6c7df3]/20 focus:border-[#6c7df3] outline-none font-bold"
                        />
                        <textarea
                          placeholder="Short description..."
                          value={newProjectDesc}
                          onChange={(e) => setNewProjectDesc(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6c7df3]/20 focus:border-[#6c7df3] outline-none text-sm resize-none h-20"
                        />
                        <div className="flex gap-2 mt-auto">
                          <button
                            type="button"
                            onClick={() => setIsCreatingProject(false)}
                            className="flex-1 px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[#6c7df3] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/10 hover:bg-[#5a6be0] transition-all"
                          >
                            Create
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Render Filtered Projects */}
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/project/${project.id}`)}
                      className={`bg-white rounded-4xl border border-gray-50 shadow-sm cursor-pointer hover:shadow-xl hover:shadow-blue-900/5 transition-all relative group ${
                        projectViewMode === "grid"
                          ? "p-8 flex flex-col h-64"
                          : "p-5 pr-8 flex flex-row items-center gap-6 w-full"
                      }`}
                    >
                      {projectViewMode === "grid" ? (
                        // Grid Layout
                        <>
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                              <LayoutGrid className="w-6 h-6" />
                            </div>
                            <div className="relative group/menu">
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-gray-300 hover:text-gray-600"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              <div className="absolute top-10 right-0 bg-white border border-gray-100 rounded-xl py-2 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteProject(project.id);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-[#1a1a4b] mb-2">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-400 font-medium mb-6 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="mt-auto flex items-center justify-between text-xs font-bold text-gray-400">
                            <span>
                              {
                                sets.filter((s) => s.projectId === project.id)
                                  .length
                              }{" "}
                              Sets Included
                            </span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-[10px] uppercase tracking-wider">
                              Project
                            </span>
                          </div>
                        </>
                      ) : (
                        // List Layout
                        <>
                          <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                            <LayoutGrid className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-[#1a1a4b] mb-1 truncate">
                              {project.title}
                            </h3>
                            <p className="text-sm text-gray-400 font-medium truncate">
                              {project.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-8 shrink-0">
                            <span className="text-xs font-bold text-gray-400 w-24 text-right">
                              {
                                sets.filter((s) => s.projectId === project.id)
                                  .length
                              }{" "}
                              Sets
                            </span>
                            <div className="relative group/menu">
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-gray-300 hover:text-gray-600"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              <div className="absolute top-10 right-0 w-36 bg-white border border-gray-100 rounded-xl py-2 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteProject(project.id);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="project-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center w-full"
              >
                <div className="flex justify-between items-center mb-8 w-full">
                  <button
                    onClick={() => setSelectedProjectId(null)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#656799] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                  </button>
                  <button
                    onClick={() => onDeleteProject(selectedProject?.id || "")}
                    className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Project
                  </button>
                </div>

                <div className="mb-12 text-center">
                  <h2 className="text-4xl font-bold text-[#1a1a4b] mb-3">
                    {selectedProject?.title}
                  </h2>
                  <p className="text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                    {selectedProject?.description}
                  </p>
                </div>

                {/* Filter and View Toggle for Sets inside Project */}
                <div className="w-full flex justify-center mb-12">
                  <FilterBar
                    searchQuery={setSearchQuery}
                    onSearchChange={setSetSearchQuery}
                    viewMode={setViewMode}
                    onViewModeChange={setSetViewMode}
                    placeholder={`Search in ${selectedProject?.title}...`}
                  />
                </div>

                <div
                  className={`w-full ${
                    setViewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                      : "flex flex-col gap-4 max-w-3xl w-full mx-auto"
                  }`}
                >
                  {filteredProjectSets.length > 0 ? (
                    filteredProjectSets.map((set) => (
                      <div
                        key={set.id}
                        onClick={() => onOpenSet(set)}
                        className={`bg-white rounded-4xl border border-gray-50 shadow-sm hover:shadow-md transition-all group cursor-pointer relative ${
                          setViewMode === "grid"
                            ? "p-6 flex flex-col"
                            : "p-4 pr-6 flex flex-row items-center gap-6"
                        }`}
                      >
                        {setViewMode === "grid" ? (
                          <>
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                <BookOpen className="w-6 h-6" />
                              </div>
                              <div className="relative group/setmenu">
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 text-gray-300 hover:text-gray-600 transition-colors"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                                <div className="absolute top-10 right-0 bg-white border border-gray-100 rounded-xl py-2 shadow-xl opacity-0 invisible group-hover/setmenu:opacity-100 group-hover/setmenu:visible transition-all z-20">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSet(set.id);
                                    }}
                                    className="w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
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
                          <>
                            <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-[#1a1a4b] mb-1 truncate">
                                {set.title}
                              </h3>
                              <p className="text-sm text-gray-400 font-medium truncate">
                                {set.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-8 shrink-0">
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>{set.cards.length} Cards</span>
                              </div>
                              <div className="relative group/setmenu">
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 text-gray-300 hover:text-gray-600 transition-colors"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                                <div className="absolute top-10 right-0 w-36 bg-white border border-gray-100 rounded-xl py-2 shadow-xl opacity-0 invisible group-hover/setmenu:opacity-100 group-hover/setmenu:visible transition-all z-20">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSet(set.id);
                                    }}
                                    className="w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Set
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <h3 className="text-2xl font-bold text-gray-400 mb-2">
                        No Flashcard Sets Here
                      </h3>
                      <p className="text-gray-400/80 font-medium mb-8">
                        Assign flashcard sets to this project in the creator or
                        library.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
