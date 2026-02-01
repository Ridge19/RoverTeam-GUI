# Rover Team GUI

A GUI (Graphical User Interface) for the Rover Equinox - contains cameras, Arm controls, Telemetry and system vitals. 

## Information: 
rm -rf the myenv and make a new python3 env, then source it to avoid externally managed env error
use v4l2-ctl --list-devices to find video device indexes, and disable firewalls.

## Requirements

- pip (standard package manager for python)
```bash
  download: https://pypi.org/project/pip/
```
- python3 
```bash
  sudo apt install python3 
```
- nodeJS
```bash
  sudo apt install nodejs -y
```
- NPM (Node Package Manager) - YOU MUST INSTALL NODEJS FIRST >:(
```bash
  sudo apt install npm 
```

## Setup

Clone the project

```bash
  git clone https://github.com/RMIT-Rover-Team/RoverTeam-GUI
```

To setup this project, go to the ```webrtc-gui``` folder:
```bash
  /RoverTeam-GUI/webrtc-gui
```

Then, run the virtual python environment using the command:
```bash
  source myenv/bin/activate
```

Then, install the requirements.txt file - This contains all the python libraries needed to run the WebRTC server:
```bash
  pip install -r requirements.txt
```

Then, for the Web Application which runs the GUI, install npm: 
```bash
  npm install 
```

## Run Locally

after installing all the packages and setting up the virtual environment, run the command:
```bash
  npm run dev
```
you should see this in the terminal: 
```bash
  
> webrtc-gui@0.1.0 dev
> next dev --turbopack

⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of /home/ridge/RMIT/Rover/RoverTeam-GUI/package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles: 
   * /home/ridge/RMIT/Rover/RoverTeam-GUI/webrtc-gui/package-lock.json

▲ Next.js 16.1.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://10.132.101.24:3000

✓ Starting...
✓ Ready in 397ms
 GET / 200 in 100ms (compile: 79ms, render: 20ms)
```
to access the gui, ctrl+click on the network or localhost link shown above. 

## Run the WebRTC Server 
after running the GUI, run the WebRTC Python server using this command: 
```bash
  python3 rover_webrtc.py
```
you should see this in the terminal: 
```bash
  2026-02-01 15:09:27,983 INFO Rover WebRTC Server running on http://0.0.0.0:3001
======== Running on http://0.0.0.0:3001 ========
(Press CTRL+C to quit)
```

## How WebRTC Works with the Rover

-- NOTE: THIS SECTION IS TECHNICAL AND WILL THROW BIG WORDS AT YOU. keep up ;) --

This uses a real time streaming protocol called **WebRTC**, owned by Google. It's a new protocol used by popular voice applications like Google Meet, Discord, WhatsApp, etc. due to minimal latency and support for live streaming with video. This is what we use to communicate to the rover's cameras via radio.

It uses the **ICE (Interactive Connectivity Establishment)** framework which coordinates **STUN** and **TURN** (Session Traversal Utilities for NAT, Traversal Using Relays around NAT - NAT - Network Address Translation) which helps the discovery of public IP addresses to enable direct communication (also known as direct peer-to-peer connection).

The file responsible for all this magic is `rover_webrtc.py`, a Python script which uses the above methods to stream the camera connections via WebRTC. This script is located on the Raspberry Pi and acts as a "Host", and the file `index.tsx` (made using react - typescript) views the feed live.

Your computer, which is connected to the rover via radio, acts as a "client" and translates the NAT communication, which allows for real time video streaming to the cameras on the rover.

For my visual learners, see the diagram attached. **A** would be the client (e.g. someone's laptop) and **B** would be the Raspberry Pi.

![WebRTC Architecture Diagram](webrtc-gui/public/ivrpowers-turn-stun-screen.005.jpeg)

## Windows Support

Limited backend windows support is available to assist with UI development on Windows platforms. It allows streaming webcam data from a Windows device to the front-end.

To use, ensure [FFmpeg](https://www.ffmpeg.org/) is installed on your device, and is available in the `PATH` directory.

Instead of running `rover_webrtc.py`, run `rover_webrtc_windows.py` instead. *(see ['Connecting Cameras'](#HeadingConnectingCameras) above )*

## Learn More

To learn more about Next.js and WebRTC, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.
- [WebRTC Documentation](https://webrtc.org/getting-started/overview) - learn about real-time streaming and peer-to-peer connections.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
