import React, { useState, useEffect } from "react"
import { useCameraStreams } from "@/contexts/CameraStreamsContext";
import CameraViewer from "@/components/CameraViewer";
import MicroscopeOverlay from "@/components/science/MicroscopeOverlay";
import styles from "./TelemetryWidget.module.scss"

const MicroscopeCamera = () => {
    const { cameras, loading, fetchCameras } = useCameraStreams();
    const [overlay, setOverlay] = useState<boolean>(true);


    const handleToggle = async () => {
        const nextState = !overlay;
        setOverlay(nextState);
    };

    useEffect(() => {
        let cancelled = false;

        const loadCameras = async () => {
            for (const cam of cameras) {
                await fetchCameras(cam.endpoint.replace(`:${cam.port}`, ""), cam.port);
            }
        };

        loadCameras();

        return () => {
            cancelled = true;
        };
    }, [cameras, fetchCameras]);

    const MicrosopeOverlay = (
        <MicroscopeOverlay />
    );
    return (
        <div className={styles.MicroscopeFeed}>
            {cameras[0] && <CameraViewer cameras={cameras as any} overlay={MicrosopeOverlay} >
                {overlay && <MicroscopeOverlay />}
            </CameraViewer >}
            <div className={styles.VisibilityToggle}>
                {/* <p>if you can read this you are STUPID</p> */}
                {/* <button onClick={handleToggle}>
                    {overlay ?
                        <img src="icons/visibility.svg" />
                        :
                        <img src="icons/visibility_off.svg" />
                    }
                </button> */}
            </div>
        </div >
    )
}

export default MicroscopeCamera