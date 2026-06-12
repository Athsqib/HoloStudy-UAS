import { useState, useMemo } from "react";

export function useViewControls<T>(
  items: T[],
  filterFn: (item: T, query: string) => boolean,
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">(() =>
    window.innerWidth < 768 ? "list" : "grid",
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter((item) => filterFn(item, lowerQuery));
  }, [items, searchQuery, filterFn]);

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filteredItems,
  };
}
