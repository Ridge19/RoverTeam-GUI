import asyncio
import logging
import os
from aiortc import VideoStreamTrack
from av import VideoFrame
import numpy as np
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer
import shared_state
from spectroscopy import handle_measure # Import the measurement handler for spectroscopy

# Listen on all interfaces so LAN devices can connect
HOST = "0.0.0.0"
PORT = 3001

# Latest camera frame (shared with spectroscopy)
latest_frame = None
# Store active peer connections to prevent garbage collection
pcs = set()
# Store media players to stop them cleanly
players = {}

def setup_logging():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

# ---------------------------------------------------------
# FAST CAMERA SCAN (Restricted to Camera 0)
# ---------------------------------------------------------
# def list_camera_indices():
#     """Return only Camera 0 if it exists."""
#     logging.info("[Startup] Checking for Camera 0...")
    
#     # We strictly only want Camera 0
#     target_cam = 0
    
#     if os.path.exists(f"/dev/video{target_cam}"):
#         logging.info(f"Camera {target_cam} found.")
#         return [target_cam]
#     else:
#         logging.warning(f"Camera {target_cam} not found at /dev/video{target_cam}")
#         return []


# ---------------------------------------------------------
# FAST CAMERA SCAN (Restricted to Microscope Camera /dev/video4) - TESTING RIDGES PC
# ---------------------------------------------------------
def list_camera_indices():
    """Return only microscope camera /dev/video4 if it exists."""
    target_cam = 4
    logging.info(f"[Startup] Checking for Camera {target_cam} /dev/video{target_cam}...")

    if os.path.exists(f"/dev/video{target_cam}"):
        logging.info(f"Camera {target_cam} found.")
        return [target_cam]
    else:
        logging.warning(f"Camera {target_cam} not found at /dev/video{target_cam}")
        return []
    
# ---------------------------------------------------------
# VIDEO STREAM TRACK (Not used in current passthrough setup)
# ---------------------------------------------------------
class CameraTapTrack(VideoStreamTrack):
    """
    Wraps a MediaPlayer video track and copies frames
    for spectroscopy without reopening the camera.
    """
    def __init__(self, source_track):
        super().__init__()
        self.source = source_track

    async def recv(self):
        frame = await self.source.recv()
        shared_state.latest_frame = frame.to_ndarray(format="bgr24")
        return frame


# ---------------------------------------------------------
# CONNECTION HANDLER
# ---------------------------------------------------------
async def handle_offer(request):
    params = await request.json()
    # Default to 0, though the client should ideally send 0
    # camera_id = int(params.get("camera_id", 0))
    camera_id = int(params.get("camera_id", 4))  # Changed default to 4 for microscope camera (TESTING RIDGES PC)
    
    # Force check for index 0 specifically if you want to be strict,
    # or just check if the requested ID exists (as per logic below).
    if not os.path.exists(f"/dev/video{camera_id}"):
        return web.Response(status=404, text=f"Camera {camera_id} not found")

    pc = RTCPeerConnection()
    pcs.add(pc)

    # --- PASSTHROUGH CONFIGURATION (YUYV @ 25 FPS) ---
    # We request YUYV422 from the camera.
    # Note: YUYV is uncompressed. AIORTC will handle encoding it 
    # to H.264/VP8 for the browser automatically.
    options = {
        "format": "v4l2", 
        "video_size": "640x480", 
        "framerate": "25",       # Changed from 30 to 25
        "input_format": "yuyv422" # Changed from mjpeg to yuyv422
    }

    try:
        logging.info(f"Opening Camera {camera_id} with options: {options}")
        player = MediaPlayer(f"/dev/video{camera_id}", format="v4l2", options=options)
        players[pc] = player
    except Exception as e:
        logging.error(f"Failed to open camera {camera_id}: {e}")
        return web.Response(status=500, text=str(e))

    # Add the track to the connection
    if player.video:
        tapped_track = CameraTapTrack(player.video)
        pc.addTrack(tapped_track)

    @pc.on("connectionstatechange")
    async def on_conn_change():
        if pc.connectionState in ("failed", "closed"):
            await cleanup_pc(pc)

    # Standard WebRTC Signaling
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])
    await pc.setRemoteDescription(offer)

    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type,
    })

async def cleanup_pc(pc):
    """Stop the media player and close the connection."""
    if pc in players:
        player = players[pc]
        if player:
            player.stop()
        del players[pc]
    
    await pc.close()
    pcs.discard(pc)

async def handle_cameras(request):
    cameras = list_camera_indices()
    return web.json_response({
        "cameras": [{"id": c, "label": f"Camera {c} (YUYV)"} for c in cameras]
    })

# ---------------------------------------------------------
# CORS MIDDLEWARE
# ---------------------------------------------------------
@web.middleware
async def cors_middleware(request, handler):
    if request.method == "OPTIONS":
        return web.Response(
            status=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            }
        )
    
    response = await handler(request)
    
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    
    return response

# ---------------------------------------------------------
# SERVER SETUP
# ---------------------------------------------------------
async def on_shutdown(app):
    coros = [cleanup_pc(pc) for pc in set(pcs)]
    await asyncio.gather(*coros)

if __name__ == "__main__":
    setup_logging()
    
    app = web.Application(middlewares=[cors_middleware])
    
    app.router.add_post("/offer", handle_offer)
    app.router.add_get("/cameras", handle_cameras)
    app.router.add_get("/measure", handle_measure)
    
    # Handle OPTIONS requests for all routes
    app.router.add_route("*", "/{tail:.*}", lambda request: web.Response(
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    ) if request.method == "OPTIONS" else web.Response(status=405))
    
    app.on_shutdown.append(on_shutdown)

    logging.info(f"YUYV WebRTC Server running on http://{HOST}:{PORT}")
    web.run_app(app, host=HOST, port=PORT)