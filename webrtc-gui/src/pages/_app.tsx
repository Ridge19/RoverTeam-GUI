import { TelemetryProvider } from "@/contexts/TelemetryContext";
import { CameraStreamsProvider } from "@/providers/CameraStreamsProvider";
import { GamepadProvider } from "@/contexts/HardwareControl/GamepadContext"
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { EndpointProvider } from "@/contexts/EndpointContext";

export default function App({ Component, pageProps }: AppProps) {
return (
    <EndpointProvider>
      <CameraStreamsProvider>
        <TelemetryProvider>
          <GamepadProvider>
            <Component {...pageProps} />
          </GamepadProvider>
        </TelemetryProvider>
      </CameraStreamsProvider>
    </EndpointProvider>
  );
}
