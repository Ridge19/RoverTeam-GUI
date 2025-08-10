

import Head from "next/head";
import { useState, useRef } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Extraction");
  const videoRef = useRef<HTMLVideoElement>(null);

  async function connectToRover() {
  const pc = new window.RTCPeerConnection();
  // Add a video transceiver so the SDP includes a video track
  pc.addTransceiver("video", { direction: "recvonly" });

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    // ICE candidate handling
    const iceCandidates = [];
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        iceCandidates.push(event.candidate);
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Use window.location.hostname for dynamic local network access
  const serverHost = window.location.hostname;
  const response = await fetch(`http://${serverHost}:3001/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: offer.sdp,
          type: offer.type,
        }),
      });
      const answer = await response.json();
      await pc.setRemoteDescription(new window.RTCSessionDescription(answer));
    } catch (err) {
      alert("Failed to connect to rover camera: " + err);
    }
  }

  return (
    <>
      <Head>
        <title>Rover GUI</title>
      </Head>
      <div className="rover-bg">
        <div className="rover-layout">
          {/* Sidebar */}
          <div className="rover-sidebar">
            <div className="rover-icon"><span>★</span></div>
            <div className="rover-icon"><span>▲</span></div>
            <div className="rover-icon"><span>●</span></div>
            <div className="rover-icon"><span>■</span></div>
          </div>
          {/* Main Content */}
          <div className="rover-main">
            {/* Navbar with tabs, left-aligned, no title or extra links */}
            <nav className="rover-navbar rover-navbar-left">
              <div className="rover-navbar-links">
                <a href="#" className="rover-navbar-link">Home</a>
                <a
                  href="#"
                  className={`rover-navbar-link rover-tab${activeTab === "Extraction" ? " rover-tab-active" : ""}`}
                  onClick={e => { e.preventDefault(); setActiveTab("Extraction"); }}
                  style={{ cursor: "pointer" }}
                >
                  Extraction
                </a>
                <a
                  href="#"
                  className={`rover-navbar-link rover-tab${activeTab === "Detection" ? " rover-tab-active" : ""}`}
                  onClick={e => { e.preventDefault(); setActiveTab("Detection"); }}
                  style={{ cursor: "pointer" }}
                >
                  Detection
                </a>
              </div>
            </nav>
            {/* Tab content below */}
            {activeTab === "Extraction" ? (
              <>
                <button onClick={connectToRover} style={{ marginBottom: 16 }}>Connect to Rover Camera</button>
                <video ref={videoRef} autoPlay playsInline style={{ width: 640, height: 480, background: "#000", marginBottom: 16 }} />
                <div className="rover-cameras-label">Cameras</div>
                <div className="rover-cameras-grid">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="rover-camera">Camera{i+1}</div>
                  ))}
                </div>
                <div className="rover-row">
                  <div className="rover-section">
                    <div className="rover-section-title">Auger</div>
                    <div className="rover-control-group">
                      <div>Vertical Stepper</div>
                      <div className="rover-control"></div>
                    </div>
                    <div className="rover-control-group rover-motor-row">
                      <div>Motor Speed</div>
                      <div className="rover-control rover-motor"></div>
                      <div>Direction</div>
                      <div className="rover-control rover-direction"></div>
                    </div>
                  </div>
                  <div className="rover-section">
                    <div className="rover-section-title">Water Collection</div>
                    <div className="rover-control-group">
                      <div>Heatpad</div>
                      <div className="rover-control"></div>
                    </div>
                    <div className="rover-control-group">
                      <div>Peltier</div>
                      <div className="rover-control"></div>
                    </div>
                  </div>
                  <div className="rover-visualizer">Visualizer?</div>
                </div>
              </>
            ) : (
              <>
                <div className="rover-cameras-label">Detection Tab Content</div>
                <div style={{ textAlign: "center", marginTop: 40, fontSize: 20 }}>
                  {/* Placeholder for detection tab UI */}
                  Detection controls and content go here.
                </div>
              </>
            )}
          </div>
          {/* Right Sidebar */}
          <div className="rover-rightbar">
            <div className="rover-clock">Clock</div>
            <div className="rover-temperatures">Temperatures</div>
          </div>
        </div>
      </div>
    </>
  );
}