import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Plus, Upload, FileText, Loader2, Sparkles, TextCursorInput, Printer } from "lucide-react";
import type { Flashcard, FlashcardSet, Project } from "../types";
import { EditableInput } from "./EditableInput";
import { EditableTextarea } from "./EditableTextarea";
import { SelectDropdown } from "./SelectDropdown";
import jsPDF from "jspdf";

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

  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [cardLimit, setCardLimit] = useState(10);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

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

  const handleGenerateFromFile = async () => {
    if (!file) return;
    setIsGenerating(true);
    setGenerateError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("limit", cardLimit.toString());

      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      const newCards: Flashcard[] = (data.flashcards || []).map(
        (fc: { front: string; back: string }) => ({
          id: Math.random().toString(36).slice(2, 11),
          front: fc.front || "",
          back: fc.back || "",
        }),
      );

      setCards((prev) => [...prev, ...newCards]);
      setFile(null);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromText = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    setGenerateError("");

    try {
      const response = await fetch(`${BACKEND_URL}/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, limit: cardLimit }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      const newCards: Flashcard[] = (data.flashcards || []).map(
        (fc: { front: string; back: string }) => ({
          id: Math.random().toString(36).slice(2, 11),
          front: fc.front || "",
          back: fc.back || "",
        }),
      );

      setCards((prev) => [...prev, ...newCards]);
      setInputText("");
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    const validCards = cards.filter(
      (c) => c.front.trim() !== "" || c.back.trim() !== "",
    );
    if (validCards.length === 0) return;

    const pdf = new jsPDF();
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxW = pageW - margin * 2;
    let y = margin;

    pdf.setFontSize(16);
    pdf.text(title || "Untitled Set", margin, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text(`Total cards: ${validCards.length}`, margin, y);
    y += 8;

    for (let i = 0; i < validCards.length; i++) {
      if (y > 270) {
        pdf.addPage();
        y = margin;
      }

      const card = validCards[i];
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      const header = `Card ${i + 1}`;
      pdf.text(header, margin, y);
      y += 7;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Front:", margin, y);
      y += 5;
      pdf.setFont("helvetica", "normal");
      const frontLines = pdf.splitTextToSize(card.front || "-", maxW - 5);
      frontLines.forEach((line: string) => {
        if (y > 275) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin + 5, y);
        y += 5;
      });
      y += 3;

      pdf.setFont("helvetica", "bold");
      pdf.text("Back:", margin, y);
      y += 5;
      pdf.setFont("helvetica", "normal");
      const backLines = pdf.splitTextToSize(card.back || "-", maxW - 5);
      backLines.forEach((line: string) => {
        if (y > 275) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin + 5, y);
        y += 5;
      });
      y += 6;

      if (i < validCards.length - 1) {
        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin, y - 3, pageW - margin, y - 3);
      }
    }

    pdf.save(`${title || "flashcards"}.pdf`);
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
        <div className="max-w-5xl mx-auto py-6 px-4 sm:py-100 sm:px-8 pb-32">
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
              <h2 className="text-2xl sm:text-4xl font-bold text-[#1a1a4b] mb-2 wrap-break-word break-all">
                {title || "Untitled Set"}
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed wrap-break-word max-w-3xl break-all">
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
                onClick={handleExportPDF}
                disabled={cards.filter((c) => c.front.trim() || c.back.trim()).length === 0}
                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                Export PDF
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
          <div className="bg-[#edf2f7]/50 rounded-4xl p-4 sm:p-8 mb-6 sm:mb-10 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
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
                maxLength={100}
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

          {/* Auto-Generate from File or Text */}
          <div className="bg-gradient-to-br from-[#f0f2ff] to-[#f8fafc] rounded-4xl p-4 sm:p-8 mb-6 sm:mb-10 border border-[#6c7df3]/10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#6c7df3]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#6c7df3]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a4b]">Auto-Generate Flashcards</h3>
                <p className="text-xs text-gray-500 font-medium">Upload a file or paste text to automatically create flashcards</p>
              </div>
            </div>

            <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 border border-gray-100 w-fit">
              <button
                onClick={() => setInputMode("file")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  inputMode === "file"
                    ? "bg-[#6c7df3] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                File
              </button>
              <button
                onClick={() => setInputMode("text")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  inputMode === "text"
                    ? "bg-[#6c7df3] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <TextCursorInput className="w-3.5 h-3.5" />
                Text
              </button>
            </div>

            {inputMode === "file" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                    Choose File
                  </label>
                  <div
                    onClick={() => document.getElementById("file-input")?.click()}
                    className={`w-full px-5 py-8 bg-white border-2 border-dashed rounded-xl cursor-pointer transition-all text-center ${
                      file
                        ? "border-[#6c7df3] bg-[#6c7df3]/5"
                        : "border-gray-200 hover:border-[#6c7df3]/40 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] || null);
                        setGenerateError("");
                      }}
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-6 h-6 text-[#6c7df3]" />
                        <span className="font-medium text-[#1a1a4b] text-sm truncate max-w-[300px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <Upload className="w-6 h-6 text-gray-300" />
                        <span className="text-sm font-medium text-gray-400">
                          Drop a file here or click to browse
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                      Max Cards
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={cardLimit}
                      onChange={(e) => setCardLimit(Math.max(1, Math.min(50, Number(e.target.value))))}
                      className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6c7df3]/20 focus:border-[#6c7df3] outline-none font-medium text-[#1a1a4b] shadow-sm text-center"
                    />
                  </div>
                  <button
                    onClick={handleGenerateFromFile}
                    disabled={!file || isGenerating}
                    className="px-6 py-3.5 bg-[#6c7df3] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-[#5a6be0] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                    Paste Your Text
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      setGenerateError("");
                    }}
                    placeholder="Paste or type the content you want to generate flashcards from..."
                    rows={5}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6c7df3]/20 focus:border-[#6c7df3] outline-none font-medium text-[#1a1a4b] resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                      Max Cards
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={cardLimit}
                      onChange={(e) => setCardLimit(Math.max(1, Math.min(50, Number(e.target.value))))}
                      className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6c7df3]/20 focus:border-[#6c7df3] outline-none font-medium text-[#1a1a4b] shadow-sm text-center"
                    />
                  </div>
                  <button
                    onClick={handleGenerateFromText}
                    disabled={!inputText.trim() || isGenerating}
                    className="px-6 py-3.5 bg-[#6c7df3] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-[#5a6be0] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {generateError && (
              <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-500">
                {generateError}
              </div>
            )}
          </div>

          {/* Cards List */}
          <div className="space-y-6 mb-10">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-4xl p-4 sm:p-8 border border-gray-50 shadow-sm relative group hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-4 sm:mb-8">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
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
                      className="w-full min-h-25 bg-transparent border-none focus:ring-0 text-base sm:text-lg font-bold text-[#1a1a4b] placeholder-gray-200 resize-none p-3"
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
                      className="w-full min-h-25 bg-transparent border-none focus:ring-0 text-base sm:text-lg font-bold text-[#1a1a4b] placeholder-gray-200 resize-none p-3"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Button */}
          <button
            onClick={addCard}
            className="w-full py-6 sm:py-12 rounded-4xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-[#6c7df3] hover:text-[#6c7df3] hover:bg-white transition-all group"
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
