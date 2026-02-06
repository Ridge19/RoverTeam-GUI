import { useState, useEffect } from "react";

export enum URLType {
  CAMERAS,
  TELEMETRY
}

export function useRoverUrl(urlType: URLType = URLType.CAMERAS) {


  let port = 0
  switch(urlType){
    case URLType.CAMERAS: port = 3001; break;
    case URLType.TELEMETRY: port = 5005; break;
  }

  const hostname = typeof window === "undefined" ? "localhost" : (window.location.hostname || "localhost");
  const url = `http://${hostname}:${port}`;

  return url;
}