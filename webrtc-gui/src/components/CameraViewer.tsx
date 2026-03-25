import React, { useState } from "react";
import { CameraFeed } from "./CameraFeed";
import { PropsWithChildren } from 'react';

type CameraPropsType = {
  cameras: [];
  overlaySVG?: React.ReactNode;
};

type CameraProps = PropsWithChildren<CameraPropsType>;

export default function CameraViewer({ cameras = [], overlaySVG }: CameraProps) {
  const [index, setIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  // No cameras → render nothing
  if (!cameras.length) return null;

  const prev = () => {
    setIndex((i) => (i - 1 + cameras.length) % cameras.length);
  };

  const next = () => {
    setIndex((i) => (i + 1) % cameras.length);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <CameraFeed camera={cameras[index]} showOverlay={showOverlay} setShowOverlay={setShowOverlay}> {showOverlay && overlaySVG} </CameraFeed>
        <div style={{ marginTop: 5, fontFamily: "monospace", display: "flex", flexDirection: "row", gap: 10 }}>
          <button style={{ background: "#444", borderRadius: 5, cursor: "pointer" }} className="pl-2 pr-2" onClick={prev}>⬅</button>
          <div>{index + 1} / {cameras.length}</div>
          <button style={{ background: "#444", borderRadius: 5, cursor: "pointer" }} className="pl-2 pr-2" onClick={next}>➡</button>
        </div>
      </div>
    </div>
  );
}