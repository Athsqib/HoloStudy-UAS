import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
import type { Project } from "../types";
import { ConfirmModal } from "./ConfirmModal";

export const ProtectedProjectRoute = ({
  projects,
  user,
  children,
}: {
  projects: Project[];
  user: User | null;
  children: (project: Project) => React.ReactNode;
}) => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const requestedProject = projects.find((p) => p.id === projectId);

  const isMissing = !requestedProject;
  const isUnauthorized =
    !!requestedProject && requestedProject.userId !== user?.uid;
  const [showAlert] = useState(isMissing || isUnauthorized);

  const message = isMissing
    ? "This project was not found."
    : "You do not have permission to view this project.";

  if (showAlert) {
    return (
      <ConfirmModal
        hideCancel
        isOpen
        title="Not Found"
        message={message}
        onConfirm={() => navigate("/projects", { replace: true })}
        onCancel={() => navigate("/projects", { replace: true })}
      />
    );
  }

  return <>{children(requestedProject!)}</>;
};
