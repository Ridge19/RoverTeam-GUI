import React from 'react';
import { ControllerAxis } from './ControllerAxis';

interface ControllerVisualProps {
    // Add props here
}

const ControllerVisual: React.FC<ControllerVisualProps> = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            width: 300
        }}>
            <ControllerAxis axisLabel='LEFT_STICK' style={{marginRight: 30}}/>
            <ControllerAxis axisLabel='RIGHT_STICK'/>
        </div>
    );
};

export { ControllerVisual };