import { useCallback, useEffect, useState } from "react";
import { loadProgress } from "@/lib/gameProgress";

export function useGameProgress() {
  const [progress, setProgress] = useState(null);

  const reload = useCallback(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { progress, loading: progress === null, reload };
}