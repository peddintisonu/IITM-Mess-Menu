"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MinimalCarousel, type CarouselCard } from "../ui/MinimalCarousel";
import { Box, Layers } from "lucide-react";

const CONNECTED_APPS_CARDS: CarouselCard[] = [
  {
    id: "digimess",
    title: "DigiMess",
    value: "Stay updated with Menu",
    color: "bg-primary-500",
    icon: Box,
  },
  {
    id: "digievents",
    title: "DigiEvents",
    value: "Stay updated with Events",
    color: "bg-primary-700",
    icon: Layers,
  },
];

const CARD_ROUTES: Record<string, string> = {
  digimess: "/",
  digievents: "/events",
};

interface ConnectedAppsCarouselProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectedAppsCarousel: React.FC<ConnectedAppsCarouselProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleOpen = (card: CarouselCard) => {
    const route = CARD_ROUTES[card.id];
    if (route) {
      onClose();
      navigate(route);
    }
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Semi-transparent backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Carousel content */}
          <motion.div
            className="relative z-10 w-full max-w-[380px] sm:max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <MinimalCarousel
              cards={CONNECTED_APPS_CARDS}
              onOpenClick={handleOpen}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectedAppsCarousel;

