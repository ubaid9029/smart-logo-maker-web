import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GeometricCardLight } from "./GeometricCardLight";
import { OrangeCardDark } from "./OrangeCardDark";

const cards = [
  { id: 1, Component: GeometricCardLight },
  { id: 2, Component: OrangeCardDark },
];

export default function AnimatedCardMockup({ children, backgroundColor, accentColors = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Support cycling through multiple background colors
  const bgArray = Array.isArray(backgroundColor) ? backgroundColor : [backgroundColor];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 6000); // Increased delay to 6 seconds
    return () => clearInterval(timer);
  }, []);

  const CurrentCard = cards[currentIndex].Component;
  const bg = bgArray[currentIndex % bgArray.length];

  return (
    <div className="flex items-center justify-center overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.8
          }}
        >
          <CurrentCard backgroundColor={bg} accentColors={accentColors}>
            {children}
          </CurrentCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


