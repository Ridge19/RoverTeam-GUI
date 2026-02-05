import React from 'react';
import { AxisTooltip } from './AxisTooltip';
import { InputHint } from './InputHint';

interface ControllerVisualProps {
    // Add props here
}

const ControllerVisual: React.FC<ControllerVisualProps> = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            width: 500
        }}>
            <AxisTooltip xAxisIndex={0} yAxisIndex={1} style={{marginRight: 30}}/>
            <AxisTooltip xAxisIndex={2} yAxisIndex={3} style={{marginRight: 30}}/>
        </div>
    );
};

export { ControllerVisual };