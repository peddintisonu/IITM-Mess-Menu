import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageSquare, Menu, X } from "lucide-react";
import FeedbackCoachmark from "./FeedbackCoachmark";
import { CardsViewIcon } from "../ui/CardsViewIcon";

const FloatingActionButton = ({
    onClick,
    icon,
    ariaLabel,
    title,
    paddingClass = "p-3",
    extraClasses = "",
    enableGradient = false,
}) => {
    if (enableGradient) {
        return (
            <button
                onClick={onClick}
                aria-label={ariaLabel}
                title={title}
                className={`relative inline-flex items-center justify-center rounded-full p-[2.5px] shadow-lg hover:shadow-xl hover:scale-110 transition-transform overflow-hidden focus:outline-none group ${extraClasses}`}
            >
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#06b6d4_0%,#d946ef_33%,#f97316_66%,#06b6d4_100%)]" />
                <div className={`relative flex h-full w-full items-center justify-center rounded-full bg-primary text-white ${paddingClass}`}>
                    {icon}
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            title={title}
            className={`bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-transform flex items-center justify-center focus:outline-none ${paddingClass} ${extraClasses}`}
        >
            {icon}
        </button>
    );
};

const FloatingMenu = ({ 
    onOpenDonate, 
    onOpenFeedback,
    onOpenConnectedApps,
    showMenu = true,
    showDonate = true,
    showFeedback = true,
    showConnectedApps = true,
    enableMainGradient = false,
    enableFeedbackGradient = false,
    enableDonateGradient = false,
    enableConnectedAppsGradient = true,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isConnectedAppsActive, setIsConnectedAppsActive] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isExpanded]);

    if (!showMenu) return null;

    const handleConnectedAppsClick = () => {
        setIsConnectedAppsActive(true);
        onOpenConnectedApps?.();
        // Reset the animation after a short delay
        setTimeout(() => setIsConnectedAppsActive(false), 600);
    };

    return (
        <div ref={menuRef} className="fixed bottom-6 right-6 flex flex-col items-center gap-3 z-40">
            
            <FeedbackCoachmark isMenuExpanded={isExpanded} />
            
            {/* Feedback Button */}
            {showFeedback && (
                <div 
                    className={`transition-all duration-300 transform ${isExpanded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-50 pointer-events-none'} flex flex-col items-center gap-2`}
                >
                    <FloatingActionButton
                        onClick={() => { setIsExpanded(false); onOpenFeedback(); }}
                        icon={<MessageSquare size={20} />}
                        ariaLabel="Give Feedback"
                        title="Give Feedback"
                        paddingClass="p-3"
                        enableGradient={enableFeedbackGradient}
                    />
                </div>
            )}

            {/* Donate Button */}
            {showDonate && (
                <div 
                    className={`transition-all duration-300 transform ${isExpanded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-50 pointer-events-none'} flex flex-col items-center gap-2`}
                >
                    <FloatingActionButton
                        onClick={() => { setIsExpanded(false); onOpenDonate(); }}
                        icon={<Heart size={20} fill="currentColor" />}
                        ariaLabel="Support Us"
                        title="Support Us"
                        paddingClass="p-3"
                        enableGradient={enableDonateGradient}
                    />
                </div>
            )}

            {/* Main Toggle Button */}
            <FloatingActionButton
                onClick={() => setIsExpanded(!isExpanded)}
                icon={isExpanded ? (
                    <X size={20} className="animate-in fade-in zoom-in duration-300" />
                ) : (
                    <Menu size={20} className="animate-in fade-in zoom-in duration-300 group-hover:animate-pulse" />
                )}
                ariaLabel="Open Menu"
                paddingClass="p-4"
                enableGradient={enableMainGradient}
                extraClasses="z-50"
            />

            {/* Connected Apps Menu Button */}
            {showConnectedApps && (
                <FloatingActionButton
                    onClick={handleConnectedAppsClick}
                    icon={<CardsViewIcon isActive={isConnectedAppsActive} className="!h-5 !w-5 [&>span]:!size-[7px] [&>span]:!rounded-[2px]" />}
                    ariaLabel="Connected Apps"
                    title="Connected Apps"
                    paddingClass="p-3.5"
                    enableGradient={enableConnectedAppsGradient}
                />
            )}
        </div>
    );
};

export default FloatingMenu;
