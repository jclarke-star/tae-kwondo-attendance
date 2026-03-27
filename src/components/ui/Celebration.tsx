import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface CelebrationProps {
  text: string;
  onComplete: () => void;
}
export function Celebration({ text, onComplete }: CelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        {/* Background Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/40 backdrop-blur-sm"
        />
        {/* Geometric Shapes */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1.5, 0], 
              x: (Math.random() - 0.5) * 600, 
              y: (Math.random() - 0.5) * 800,
              rotate: Math.random() * 360 
            }}
            transition={{ duration: 2, ease: "easeOut" }}
            className={`absolute w-12 h-12 border-4 border-black rounded-xl ${
              ['bg-kidRed', 'bg-kidBlue', 'bg-kidYellow', 'bg-kidGreen'][i % 4]
            }`}
          />
        ))}
        {/* Text */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.2, 1], rotate: [0, -5, 5, 0] }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="relative px-10 py-6 bg-white border-[6px] border-black rounded-[40px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
        >
          <h1 className="text-5xl font-black italic tracking-tighter text-black text-center whitespace-nowrap">
            {text}
          </h1>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}