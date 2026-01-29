import React from 'react';
import { ControllerAxis } from './ControllerAxis';
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
            <InputHint type='icon' content="inputprompts/ps/Default/playstation_trigger_l2.png" inputLabel='TRIG_LEFT'/>
            <ControllerAxis axisLabel='LEFT_STICK' style={{marginRight: 30}} label='L'/>
            <ControllerAxis axisLabel='RIGHT_STICK' label='R'/>
            <InputHint type='icon' content="inputprompts/ps/Default/playstation_trigger_r2.png" inputLabel='TRIG_RIGHT'/>
        </div>
    );
};

export { ControllerVisual };