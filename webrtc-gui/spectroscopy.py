import cv2
import numpy as np
import io
import logging
import shared_state

from aiohttp import web
import base64
import matplotlib
matplotlib.use("Agg")          # Headless mode
import matplotlib.pyplot as plt

def analyze_moisture_from_frame(frame, dry_reference=130.0):
    mean_bgr = frame.mean(axis=(0, 1))
    B, G, R = mean_bgr
    mean_intensity = (R + G + B) / 3

    moisture_index = (dry_reference - mean_intensity) / dry_reference
    moisture_index = float(max(0.0, min(moisture_index, 1.0)))

    return {"R": float(R), "G": float(G), "B": float(B)}, moisture_index

async def handle_measure(request):
    try:
        if shared_state.latest_frame is None:
            return web.Response(status=503, text="No camera frame available yet")

        rgb, moisture_index = analyze_moisture_from_frame(shared_state.latest_frame)

        # --- Create a quick PNG graph in memory ---
        wavelengths = np.array([460, 530, 620])
        intensities = np.array([rgb["B"], rgb["G"], rgb["R"]])

        fig, ax = plt.subplots(figsize=(4, 2.5))
        ax.plot(wavelengths, intensities, "o-r")
        ax.set_xlabel("Wavelength (nm)")
        ax.set_ylabel("Intensity")
        ax.set_title(f"Approx. Spectrum – Moisture {moisture_index*100:.1f}%")
        buf = io.BytesIO()
        fig.tight_layout()
        fig.savefig(buf, format="png")
        plt.close(fig)
        buf.seek(0)
        png_b64 = base64.b64encode(buf.read()).decode("ascii")

        response = {
            "rgb": rgb,
            "moisture_index": moisture_index,
            "spectrum_plot": f"data:image/png;base64,{png_b64}",
        }
        return web.json_response(response)

    except Exception as e:
        logging.exception("Measurement failed")
        return web.Response(status=500, text=str(e))