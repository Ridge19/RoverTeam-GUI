import { useState, useEffect, useRef } from "react";
import { useRoverUrl } from "./useRoverUrl";

export type ConnectionStatus = "connected" | "disconnected" | "connecting";

// Singleton state outside of hook
let singletonInterval: NodeJS.Timeout | null = null;
let singletonStatus: ConnectionStatus = "disconnected";
let singletonSubscribers: ((status: ConnectionStatus) => void)[] = [];

export function useRoverWatchdog(onConnect?: () => void) {
  const [status, setStatus] = useState<ConnectionStatus>(singletonStatus);
  const roverUrl = useRoverUrl();
  const statusRef = useRef<ConnectionStatus>(singletonStatus);

  // Subscribe this component
  useEffect(() => {
    const subscriber = (s: ConnectionStatus) => {
      setStatus(s);
      if (statusRef.current !== "connected" && s === "connected") {
        onConnect?.();
      }
      statusRef.current = s;
    };
    singletonSubscribers.push(subscriber);

    return () => {
      singletonSubscribers = singletonSubscribers.filter((fn) => fn !== subscriber);
    };
  }, [onConnect]);

  useEffect(() => {
    if (!roverUrl) return;
    if (singletonInterval) return; // already running

    const ping = async () => {
      let prev = singletonStatus;
      singletonStatus = singletonStatus === "disconnected" ? "connecting" : singletonStatus;

      try {
        const res = await fetch(`${roverUrl}/ping`, { cache: "no-store" });
        if (!res.ok) throw new Error("Ping failed");
        singletonStatus = "connected";
      } catch {
        singletonStatus = "disconnected";
      }

      // Notify all subscribers
      singletonSubscribers.forEach((fn) => fn(singletonStatus));
      prev = singletonStatus;
    };

    // Immediate first ping
    ping();

    // Interval every 5 seconds
    singletonInterval = setInterval(ping, 5000);

    return () => {
      // Only clear if this was the last subscriber
      if (singletonSubscribers.length === 0 && singletonInterval) {
        clearInterval(singletonInterval);
        singletonInterval = null;
      }
    };
  }, [roverUrl]);

  // Optional method to manually trigger ping
  const checkStatus = () => {
    // Trigger singleton ping immediately
    if (!roverUrl) return statusRef.current;
    (async () => {
      try {
        const res = await fetch(`${roverUrl}/ping`, { cache: "no-store" });
        singletonStatus = res.ok ? "connected" : "disconnected";
      } catch {
        singletonStatus = "disconnected";
      }
      singletonSubscribers.forEach((fn) => fn(singletonStatus));
    })();
    return statusRef.current;
  };

  return { status, checkStatus };
}
