import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
import type { FlashcardSet } from "../types";
import { ConfirmModal } from "./ConfirmModal";

export const ProtectedSetRoute = ({
  sets,
  user,
  children,
}: {
  sets: FlashcardSet[];
  user: User | null;
  children: (set: FlashcardSet) => React.ReactNode;
}) => {
  const navigate = useNavigate();
  const { setId } = useParams<{ setId: string }>();
  const requestedSet = sets.find((set) => set.id === setId);

  const isMissing = !requestedSet;
  const isUnauthorized = !!requestedSet && requestedSet.userId !== user?.uid;
  const [showAlert] = useState(isMissing || isUnauthorized);

  const message = isMissing
    ? "This flashcard set was not found."
    : "You do not have permission to view this flashcard set.";

  if (showAlert) {
    return (
      <ConfirmModal
        hideCancel
        isOpen
        title="Not Found"
        message={message}
        onConfirm={() => navigate("/dashboard", { replace: true })}
        onCancel={() => navigate("/dashboard", { replace: true })}
      />
    );
  }

  return <>{children(requestedSet!)}</>;
};
