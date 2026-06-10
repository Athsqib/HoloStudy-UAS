import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import type { User } from "firebase/auth";
import { db, handleFirestoreError, OperationType, auth } from "./lib/firebase";
import { Sidebar } from "./component/Sidebar";
import { Header } from "./component/Header";
import { Dashboard } from "./component/Dashboard";
import { Library } from "./component/Library";
import { CreateFlashcard } from "./component/CreateFlashcard";
import { Projects } from "./component/Projects";
import { AuthScreen } from "./component/AuthScreen";
import type { FlashcardSet, Project } from "./types";
import { SetDetail } from "./component/SetDetail";
import { ProtectedSetRoute } from "./component/ProtectedSetRoute";
import { ProtectedProjectRoute } from "./component/ProtectedProjectRoute";
import { ProjectDetail } from "./component/ProjectDetail";
import { ConfirmModal } from "./component/ConfirmModal";
import { Footer } from "./component/Footer";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [editingSet, setEditingSet] = useState<FlashcardSet | null>(null);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "set" | "project" | null;
    id: string | null;
  }>({ isOpen: false, type: null, id: null });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // If they log out, immediately clear their data from the screen
      if (!currentUser) {
        setFlashcardSets([]);
        setProjects([]);
        setDataLoading(false);
      }

      // Stop the global loading spinner
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "flashcardSets"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        const sets: FlashcardSet[] = [];
        snapshot.forEach((doc) => {
          sets.push(doc.data() as FlashcardSet);
        });
        setFlashcardSets(
          sets.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        );
        setDataLoading(false);
      },
      error: (err) => {
        handleFirestoreError(err, OperationType.LIST, "flashcardSets");
        setDataLoading(false);
      },
    });
    return () => unsubscribe();
  }, [user]);

  // Projects Listener (no user filter)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "projects"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        const projs: Project[] = [];
        snapshot.forEach((doc) => {
          projs.push(doc.data() as Project);
        });
        setProjects(
          projs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        );
      },
      error: (err) => {
        handleFirestoreError(err, OperationType.LIST, "projects");
      },
    });
    return () => unsubscribe();
  }, [user]);

  const handleSaveSet = async (set: FlashcardSet) => {
    if (!user) return;
    const isDuplicate = flashcardSets.some(
      (s) =>
        s.title.toLowerCase() === set.title.trim().toLowerCase() &&
        s.id !== set.id,
    );
    if (isDuplicate) {
      alert(
        "A flashcard set with this name already exists! Please choose a different name.",
      );
      return; // Stops the save process so the user can rename it
    }
    try {
      const setToSave = { ...set, userId: user.uid };
      await setDoc(doc(db, "flashcardSets", set.id), setToSave);
      setEditingSet(null);
      navigate(`/set/${set.id}`);
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `flashcardSets/${set.id}`,
      );
    }
  };

  const handleSaveProject = async (project: Project) => {
    if (!user) return;
    try {
      const projectToSave = { ...project, userId: user.uid };
      await setDoc(doc(db, "projects", project.id), projectToSave);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${project.id}`);
    }
  };

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        if (user.isAnonymous) {
          // Completely deletes the guest account from Firebase Auth
          await deleteUser(user);
        } else {
          // Just logs out normally for registered users
          await signOut(auth);
        }
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handleOpenSet = (set: FlashcardSet) => {
    navigate(`/set/${set.id}`);
  };

  const handleDeleteSet = (setId: string) => {
    setDeleteModal({ isOpen: true, type: "set", id: setId });
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteModal({ isOpen: true, type: "project", id: projectId });
  };

  const executeDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;

    try {
      if (deleteModal.type === "set") {
        await deleteDoc(doc(db, "flashcardSets", deleteModal.id));
      } else if (deleteModal.type === "project") {
        await deleteDoc(doc(db, "projects", deleteModal.id));
      }
    } catch (err) {
      const collectionName =
        deleteModal.type === "set" ? "flashcardSets" : "projects";
      handleFirestoreError(
        err,
        OperationType.DELETE,
        `${collectionName}/${deleteModal.id}`,
      );
    } finally {
      setDeleteModal({ isOpen: false, type: null, id: null });
    }
  };

  const navigateToCreate = () => {
    setEditingSet(null);
    navigate("/create");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#6c7df3] rounded-full animate-spin" />
      </div>
    );
  }

  const currentTab = location.pathname.replace("/", "") || "dashboard";

  const renderContent = () => {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              user={user}
              sets={flashcardSets}
              onOpenSet={handleOpenSet}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              user={user}
              sets={flashcardSets}
              onOpenSet={handleOpenSet}
              onViewAll={() => navigate("/library")}
            />
          }
        />

        <Route
          path="/projects"
          element={
            <Projects
              projects={projects}
              sets={flashcardSets}
              onSaveProject={handleSaveProject}
              onOpenSet={handleOpenSet}
              onDeleteProject={handleDeleteProject}
              onDeleteSet={handleDeleteSet}
            />
          }
        />

        <Route
          path="/library"
          element={
            <Library
              sets={flashcardSets}
              projects={projects}
              onCreateFirst={navigateToCreate}
              onOpenSet={handleOpenSet}
              onDeleteSet={handleDeleteSet}
            />
          }
        />

        <Route
          path="/create"
          element={
            <CreateFlashcard
              initialSet={editingSet}
              projects={projects}
              onSave={handleSaveSet}
              onDiscard={() => {
                setEditingSet(null);
                navigate("/library");
              }}
            />
          }
        />

        <Route
          path="/set/:setId"
          element={
            <ProtectedSetRoute sets={flashcardSets} user={user}>
              {(authorizedSet) => (
                <SetDetail
                  set={authorizedSet}
                  projects={projects}
                  onSave={handleSaveSet}
                />
              )}
            </ProtectedSetRoute>
          }
        />

        <Route
          path="/project/:projectId"
          element={
            <ProtectedProjectRoute projects={projects} user={user}>
              {(authorizedProject) => (
                <ProjectDetail
                  project={authorizedProject}
                  sets={flashcardSets}
                  onOpenSet={handleOpenSet}
                />
              )}
            </ProtectedProjectRoute>
          }
        />

        {/* Fallback route */}
        <Route
          path="*"
          element={
            <Dashboard
              user={user}
              sets={flashcardSets}
              onOpenSet={handleOpenSet}
            />
          }
        />
      </Routes>
    );
  };

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <AuthScreen />}
        />
        <Route
          path="*"
          element={
            !user ? (
              // If not logged in, kick them back to login
              <Navigate to="/login" />
            ) : dataLoading ? (
              // Spinner Indicator
              <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#6c7df3] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="min-h-screen h-dvh w-full bg-[#fafbfc] font-sans text-[#2d2d66] overflow-x-hidden">
                <Sidebar
                  activeTab={currentTab}
                  onTabChange={(tab) => {
                    if (tab === "create") {
                      setEditingSet(null);
                    }
                    navigate(`/${tab}`);
                  }}
                  isOpen={isSidebarOpen}
                  onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? "md:ml-20" : "ml-0"
                  }`}
                >
                  <Header
                    user={user}
                    onLogoClick={() => navigate("/dashboard")}
                    onLogout={handleLogout}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  />
                  <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-16 md:pb-0">
                    {renderContent()}
                    <Footer />
                  </main>
                </div>
              </div>
            )
          }
        />
      </Routes>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={
          deleteModal.type === "project"
            ? "Delete Project?"
            : "Delete Flashcard Set?"
        }
        message={
          deleteModal.type === "project"
            ? "Are you sure you want to delete this project? All associated sets will remain but will be unassigned."
            : "Are you sure you want to delete this flashcard set? This action cannot be undone."
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={executeDelete}
        onCancel={() => setDeleteModal({ isOpen: false, type: null, id: null })}
      />
    </>
  );
}
