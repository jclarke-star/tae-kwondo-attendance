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
  const currentIndex = BELT_ORDER.findIndex(b => b.toLowerCase() === currentBelt.toLowerCase());
  const isLastBelt = currentIndex === BELT_ORDER.length - 1;
  const nextBelt = !isLastBelt && currentIndex !== -1
    ? BELT_ORDER[currentIndex + 1]
    : "Master Level";
  const isMaster = isLastBelt || nextBelt === "Master Level";
  // Logic: 10 sessions required for test. 
  // If sessionsCount is 10, 20, 30... it should show 100% and "QUALIFIED"
  const sessionsInBlock = sessionsCount % 10;
  const isQualified = sessionsCount > 0 && sessionsInBlock === 0;
  const progressToNext = isMaster ? 100 : (isQualified ? 100 : sessionsInBlock * 10);
  const classesRemaining = isMaster ? 0 : (isQualified ? 0 : 10 - sessionsInBlock);
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
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressToNext}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 12 }}
          className={cn("absolute inset-y-0 left-0", isMaster || isQualified ? "bg-kidYellow" : "bg-kidGreen")}
        />
        <div className="absolute inset-0 flex items-center justify-around px-4 pointer-events-none">
          <div className={cn("w-12 h-4 border-2 border-black rounded-sm shadow-sm", getBeltColor(currentBelt))} />
          <div className="flex-1 mx-4 h-[2px] bg-black/10" />
          <div className={cn("w-12 h-4 border-2 border-black rounded-sm opacity-40", getBeltColor(isLastBelt ? currentBelt : nextBelt))} />
        </div>
      </div>
      <div className="flex items-center justify-between bg-white border-2 border-black rounded-xl p-3 shadow-playful-sm">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg border-2 border-black", isQualified ? "bg-kidRed animate-bounce" : "bg-kidYellow")}>
            <Trophy className={cn("w-4 h-4", isQualified ? "text-white" : "text-black")} />
          </div>
          <div className="text-left">
            {isMaster ? (
              <>
                <p className="text-xs font-black uppercase">Legend Status Achieved</p>
                <p className="text-[10px] font-bold text-muted-foreground">Highest rank reached. Keep it up!</p>
              </>
            ) : isQualified ? (
              <>
                <p className="text-xs font-black uppercase text-kidRed">QUALIFIED FOR TEST!</p>
                <p className="text-[10px] font-bold text-muted-foreground italic uppercase">Speak to your Master now!</p>
              </>
            ) : (
              <>
                <p className="text-xs font-black uppercase">{classesRemaining} MORE CLASSES</p>
                <p className="text-[10px] font-bold text-muted-foreground">Until you qualify for {nextBelt} test!</p>
              </>
            )}
          </div>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => {
            const threshold = i * 3.3;
            const isActive = isMaster || isQualified || (sessionsInBlock >= threshold);
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