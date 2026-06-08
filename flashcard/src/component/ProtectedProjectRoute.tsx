import { useParams, Navigate } from "react-router-dom";
import type { User } from "firebase/auth";
import type { Project } from "../types";

export const ProtectedProjectRoute = ({
  projects,
  user,
  children,
}: {
  projects: Project[];
  user: User | null;
  children: (project: Project) => React.ReactNode;
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const requestedProject = projects.find((p) => p.id === projectId);

  if (!requestedProject) {
    return <Navigate to="/projects" replace />;
  }

  if (requestedProject.userId !== user?.uid) {
    alert("Unauthorized: You do not have permission to view this project.");
    return <Navigate to="/projects" replace />;
  }

  return <>{children(requestedProject)}</>;
};
