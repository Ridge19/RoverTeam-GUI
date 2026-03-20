import React, { useEffect } from "react"
import { useCameraStreams } from "@/contexts/CameraStreamsContext";
import { CameraFeed } from "@/components/CameraFeed";
import MicroscopeOverlay from "@/components/science/MicroscopeOverlay";
import styles from "./TelemetryWidget.module.scss"

const MicroscopeCamera = () => {
    const { cameras, loading, fetchCameras } = useCameraStreams();

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
                <MicroscopeOverlay />
            </CameraFeed >}
        </div>
    )
}

export default MicroscopeCamera