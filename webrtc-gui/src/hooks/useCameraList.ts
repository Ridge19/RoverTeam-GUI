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

  const fetchCameras = async () => {
      try {
        const res = await fetch(`${url}/cameras`);
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        const data = await res.json();
        setCameras(data.cameras || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    // Fetch cameras from that dynamically detected URL

    if(!url)return;

    fetchCameras();
  }, []);

  return { cameras, error, loading };
}
