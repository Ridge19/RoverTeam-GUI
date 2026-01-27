import { useState, useEffect } from "react";

export interface Camera {
  id: string;
  label: string;
}

export function useCameraList() {
  const [roverUrl, setRoverUrl] = useState<string>("");
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AUTOMATIC LAN DETECTION
    // If you visit http://192.168.1.50:3000, this sets the API to http://192.168.1.50:3001
    const hostname =
      typeof window !== "undefined" ? window.location.hostname : "localhost";
    const url = `http://${hostname}:3001`;
    setRoverUrl(url);

    // Fetch cameras from that dynamically detected URL
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

    fetchCameras();
  }, []);

  return { roverUrl, cameras, error, loading };
}
