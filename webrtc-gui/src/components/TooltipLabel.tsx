import React from 'react';

interface TooltipLabelProps {
    label: string;
    children: React.ReactNode;
}

const TooltipLabel: React.FC<TooltipLabelProps> = ({ label, children }) => {
    return (
        <div className="flex flex-row gap-1" style={{background: 'rgba(0, 0, 0, 0.5)', padding: '10px', borderRadius: '8px', width: 'fit-content', justifyContent: 'center', alignItems: 'center'}}>
            <span className="">{children}</span>
            <span className="">{label}</span>
        </div>
    );
};

export {TooltipLabel};