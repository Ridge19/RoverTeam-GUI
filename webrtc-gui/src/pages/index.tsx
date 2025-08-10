

import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Extraction");

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