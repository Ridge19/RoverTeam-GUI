import { useState, useEffect } from "react";
import { useRoverUrl } from "./useRoverUrl";

export interface Camera {
  id: string;
  label: string;
}

export function useCameraList() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const url = useRoverUrl();

  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    async function fetchCameras() {
      try {
        const res = await fetch(`${url}/cameras`);
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        const data = await res.json();
        if (!cancelled) setCameras(data.cameras ?? []);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCameras();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { cameras, error, loading };
}