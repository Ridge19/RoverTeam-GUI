import asyncio
import logging
import subprocess
import re
import platform
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer

# ------------------------------------------------------------------
# CONFIG
# ------------------------------------------------------------------
HOST = "0.0.0.0"
PORT = 3001

pcs = set()
players = {}

IS_WINDOWS = platform.system() == "Windows"

# ------------------------------------------------------------------
# LOGGING
# ------------------------------------------------------------------
def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s"
    )

# ------------------------------------------------------------------
# WINDOWS CAMERA DISCOVERY (DirectShow)
# ------------------------------------------------------------------
def list_windows_cameras():
    cmd = [
        "ffmpeg",
        "-list_devices", "true",
        "-f", "dshow",
        "-i", "dummy"
    ]

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False
        )
    except FileNotFoundError:
        logging.error("FFmpeg not found in PATH")
        return []

    cameras = []

    for line in proc.stderr.splitlines():
        if not ("dshow" in line and "(video)" in line):
            continue

        logging.warning(line)
        match = re.search(r'"(.+)"', line)
        if match:
            cameras.append(match.group(1))

    return cameras

# ------------------------------------------------------------------
# HTTP HANDLERS
# ------------------------------------------------------------------
async def handle_cameras(request):
    cameras = list_windows_cameras()
    return web.json_response({
        "cameras": [
            {"id": i, "label": name}
            for i, name in enumerate(cameras)
        ]
    })

async def handle_ping(request):
    return web.Response(text="pong")

async def handle_offer(request):
    params = await request.json()
    camera_id = int(params.get("camera_id", 0))

    cameras = list_windows_cameras()
    if camera_id >= len(cameras):
        return web.Response(status=404, text="Camera not found")

    camera_name = cameras[camera_id]
    logging.info(f"Opening camera: {camera_name}")

    pc = RTCPeerConnection()
    pcs.add(pc)

    try:
        player = MediaPlayer(
            f"video={camera_name}",
            format="dshow",
            options={
                "video_size": "640x480",
                "framerate": "30"
            }
        )
        players[pc] = player
    except Exception as e:
        logging.error(f"Failed to open camera: {e}")
        return web.Response(status=500, text=str(e))

    if player.video:
        pc.addTrack(player.video)

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        logging.info(f"Connection state: {pc.connectionState}")
        if pc.connectionState in ("failed", "closed"):
            await cleanup_pc(pc)

    offer = RTCSessionDescription(
        sdp=params["sdp"],
        type=params["type"]
    )

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    })

# ------------------------------------------------------------------
# CLEANUP
# ------------------------------------------------------------------
async def cleanup_pc(pc):
    if pc in players:
        try:
            players[pc].stop()
        except Exception:
            pass
        del players[pc]

    await pc.close()
    pcs.discard(pc)

async def on_shutdown(app):
    await asyncio.gather(*(cleanup_pc(pc) for pc in list(pcs)))

# ------------------------------------------------------------------
# CORS MIDDLEWARE
# ------------------------------------------------------------------
@web.middleware
async def cors_middleware(request, handler):
    if request.method == "OPTIONS":
        return web.Response(
            status=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )

    response = await handler(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

# ------------------------------------------------------------------
# SERVER
# ------------------------------------------------------------------
if __name__ == "__main__":
    if not IS_WINDOWS:
        raise RuntimeError("This script is intended for Windows only")

    setup_logging()

    app = web.Application(middlewares=[cors_middleware])
    app.router.add_get("/cameras", handle_cameras)
    app.router.add_post("/offer", handle_offer)
    app.router.add_get("/ping", handle_ping)
    app.on_shutdown.append(on_shutdown)

    logging.info(f"Rover WebRTC Windows Server running on http://{HOST}:{PORT}")
    web.run_app(app, host=HOST, port=PORT)
