import React, { useRef, useEffect, useCallback } from "react";

interface SpectroscopyGraphProps {
  spectralChannels: number[];
  isLive: boolean;
}

const WAVELENGTH_MIN = 340;
const WAVELENGTH_MAX = 850;
const TICK_INTERVAL = 100; // nm between axis ticks

const SENSOR_BASELINE = 498;
const SPECTROMETER_MAX = 2930; // Known peak return of the spectrometer

/**
 * Isolates actual brightness signals by subtracting the sensor's baseline (dark current).
 * Clamps noise below the baseline to 0, then normalizes to the spectrometer's absolute maximum capacity.
 * 
 * @param values Raw spectrometer array data
 * @param baseline The average resting value of the sensor (498)
 * @param absoluteMax The absolute highest value the spectrometer returns (1530)
 * @param exponent 1.0 is linear (true physical brightness). < 1.0 boosts smaller peaks visually.
 */
function scaleSignal(
  values: number[],
  baseline: number = SENSOR_BASELINE,
  absoluteMax: number = SPECTROMETER_MAX,
  exponent = 1.0
): number[] {
  // 1. Calculate the maximum possible isolated photon signal
  const maxSignal = absoluteMax - baseline;

  // 2. Subtract the baseline to isolate the signal and normalize to 0.0 - 1.0 range
  return values.map((v) => {
    const signal = Math.max(0, v - baseline);
    // Cap at 1.0 in case of minor noise exceeding the theoretical max
    const normalized = Math.min(signal / maxSignal, 1.0);
    return Math.pow(normalized, exponent);
  });
}

const SpectroscopyGraph: React.FC<SpectroscopyGraphProps> = ({
  spectralChannels,
  isLive, // Usually used to trigger animations/state if needed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Layout constants
    const MARGIN_LEFT = 48; // Wide enough for 4-digit numbers (e.g. 1530)
    const MARGIN_RIGHT = 16;
    const MARGIN_TOP = 12;
    const MARGIN_BOTTOM = 36;
    const plotW = width - MARGIN_LEFT - MARGIN_RIGHT;
    const plotH = height - MARGIN_TOP - MARGIN_BOTTOM;

    // Background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);

    // --- Prepare data ---
    let data: number[];
    if (spectralChannels.length === 0) {
      // Demo / mock data generated to realistically fit within the 1530 max limit
      data = Array.from({ length: 288 }, (_, i) => {
        const t = i / 287;
        // Adjusted multipliers so the highest peak combined with baseline doesn't exceed ~1530
        const p1 = Math.exp(-Math.pow((t - 0.2) / 0.04, 2)) * 600;
        const p2 = Math.exp(-Math.pow((t - 0.45) / 0.06, 2)) * 300;
        const p3 = Math.exp(-Math.pow((t - 0.7) / 0.03, 2)) * 950;
        const p4 = Math.exp(-Math.pow((t - 0.85) / 0.05, 2)) * 250;

        // Add peaks to baseline, plus some +/- random baseline noise
        const baselineNoise = (Math.random() - 0.5) * 50;
        return SENSOR_BASELINE + p1 + p2 + p3 + p4 + baselineNoise;
      });
    } else {
      data = [...spectralChannels];
    }

    // Apply the fixed-scale scaling (0.0 = baseline, 1.0 = 1530)
    const scaledData = scaleSignal(data, SENSOR_BASELINE, SPECTROMETER_MAX);
    const numPoints = scaledData.length;

    // --- Draw grid lines ---
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = MARGIN_TOP + (plotH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(MARGIN_LEFT, y);
      ctx.lineTo(MARGIN_LEFT + plotW, y);
      ctx.stroke();
    }

    // --- Draw the continuous red line ---
    const getX = (idx: number) => MARGIN_LEFT + (idx / (numPoints - 1)) * plotW;
    const getY = (val: number) => MARGIN_TOP + plotH * (1 - val);

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(scaledData[0]));
    for (let i = 1; i < numPoints; i++) {
      ctx.lineTo(getX(i), getY(scaledData[i]));
    }
    ctx.strokeStyle = "#ff0000"; // Solid red color
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- Draw axes ---
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    // X axis
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT, MARGIN_TOP + plotH);
    ctx.lineTo(MARGIN_LEFT + plotW, MARGIN_TOP + plotH);
    ctx.stroke();
    // Y axis
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT, MARGIN_TOP);
    ctx.lineTo(MARGIN_LEFT, MARGIN_TOP + plotH);
    ctx.stroke();

    // --- X-axis labels (wavelength) ---
    ctx.fillStyle = "#888";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let wl = WAVELENGTH_MIN; wl <= WAVELENGTH_MAX; wl += TICK_INTERVAL) {
      const frac = (wl - WAVELENGTH_MIN) / (WAVELENGTH_MAX - WAVELENGTH_MIN);
      const x = MARGIN_LEFT + frac * plotW;
      // Tick mark
      ctx.beginPath();
      ctx.moveTo(x, MARGIN_TOP + plotH);
      ctx.lineTo(x, MARGIN_TOP + plotH + 5);
      ctx.strokeStyle = "#555";
      ctx.stroke();
      // Label
      ctx.fillText(`${wl}`, x, MARGIN_TOP + plotH + 8);
    }

    // nm unit label
    ctx.fillStyle = "#666";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText("nm", MARGIN_LEFT + plotW + 14, MARGIN_TOP + plotH + 8);

    // --- Y-axis labels (Raw Spectrometer Return) ---
    ctx.fillStyle = "#888";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= 4; i++) {
      // Calculate true brightness value mapping 0-4 ticks from BASELINE (498) to MAX (1530)
      const val = Math.round(SENSOR_BASELINE + (i / 4) * (SPECTROMETER_MAX - SENSOR_BASELINE));
      const y = MARGIN_TOP + plotH - (plotH * i) / 4;
      ctx.fillText(`${val}`, MARGIN_LEFT - 6, y);
    }
  }, [spectralChannels]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 240,
        borderRadius: 12,
        border: "1px solid #333",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
};

export default SpectroscopyGraph;