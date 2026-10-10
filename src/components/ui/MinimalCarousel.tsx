"use client";

import React from "react";
import { motion, LayoutGroup } from "motion/react";
import { ExternalLink } from "lucide-react";

/* --- Types --- */
export interface CarouselCard {
  id: string;
  title: string;
  value: string;
  color: string;
  icon: React.ElementType;
}

interface MinimalCarouselProps {
  cards: CarouselCard[];
  onOpenClick?: (card: CarouselCard) => void;
}

const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};

export const MinimalCarousel: React.FC<MinimalCarouselProps> = ({
  cards,
  onOpenClick,
}) => {
  return (
    <LayoutGroup id="connected-apps-carousel">
      <div className="w-full flex items-center justify-center bg-transparent">
        <div className="w-full flex flex-col items-center justify-center select-none font-sans">
          <div className="w-full max-w-[380px] sm:max-w-md">
            <motion.div
              layout
              className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full"
            >
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenClick?.(card);
                  }}
                  transition={SPRING_TRANSITION}
                  className={`relative flex flex-col justify-between cursor-pointer
                             rounded-[22px] sm:rounded-[26px] p-3.5 sm:p-4 text-white shadow-lg
                             ${card.color} h-[130px] sm:h-[144px] hover:brightness-105 active:scale-[0.98] transition-all`}
                >
                  <div className="flex justify-between items-start">
                    <motion.div
                      layout="position"
                      className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-white/15 shrink-0 backdrop-blur-md"
                    >
                      <card.icon size={22} className="sm:size-6" />
                    </motion.div>
                    <motion.div
                      layout="position"
                      className="rounded-full bg-white/15 p-1 sm:p-1.5 text-white/90"
                    >
                      <ExternalLink size={16} />
                    </motion.div>
                  </div>

                  <motion.div layout="position" className="mt-2 overflow-hidden flex-1 flex flex-col justify-end">
                    <motion.h4
                      layout="position"
                      className="text-sm sm:text-base font-semibold truncate leading-tight"
                    >
                      {card.title}
                    </motion.h4>
                    <motion.p
                      layout="position"
                      className="text-[11px] sm:text-xs font-medium text-white/80 line-clamp-2 mt-1 leading-snug"
                    >
                      {card.value}
                    </motion.p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
};