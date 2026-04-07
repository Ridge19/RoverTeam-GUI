import React, { useEffect, useRef } from "react";

interface ModalProps {
    open: boolean;
    onClose: (action: string) => void;
    title?: string;
    actions?: string[];
    children: React.ReactNode;
}

export function Modal({ open, onClose, title, actions = ["Close"], children }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Escape key handler
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && actions.includes("Close")) {
                onClose("Close");
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, actions, onClose]);

    if (!open) return null;

    // Background click handler
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            if (actions.includes("Close")) onClose("Close");
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="rounded-2xl p-6 w-[420px] shadow-xl"
                style={{ backgroundColor: "#444" }}
            >
                {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
                {children}
                <div className="flex flex-row gap-3">
                    {actions.map((a) => (
                        <button
                            key={a}
                            onClick={() => onClose(a)}
                            className="mt-4 w-full bg-black text-white py-2 rounded-xl cursor-pointer"
                        >
                            {a}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}