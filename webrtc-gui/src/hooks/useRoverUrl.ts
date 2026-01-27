import { useState, useEffect } from "react";

export function useRoverUrl() {

  const defaultPort = 3001;

  const hostname = typeof window === "undefined" ? "localhost" : (window.location.hostname || "localhost");
  const url = `http://${hostname}:${defaultPort}`;

  return url;
}
