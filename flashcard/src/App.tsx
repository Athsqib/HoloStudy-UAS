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
import { onAuthStateChanged, signOut } from "firebase/auth";
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
    try {
      const setToSave = { ...set, userId: user.uid };
      await setDoc(doc(db, "flashcardSets", set.id), setToSave);
      setEditingSet(null);
      navigate("/library");
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

  const handleLogout = () => {
    signOut(auth);
  };

  const handleOpenSet = (set: FlashcardSet) => {
    setEditingSet(set);
    navigate("/create");
  };

  const handleDeleteSet = async (setId: string) => {
    if (!window.confirm("Are you sure you want to delete this flashcard set?"))
      return;
    try {
      await deleteDoc(doc(db, "flashcardSets", setId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `flashcardSets/${setId}`);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? All associated sets will remain but will be unassigned.",
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "projects", projectId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${projectId}`);
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
            <div className="min-h-screen bg-[#fafbfc] font-sans text-[#2d2d66] overflow-x-hidden">
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
                className={
                  "transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-20' : 'ml-0'}"
                }
              >
                <Header
                  user={user}
                  onLogoClick={() => navigate("/dashboard")}
                  onLogout={handleLogout}
                  isSidebarOpen={isSidebarOpen}
                  onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <main>{renderContent()}</main>
              </div>
            </div>
          )
        }
      />
    </Routes>
  );
}
