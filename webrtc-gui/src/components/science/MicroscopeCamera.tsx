import React, { useState, useEffect } from "react"
import { useCameraStreams } from "@/contexts/CameraStreamsContext";
import { CameraFeed } from "@/components/CameraFeed";
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
    return (
        <div className={styles.MicroscopeFeed}>
            {cameras[0] && <CameraFeed camera={cameras[0]}>
                {overlay && <MicroscopeOverlay />}
            </CameraFeed >}
            <div className={styles.VisibilityToggle}>
                <button onClick={handleToggle}>
                    {overlay ?
                        <img src="icons/visibility.svg" />
                        :
                        <img src="icons/visibility_off.svg" />
                    }
                </button>
            </div>
        </div >
    )
}

export default MicroscopeCamera