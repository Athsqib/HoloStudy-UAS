import { useParams, Navigate } from "react-router-dom";
import type { User } from "firebase/auth";
import type { FlashcardSet } from "../types";

export const ProtectedSetRoute = ({
  sets,
  user,
  children,
}: {
  sets: FlashcardSet[];
  user: User | null;
  children: (set: FlashcardSet) => React.ReactNode;
}) => {
  const { setId } = useParams<{ setId: string }>();
  const requestedSet = sets.find((set) => set.id === setId);

  // If the set doesn't exist, or doesn't belong to the user (since the query only fetched their sets)
  if (!requestedSet) {
    return <Navigate to="/dashboard" replace />;
  }

  // Extra frontend authorization check
  if (requestedSet.userId !== user?.uid) {
    alert(
      "Unauthorized: You do not have permission to view this flashcard set.",
    );
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children(requestedSet)}</>;
};
