import React from 'react';
import { useSpectroTelemetry } from '@/hooks/science/useSpectroTelemetry';

const SpectrometerWidget: React.FC = () => {
    const data = useSpectroTelemetry();
    const channels: number[] = data?.channels || [];
    
    // Normalizing data points to draw an SVG line chart
    const width = 600;
    const height = 300;
    
    // We assume an ADC matching the 12-bit analogReadResolution (0 to 4095 MAX)
    // but scale up if the Arduino sends larger numbers. 
    const maxVal = Math.max(...channels.length > 0 ? channels : [1], 4096);
    
    const points = channels.map((val, idx) => {
        const x = (idx / Math.max(channels.length - 1, 1)) * width;
        const y = height - ((val / maxVal) * height);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div style={{ marginTop: '20px', padding: '16px', background: '#1e1e1e', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ color: "#aaa", marginBottom: '12px' }}>Live Spectrometer Feed</h3>
            <div style={{ width: '100%', height: `${height}px`, background: '#0a0a0a', borderRadius: '8px', overflow: 'hidden' }}>
                {channels.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
                        Waiting for data...
                    </div>
                ) : (
                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                        <polyline
                            fill="none"
                            stroke="#D6FF00"  // Bright, recognizable rover color
                            strokeWidth="2"
                            strokeLinejoin="round"
                            points={points}
                        />
                    </svg>
                )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#666', fontSize: '12px' }}>
                <span>Wavelength (0)</span>
                <span>Wavelength (288)</span>
            </div>
        </div>
    );
};

export default SpectrometerWidget;
