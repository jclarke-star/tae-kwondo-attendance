import React from 'react';
import { motion } from 'framer-motion';
import { BELT_ORDER } from '@shared/types';
import { cn } from '@/lib/utils';
import { Trophy, Star } from 'lucide-react';
interface BeltProgressProps {
  currentBelt: string;
  totalSessions: number;
}
export function BeltProgress({ currentBelt, totalSessions }: BeltProgressProps) {
  const currentIndex = BELT_ORDER.indexOf(currentBelt);
  const nextBelt = currentIndex !== -1 && currentIndex < BELT_ORDER.length - 1 
    ? BELT_ORDER[currentIndex + 1] 
    : "Master Level";
  // Logic: Every 10 sessions is a "milestone" towards the next belt
  // If Master Level, keep at 100% or show a different state
  const isMaster = nextBelt === "Master Level";
  const progressToNext = isMaster ? 100 : (totalSessions % 10) * 10;
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
          <p className="text-lg font-black italic">{currentBelt}</p>
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
        {/* Belt Visual */}
        <div className="absolute inset-0 flex items-center justify-around px-4 pointer-events-none">
          <div className={cn("w-12 h-4 border-2 border-black rounded-sm shadow-sm", getBeltColor(currentBelt))} />
          <div className="flex-1 mx-4 h-[2px] bg-black/10" />
          <div className={cn("w-12 h-4 border-2 border-black rounded-sm opacity-40", getBeltColor(isMaster ? currentBelt : nextBelt))} />
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
                <p className="text-[10px] font-bold text-muted-foreground">Keep training to maintain your streak!</p>
              </>
            ) : (
              <>
                <p className="text-xs font-black uppercase">{10 - (totalSessions % 10)} MORE CLASSES</p>
                <p className="text-[10px] font-bold text-muted-foreground">Until you qualify for {nextBelt} test!</p>
              </>
            )}
          </div>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn(
              "w-6 h-6 rounded-full border-2 border-black flex items-center justify-center transition-colors",
              isMaster || i <= (totalSessions % 10) / 3 ? "bg-kidYellow" : "bg-white"
            )}>
              <Star className={cn("w-3 h-3 transition-colors", isMaster || i <= (totalSessions % 10) / 3 ? "fill-black" : "text-black/20")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}