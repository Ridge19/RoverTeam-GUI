import { TelemetryProvider } from "@/contexts/TelementryContext";
import { useRoverUrl } from "@/hooks/useRoverUrl";
import { CameraStreamsProvider } from "@/providers/CameraStreamsProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const baseUrl = useRoverUrl()
  
  return (
    <CameraStreamsProvider baseUrl={baseUrl}>
      <TelemetryProvider>
        <Component {...pageProps} />
      </TelemetryProvider>
    </CameraStreamsProvider>
  );
}
