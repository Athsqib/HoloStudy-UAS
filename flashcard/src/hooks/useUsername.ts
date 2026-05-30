import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export const useUsername = (user: User | null | undefined) => {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!user?.uid || user.isAnonymous) {
        setUsername(null);
        setIsLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsername();
  }, [user]);

  return { username, isLoading };
};
