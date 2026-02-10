import React from 'react';

export type StatusColor = 'success' | 'disabled' | 'warning' | 'error';

interface StatusChipProps {
    color: StatusColor;
    label?: string;
    noDot?: boolean;
    compact?: boolean;
    onClick?: () => void
}

const StatusChip: React.FC<StatusChipProps> = ({ color, label, noDot, onClick }) => {
    const statusColors = {
        success: 'bg-green-600',
        disabled: 'bg-gray-400',
        warning: 'bg-yellow-600',
        error: 'bg-red-500',
    };

    return (
        <div onClick={onClick} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusColors[color]} cursor-${onClick ? "pointer" : "default"}`}>
            {!noDot && <div className="w-2 h-2 bg-white rounded-full"></div>}
            <span className="text-white text-sm font-medium">{label || color}</span>
        </div>
    );
};

export default StatusChip;