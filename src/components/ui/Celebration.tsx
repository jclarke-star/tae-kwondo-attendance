import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface CelebrationProps {
  text: string;
  subtext?: string;
  onComplete: () => void;
}
export function Celebration({ text, subtext, onComplete }: CelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/40 backdrop-blur-md"
        />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
              scale: [0, 1.8, 0],
              x: (Math.random() - 0.5) * 800,
              y: (Math.random() - 0.5) * 1000,
              rotate: Math.random() * 720
            }}
            transition={{ duration: 2.5, ease: "easeOut", delay: Math.random() * 0.2 }}
            className={`absolute w-10 h-10 border-4 border-black rounded-xl ${
              subtext 
                ? (i % 2 === 0 ? 'bg-kidYellow shadow-[0_0_20px_rgba(255,204,0,0.5)]' : 'bg-white')
                : ['bg-kidRed', 'bg-kidBlue', 'bg-kidYellow', 'bg-kidGreen'][i % 4]
            }`}
          />
        ))}
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ 
            scale: [0, 1.3, 1], 
            rotate: [0, -10, 10, -5, 5, 0],
            y: [0, -20, 0]
          }}
          exit={{ scale: 0, opacity: 0, rotate: 45 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          className="relative px-12 py-10 bg-white border-[8px] border-black rounded-[50px] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-2"
        >
          <h1 className="text-6xl font-black italic tracking-tighter text-black text-center whitespace-nowrap drop-shadow-sm">
            {text}
          </h1>
          {subtext && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-black uppercase italic text-kidRed tracking-tight"
            >
              {subtext}
            </motion.p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}