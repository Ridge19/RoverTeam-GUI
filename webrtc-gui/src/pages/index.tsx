import Head from "next/head";
import { useCameraList } from "@/hooks/useCameraList"; // or wherever you put it
import { CameraFeed } from "@/components/CameraFeed";

export default function Home() {
  const { roverUrl, cameras, error, loading } = useCameraList();
  return (
    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "sans-serif",
        padding: 20,
      }}
    >
      <Head>
        <title>Rover Feed</title>
      </Head>

      <h1>Rover Command Center</h1>
      <div style={{ color: "#888", fontSize: "0.9rem", marginBottom: 20 }}>
        Target: {roverUrl}
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
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 20,
        }}
      >
        {cameras.map((cam) => (
          // KEY CHANGE: The Component handles the logic.
          // We pass the data down.
          <CameraFeed key={cam.id} camera={cam} baseUrl={roverUrl} />
        ))}

        {!loading && cameras.length === 0 && !error && (
          <p>No cameras detected on the rover.</p>
        )}
      </div>
    </div>
  );
}
