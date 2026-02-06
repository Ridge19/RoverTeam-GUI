// File: components/Modal.tsx
import React from "react";


interface ModalProps {
    open: boolean;
    onClose: (action: string) => void;
    title?: string;
    actions?: string[]
    children: React.ReactNode;
}


export function Modal({ open, onClose, title, actions = ["Close"], children }: ModalProps) {
    if (!open) return null;


    return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="rounded-2xl p-6 w-[420px] shadow-xl" style={{ backgroundColor: "#444" }}>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        {children}
        <div className="flex flex-row gap-3">
            {actions.map(a => (
                <button
                    onClick={()=>onClose(a)}
                    className="mt-4 w-full bg-black text-white py-2 rounded-xl cursor-pointer"
                >{a}</button>
            ))}
        </div>
        </div>
    </div>
    );
}