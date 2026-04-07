import React, { memo, useRef, useLayoutEffect, useState } from "react";
import { useTelemetryContext } from "@/contexts/TelemetryContext";

interface MicroscopeOverlayProps {
    verticalFOV?: number; // degrees of vertical field of view
}

const MicroscopeOverlay: React.FC = memo(() => {
    const currentZoom = 15;
    const color = "#00ff88";

    return (
        <svg
            // Use 100% so it always matches the container, regardless of the aspect ratio
            width="100%"
            height="100%"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                pointerEvents: "none"
            }}
            viewBox="0 0 800 600" // Set a fixed internal coordinate system
            preserveAspectRatio="none" // Forces it to stretch to fill the 4:3 area
        >
            {/* Position relative to the viewBox units (800, 600) */}
            <g transform="translate(20, 600)">
                <text fill={color} fontSize="2.5rem" fontFamily="monospace" fontWeight="bold">
                    {`X ${currentZoom.toFixed(1)}`}
                </text>
                <line transform="translate(50, -50)" x1="0" y1="5" x2="60" y2="5" stroke={color} strokeWidth="10" />
                <text x="150" y="0" fill={color} fontSize="2.5rem">mm</text>
            </g>
        </svg>
    );
});
export default MicroscopeOverlay