import { useSpectrometerData } from "@/hooks/science/useScienceTelemetry"
import styles from "./TelemetryWidget.module.scss"

const Spectrometer = () => {
  const spectrometerData = useSpectrometerData()

  // Downsample 288 channels into NUM_BARS display bins by averaging each bin.
  const NUM_BARS = 40
  const displayBars: number[] = Array.from({ length: NUM_BARS }, (_, barIdx) => {
    if (spectrometerData.length === 0) {
      // Fallback mock while no data has arrived yet
      const normalized = barIdx / NUM_BARS;
      const bell = Math.exp(-Math.pow(normalized - 0.5, 2) / 0.05);
      return (bell * 0.7 + 0.15) * 100;
    }
    const chunkSize = spectrometerData.length / NUM_BARS;
    const start = Math.floor(barIdx * chunkSize);
    const end = Math.floor((barIdx + 1) * chunkSize);
    const slice = spectrometerData.slice(start, end);
    const avg = slice.reduce((a, b) => a + b, 0) / (slice.length || 1);
    // Normalise: the Arduino uses 12-bit ADC (0-4095)
    return Math.min(100, (avg / 4095) * 100);
  });

  return (
    <div className={styles.SpectrometerWidget}>
      <h3>Light Spectrum{spectrometerData.length === 0 ? " (Waiting…)" : " (Live)"}</h3>
      <div className={styles.SpectrometerGraph}>
        {displayBars.map((height, i) => (
          <div key={i} style={{
            flex: 1,
            backgroundColor: `hsl(${(i / NUM_BARS) * 300}, 80%, 60%)`,
            height: `${Math.max(1, height)}%`,
            borderRadius: "2px 2px 0 0",
            transition: "height 0.15s ease"
          }} />
        ))}
      </div>
    </div>
  )
}

export default Spectrometer