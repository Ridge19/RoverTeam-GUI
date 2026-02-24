import React, { useEffect, useRef, useState } from 'react';

interface ActuatorStatusProps {
    name: string;
    status: 'active' | 'inactive' | 'error';
    velocity?: number; // deg/s
    position?: number; // degrees
    maxVelocity?: number; // For scaling the velocity bar, default 100 deg/s
}

const ActuatorStatus: React.FC<ActuatorStatusProps> = ({
    name,
    status,
    velocity = 0,
    position,
    maxVelocity = 1
}) => {
    const [pos, setPos] = useState(position ?? 0); // displayed position

    const velocityRef = useRef(velocity);
    const lastTimeRef = useRef<number | null>(null);
    const posRef = useRef(position ?? 0);

    // Keep velocity updated without restarting loop
    useEffect(() => {
        velocityRef.current = velocity;
    }, [velocity]);

    // Update posRef if a new absolute position comes in
    useEffect(() => {
        if (position !== undefined) {
            posRef.current = position;
            setPos(position);
        }
    }, [position]);

    // Animation loop for integrating velocity when position is unavailable
    useEffect(() => {
        let frameId: number;

        const update = (time: number) => {
            if (lastTimeRef.current !== null) {
                const dtSeconds = (time - lastTimeRef.current) / 1000;

                // Only integrate if absolute position not provided
                if (position === undefined) {
                    posRef.current += velocityRef.current * dtSeconds;
                    setPos(posRef.current);
                }
            }

            lastTimeRef.current = time;
            frameId = requestAnimationFrame(update);
        };

        frameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frameId);
    }, [position]);

    const getVelocityStyle = () => {
        const clamped = Math.min(Math.abs(velocity / maxVelocity), 1); 
        const height = `${clamped * 50}%`;
        const isPositive = velocity >= 0;

        return {
            height,
            top: isPositive ? `calc(50% - ${height})` : '50%',
            bottom: isPositive ? 'auto' : undefined,
        };
    };

    return (
        <div className="border rounded-lg shadow-md p-4 flex items-center space-x-4 w-[260px]">

            <div className="relative w-2 h-16 bg-white border border-gray-300 rounded-sm overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 transform -translate-y-1/2"></div>
                <div
                    className="absolute left-0 right-0 bg-red-500"
                    style={getVelocityStyle()}
                ></div>
            </div>

            <div className="text-3xl relative w-16 h-16">
                <img
                    src="actuators/icon-outer.png"
                    alt="Outer part"
                    className="absolute inset-0 w-full h-full"
                />
                <img
                    src="actuators/icon-inner.png"
                    alt="Inner part"
                    className="absolute inset-0 w-full h-full transform"
                    style={{ transform: `rotate(${pos}deg)` }}
                />
            </div>

            <div className="flex-1">
                <h3 className="text-lg font-bold">{name}</h3>
                <p className="text-gray-600 text-sm truncate">
                    ω: {velocity.toFixed(2)} deg/s
                </p>
                <p className="text-gray-600 text-sm truncate">
                    θ: {pos.toFixed(3)} deg
                </p>
            </div>
        </div>
    );
};

export { ActuatorStatus };