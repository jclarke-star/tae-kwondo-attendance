import React from 'react';
import { motion } from 'framer-motion';
import { BELT_ORDER } from '@shared/types';
import { cn } from '@/lib/utils';
import { Trophy, Star } from 'lucide-react';
interface BeltProgressProps {
  currentBelt: string;
  totalSessions: number;
}
export function BeltProgress({ currentBelt, totalSessions = 0 }: BeltProgressProps) {
  const sessionsCount = Number(totalSessions || 0);
  // Safe lookup for current index
  const currentIndex = BELT_ORDER.findIndex(b => b.toLowerCase() === currentBelt.toLowerCase());
  const isLastBelt = currentIndex === BELT_ORDER.length - 1;
  const nextBelt = !isLastBelt && currentIndex !== -1
    ? BELT_ORDER[currentIndex + 1]
    : "Master Level";
  // Logic: Every 10 sessions is a "milestone" towards the next belt
  const isMaster = isLastBelt || nextBelt === "Master Level";
  // For master, fill is 100%. For others, 0-100% based on sessions within current 10-block
  const progressToNext = isMaster ? 100 : (sessionsCount % 10) * 10;
  const getBeltColor = (beltName: string) => {
    if (beltName.includes('White')) return 'bg-white';
    if (beltName.includes('Yellow')) return 'bg-kidYellow';
    if (beltName.includes('Green')) return 'bg-kidGreen';
    if (beltName.includes('Blue')) return 'bg-kidBlue';
    if (beltName.includes('Red')) return 'bg-kidRed';
    if (beltName.includes('Black')) return 'bg-black';
    return 'bg-slate-200';
  };
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-end px-1">
        <div>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-left">Current Rank</p>
          <p className="text-lg font-black italic">{currentBelt || "Novice"}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Next Goal</p>
          <p className="text-sm font-black text-kidBlue">{nextBelt}</p>
        </div>
      </div>
      <div className="relative h-10 w-full bg-slate-200 rounded-2xl border-4 border-black overflow-hidden shadow-playful-sm">
        {/* Animated Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressToNext}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 12 }}
          className={cn("absolute inset-y-0 left-0", isMaster ? "bg-kidYellow" : "bg-kidGreen")}
        />
        {/* Belt Visuals for Progress Bar context */}
        <div className="absolute inset-0 flex items-center justify-around px-4 pointer-events-none">
          <div className={cn("w-12 h-4 border-2 border-black rounded-sm shadow-sm", getBeltColor(currentBelt))} />
          <div className="flex-1 mx-4 h-[2px] bg-black/10" />
          <div className={cn("w-12 h-4 border-2 border-black rounded-sm opacity-40", getBeltColor(isLastBelt ? currentBelt : nextBelt))} />
        </div>
      </div>
      <div className="flex items-center justify-between bg-white border-2 border-black rounded-xl p-3 shadow-playful-sm">
        <div className="flex items-center gap-3">
          <div className="bg-kidYellow p-2 rounded-lg border-2 border-black">
            <Trophy className="w-4 h-4 text-black" />
          </div>
          <div className="text-left">
            {isMaster ? (
              <>
                <p className="text-xs font-black uppercase">Legend Status Achieved</p>
                <p className="text-[10px] font-bold text-muted-foreground">Highest rank reached. Keep it up!</p>
              </>
            ) : (
              <>
                <p className="text-xs font-black uppercase">{10 - (sessionsCount % 10)} MORE CLASSES</p>
                <p className="text-[10px] font-bold text-muted-foreground">Until you qualify for {nextBelt} test!</p>
              </>
            )}
          </div>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => {
            // Milestone stars: 1st at 3/10, 2nd at 6/10, 3rd at 9/10
            const threshold = i * 3.3;
            const isActive = isMaster || (sessionsCount % 10) >= threshold;
            return (
              <div key={i} className={cn(
                "w-6 h-6 rounded-full border-2 border-black flex items-center justify-center transition-colors",
                isActive ? "bg-kidYellow" : "bg-white"
              )}>
                <Star className={cn("w-3 h-3 transition-colors", isActive ? "fill-black" : "text-black/20")} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}