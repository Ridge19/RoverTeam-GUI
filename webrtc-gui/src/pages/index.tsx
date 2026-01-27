import Head from "next/head";
import { Camera, useCameraList } from "@/hooks/useCameraList"; // or wherever you put it
import { CameraFeed } from "@/components/CameraFeed";
import { Header } from "@/components/Header";
import { useRoverUrl } from "@/hooks/useRoverUrl";

export default function Home() {
  const { cameras, error, loading } = useCameraList();
  const Roverurl = useRoverUrl();

  const TILE_WIDTH = 340;
  const GAP = 20;

  return (
    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header Component */}
      <Header/>

      <div style={{ color: "#888", fontSize: "0.9rem", marginBottom: 20 }}>
        {loading && " (Scanning...)"}
      </div>

      {error && (
        <div
          style={{
            padding: 20,
            background: "#522",
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <strong>System Error:</strong> {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, ${TILE_WIDTH}px)`,
          gap: GAP,
          margin: 20,
          justifyContent: "center",   // centers leftover tiles
        }}
      >
        {cameras
          .reduce<Camera[]>((acc, item) => {
            for (let i = 0; i <1; i++) acc.push(item);
            return acc;
          }, [])
          .map((cam, i) => (
            <div
              key={`${cam.id}-${i}`}
              style={{
                width: TILE_WIDTH,
              }}
            >
              <CameraFeed camera={cam} baseUrl={Roverurl} />
            </div>
          ))}

        {!loading && cameras.length === 0 && !error && (
          <p>No cameras detected on the rover.</p>
        )}
      </div>

    </div>
  );
}
