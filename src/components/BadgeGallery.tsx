import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@shared/types';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { cn } from '@/lib/utils';
interface BadgeGalleryProps {
  badges: Badge[];
}
export function BadgeGallery({ badges }: BadgeGalleryProps) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center p-8 border-4 border-dashed border-black/10 rounded-3xl">
        <p className="font-bold text-muted-foreground text-sm">Train hard to earn your first badge!</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badge, idx) => (
        <motion.div
          key={badge.id}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: idx * 0.1 
          }}
          whileHover={{ scale: 1.05, rotate: 2 }}
        >
          <PlayfulCard className="p-2 flex flex-col items-center justify-center text-center h-full aspect-square" color="bg-white">
            <span className="text-3xl mb-1">{badge.icon}</span>
            <p className="text-[10px] font-black leading-none uppercase tracking-tight">{badge.name}</p>
            <div className="mt-1 bg-kidYellow px-1.5 py-0.5 rounded-full border border-black scale-75">
              <span className="text-[8px] font-black italic">EARNED</span>
            </div>
          </PlayfulCard>
        </motion.div>
      ))}
    </div>
  );
}