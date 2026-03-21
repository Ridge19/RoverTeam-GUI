import { useState } from "react";
import { CameraFeed } from "./CameraFeed";

export default function CameraViewer({ cameras = [] }) {
  const [index, setIndex] = useState(0);

  // No cameras → render nothing
  if (!cameras.length) return null;

  const prev = () => {
    setIndex((i) => (i - 1 + cameras.length) % cameras.length);
  };

  const next = () => {
    setIndex((i) => (i + 1) % cameras.length);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <CameraFeed camera={cameras[index]} />
        <div style={{ marginTop: 5, fontFamily: "monospace", display: "flex", flexDirection: "row", gap: 10 }}>
          <button style={{background: "#444", borderRadius: 5, cursor: "pointer"}} className="pl-2 pr-2" onClick={prev}>⬅</button>
          <div>{index + 1} / {cameras.length}</div>
          <button style={{background: "#444", borderRadius: 5, cursor: "pointer"}} className="pl-2 pr-2" onClick={next}>➡</button>
        </div>
      </div>      
    </div>
  );
}