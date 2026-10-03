"use client";

import React, { useState } from "react";
import { motion, LayoutGroup } from "motion/react";
import { MoreHorizontal, ExternalLink, X } from "lucide-react";

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeCard = cards.find((c) => c.id === activeId);
  const secondaryCards = cards.filter((c) => c.id !== activeId);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setActiveId(null);
  };

  return (
    <LayoutGroup id="connected-apps-carousel">
      <div className="w-full flex items-center justify-center bg-transparent">
        <div
          className="w-full flex flex-col items-center justify-center select-none font-sans"
          onClick={handleBackgroundClick}
        >
          {/* Container */}
          <div className="w-full max-w-[380px] sm:max-w-md">
            <motion.div layout className="flex flex-col gap-2.5 sm:gap-3">
              {/* Expanded Card */}
              {activeCard && (
                <motion.div
                  key={activeCard.id}
                  layoutId={activeCard.id}
                  transition={SPRING_TRANSITION}
                  className={`relative flex w-full flex-col justify-between
                             rounded-[26px] sm:rounded-[30px] p-4 sm:p-5 text-white shadow-2xl
                             ${activeCard.color}
                             min-h-[160px] sm:min-h-[180px]`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <motion.div
                      layout="position"
                      className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shrink-0"
                    >
                      <activeCard.icon size={24} className="sm:size-7" />
                    </motion.div>

                    <div className="flex items-center gap-1.5">
                      <motion.button
                        layout="position"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenClick?.(activeCard);
                        }}
                        className="flex items-center gap-1.5 rounded-full bg-white/20
                                   px-3.5 py-1.5 sm:px-4 sm:py-2 font-semibold backdrop-blur-md 
                                   text-xs sm:text-sm whitespace-nowrap shadow-sm
                                   hover:bg-white/30 active:scale-95 transition-all"
                      >
                        Open <ExternalLink size={14} className="sm:size-4" />
                      </motion.button>
                      <motion.button
                        layout="position"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveId(null);
                        }}
                        className="flex items-center justify-center size-8 sm:size-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all backdrop-blur-md text-white"
                        aria-label="Close card"
                        title="Close"
                      >
                        <X size={16} />
                      </motion.button>
                    </div>
                  </div>

                  <motion.div layout="position" className="mt-4 overflow-hidden">
                    <motion.h3
                      layout="position"
                      className="text-xl sm:text-2xl font-bold opacity-95 leading-tight truncate"
                    >
                      {activeCard.title}
                    </motion.h3>
                    <motion.p
                      layout="position"
                      className="text-xs sm:text-sm font-medium opacity-80 mt-0.5 leading-snug line-clamp-2"
                    >
                      {activeCard.value}
                    </motion.p>
                  </motion.div>
                </motion.div>
              )}

              {/* Secondary Cards / Grid Layout */}
              {activeId ? (
                secondaryCards.length === 1 ? (
                  // Single secondary card: clean horizontal card spanning full width
                  <motion.div layout className="flex flex-col gap-2">
                    {secondaryCards.map((card) => (
                      <motion.div
                        key={card.id}
                        layoutId={card.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveId(card.id);
                        }}
                        transition={SPRING_TRANSITION}
                        className={`relative flex items-center justify-between cursor-pointer
                                   rounded-[20px] sm:rounded-[24px] px-3.5 py-2.5 sm:px-4 sm:py-3 text-white shadow-lg
                                   ${card.color} hover:brightness-105 active:scale-[0.98] transition-all`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <motion.div
                            layout="position"
                            className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-white/15 shrink-0 backdrop-blur-md"
                          >
                            <card.icon size={20} className="sm:size-5" />
                          </motion.div>
                          <motion.div layout="position" className="overflow-hidden">
                            <motion.h4
                              layout="position"
                              className="text-sm sm:text-base font-semibold leading-tight truncate"
                            >
                              {card.title}
                            </motion.h4>
                            <motion.p
                              layout="position"
                              className="text-xs sm:text-sm font-medium text-white/75 truncate mt-0.5"
                            >
                              {card.value}
                            </motion.p>
                          </motion.div>
                        </div>

                        <motion.div
                          layout="position"
                          className="rounded-full bg-white/15 p-1.5 shrink-0 text-white/90"
                        >
                          <MoreHorizontal size={16} />
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  // Multiple secondary cards: responsive grid
                  <motion.div
                    layout
                    className={`grid gap-2.5 sm:gap-3 ${
                      secondaryCards.length === 2 ? "grid-cols-2" : "grid-cols-3"
                    }`}
                  >
                    {secondaryCards.map((card) => (
                      <motion.div
                        key={card.id}
                        layoutId={card.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveId(card.id);
                        }}
                        transition={SPRING_TRANSITION}
                        className={`relative flex flex-col justify-between cursor-pointer
                                   rounded-[20px] sm:rounded-[24px] p-3 sm:p-3.5 text-white shadow-lg
                                   ${card.color} h-24 sm:h-28 hover:brightness-105 active:scale-[0.98] transition-all`}
                      >
                        <div className="flex justify-between items-start">
                          <motion.div layout="position" className="shrink-0">
                            <card.icon size={22} className="sm:size-6" />
                          </motion.div>
                          <motion.div
                            layout="position"
                            className="rounded-full bg-white/15 p-1 sm:p-1.5"
                          >
                            <MoreHorizontal size={14} className="sm:size-4" />
                          </motion.div>
                        </div>

                        <motion.div layout="position" className="mt-1 overflow-hidden">
                          <motion.h4
                            layout="position"
                            className="text-xs sm:text-sm font-semibold truncate leading-tight"
                          >
                            {card.title}
                          </motion.h4>
                          <motion.p
                            layout="position"
                            className="text-[11px] sm:text-xs text-white/75 truncate mt-0.5"
                          >
                            {card.value}
                          </motion.p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                )
              ) : (
                // Initial state: all cards in a 2-column grid
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
                        setActiveId(card.id);
                      }}
                      transition={SPRING_TRANSITION}
                      className={`relative flex flex-col justify-between cursor-pointer
                                 rounded-[22px] sm:rounded-[26px] p-3.5 sm:p-4 text-white shadow-lg
                                 ${card.color} h-28 sm:h-32 hover:brightness-105 active:scale-[0.98] transition-all`}
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
                          <MoreHorizontal size={16} />
                        </motion.div>
                      </div>

                      <motion.div layout="position" className="mt-2 overflow-hidden">
                        <motion.h4
                          layout="position"
                          className="text-sm sm:text-base font-semibold truncate leading-tight"
                        >
                          {card.title}
                        </motion.h4>
                        <motion.p
                          layout="position"
                          className="text-xs sm:text-sm font-medium text-white/75 truncate mt-0.5"
                        >
                          {card.value}
                        </motion.p>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
};