import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import type { Flashcard, FlashcardSet, Project } from "../types";
import { EditableInput } from "./EditableInput";
import { EditableTextarea } from "./EditableTextarea";
import { SelectDropdown } from "./SelectDropdown";

interface CreateFlashcardProps {
  initialSet?: FlashcardSet | null;
  projects: Project[];
  onSave: (set: FlashcardSet) => void;
  onDiscard: () => void;
}

export const CreateFlashcard = ({
  initialSet,
  projects,
  onSave,
  onDiscard,
}: CreateFlashcardProps) => {
  const [title, setTitle] = useState(initialSet?.title || "");
  const [description, setDescription] = useState(initialSet?.description || "");
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialSet?.projectId || "",
  );
  const [cards, setCards] = useState<Flashcard[]>(initialSet?.cards || []);

  const addCard = () => {
    setCards([
      ...cards,
      { id: Math.random().toString(36).slice(2, 11), front: "", back: "" },
    ]);
  };

  const removeCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  const updateCard = (id: string, field: "front" | "back", value: string) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleSave = () => {
    const validCards = cards.filter(
      (c) => c.front.trim() !== "" || c.back.trim() !== "",
    );
    const newSet: FlashcardSet = {
      id: initialSet?.id || Math.random().toString(36).slice(2, 11),
      title,
      description,
      cards: validCards,
      createdAt: initialSet?.createdAt || new Date().toISOString(),
      projectId: selectedProjectId || "",
    };
    onSave(newSet);
  };

  const projectOptions = useMemo(() => {
    return [
      { id: "", label: "Uncategorized" },
      ...projects.map((p) => ({ id: p.id, label: p.title })),
    ];
  }, [projects]);

  return (
    <div className="h-[calc(100vh-64px)] w-full p-4 lg:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full bg-[#f8fafc] border border-gray-100 rounded-[40px] shadow-sm overflow-y-auto no-scrollbar"
      >
        <div className="max-w-5xl mx-auto py-10 px-8 pb-32">
          {/* Header Navigation */}
          <button
            onClick={onDiscard}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#656799] transition-colors mb-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sets
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-[#1a1a4b] mb-2">
                {title || "Untitled Set"}
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                {description || "No description provided."}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={onDiscard}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-2.5 bg-[#6c7df3] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-[#5a6be0] transition-all active:scale-95"
              >
                Save Set
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-[#edf2f7]/50 rounded-4xl p-8 mb-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Set Title
              </label>
              <EditableInput
                type="text"
                value={title}
                isEditable={true}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter set title..."
                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6c7df3]/20 focus:border-[#6c7df3] outline-none font-medium text-[#1a1a4b] shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Project Folder (Optional)
              </label>
              <div className="h-13.5 flex items-stretch">
                <SelectDropdown
                  options={projectOptions}
                  value={selectedProjectId}
                  onChange={(val) => setSelectedProjectId(val)}
                  placeholder="Select a project..."
                  className="w-full flex"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Description
              </label>
              <EditableInput
                type="text"
                value={description}
                isEditable={true}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a short summary..."
                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6c7df3]/20 focus:border-[#6c7df3] outline-none font-medium text-[#1a1a4b] shadow-sm"
              />
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-6 mb-10">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-4xl p-8 border border-gray-50 shadow-sm relative group hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest rounded-lg">
                    Card {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => removeCard(card.id)}
                    className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Front
                    </label>
                    <EditableTextarea
                      placeholder="Enter question or term..."
                      value={card.front}
                      isEditable={true}
                      onChange={(e) =>
                        updateCard(card.id, "front", e.target.value)
                      }
                      className="w-full min-h-25 bg-transparent border-none focus:ring-0 text-lg font-bold text-[#1a1a4b] placeholder-gray-200 resize-none p-3"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Back
                    </label>
                    <EditableTextarea
                      placeholder="Enter answer or definition..."
                      value={card.back}
                      isEditable={true}
                      onChange={(e) =>
                        updateCard(card.id, "back", e.target.value)
                      }
                      className="w-full min-h-25 bg-transparent border-none focus:ring-0 text-lg font-bold text-[#1a1a4b] placeholder-gray-200 resize-none p-3"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Button */}
          <button
            onClick={addCard}
            className="w-full py-12 rounded-4xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-[#6c7df3] hover:text-[#6c7df3] hover:bg-white transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#6c7df3]/10 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">
              Add Another Card
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
