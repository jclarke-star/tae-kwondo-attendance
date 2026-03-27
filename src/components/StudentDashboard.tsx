import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { BeltProgress } from '@/components/ui/BeltProgress';
import { BadgeGallery } from '@/components/BadgeGallery';
import { Celebration } from '@/components/ui/Celebration';
import { api } from '@/lib/api-client';
import { ClassSession, GradingEvent, User } from '@shared/types';
import { Loader2, CheckCircle2, Hourglass, Trophy, Star, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
export function StudentDashboard() {
  const currentUser = useAppStore(s => s.currentUser);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [gradings, setGradings] = useState<GradingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevStatusRef = useRef<string | null>(null);
  const fetchData = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const [classData, gradingData, userData] = await Promise.all([
        api<ClassSession[]>('/api/classes'),
        api<GradingEvent[]>('/api/gradings'),
        api<User[]>('/api/users')
      ]);
      setClasses(classData);
      setGradings(gradingData);
      const updatedMe = userData.find(u => u.id === currentUser.id);
      if (updatedMe) {
        const activeClass = classData[0];
        const currentStatus = activeClass?.confirmedCheckIns.includes(updatedMe.id) ? 'confirmed' : 'pending';
        if (prevStatusRef.current === 'pending' && currentStatus === 'confirmed') {
          setShowCelebration(true);
        }
        prevStatusRef.current = currentStatus;
        setCurrentUser(updatedMe);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, setCurrentUser]);
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);
  const handleCheckIn = async (classId: string) => {
    if (!currentUser) return;
    try {
      await api(`/api/classes/${classId}/checkin`, {
        method: 'POST',
        body: JSON.stringify({ userId: currentUser.id })
      });
      toast.success('KI-YAH! Check-in sent!');
      prevStatusRef.current = 'pending';
      fetchData();
    } catch (e) {
      toast.error('Failed to check in');
    }
  };
  if (loading && !currentUser) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="w-12 h-12 animate-spin text-kidBlue" />
      <p className="mt-4 font-black uppercase tracking-widest">Getting Ready...</p>
    </div>
  );
  const activeClass = classes[0];
  const myGradings = gradings.filter(g => g.targetBelts.includes(currentUser?.belt || ''));
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {showCelebration && (
        <Celebration
          text="KI-YAH! CONFIRMED!"
          onComplete={() => setShowCelebration(false)}
        />
      )}
      <PlayfulCard className="text-center relative overflow-hidden pt-10">
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-kidRed text-white px-3 py-1 rounded-full border-2 border-black rotate-3 shadow-playful-sm">
          <Flame className="w-4 h-4 fill-white" />
          <span className="font-black text-sm">{currentUser?.streak || 0}</span>
        </div>
        <div className="text-7xl mb-2 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">{currentUser?.avatar}</div>
        <h2 className="text-3xl font-black tracking-tight uppercase">{currentUser?.name}</h2>
        <div className="mt-4 mb-2">
          <BeltProgress
            currentBelt={currentUser?.belt || "White Belt"}
            totalSessions={currentUser?.totalSessions || 0}
          />
        </div>
      </PlayfulCard>
      {!activeClass ? (
        <PlayfulCard color="bg-kidYellow/20">
          <p className="text-center font-black">No active training sessions. Rest up!</p>
        </PlayfulCard>
      ) : (
        <div className="space-y-4">
          <h3 className="text-2xl font-black px-2 flex items-center gap-2">
            <Star className="w-6 h-6 text-kidYellow" /> TRAINING TODAY
          </h3>
          <PlayfulCard className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-black">{activeClass.title}</p>
                <p className="font-bold text-kidBlue">Ready for class?</p>
              </div>
              <div className="text-3xl">🥋</div>
            </div>
            {activeClass.confirmedCheckIns.includes(currentUser?.id || '') ? (
              <div className="bg-kidGreen p-6 rounded-2xl border-4 border-black text-white text-center space-y-2 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <p className="text-2xl font-black italic">ON THE MAT!</p>
              </div>
            ) : activeClass.pendingCheckIns.includes(currentUser?.id || '') ? (
              <div className="bg-kidYellow p-6 rounded-2xl border-4 border-black text-black text-center space-y-2 animate-pulse">
                <Hourglass className="w-12 h-12 mx-auto" />
                <p className="text-xl font-black uppercase">Waiting for Approval</p>
              </div>
            ) : (
              <PlayfulButton
                variant="red"
                size="xl"
                className="w-full py-10"
                onClick={() => handleCheckIn(activeClass.id)}
              >
                CHECK IN NOW
              </PlayfulButton>
            )}
          </PlayfulCard>
        </div>
      )}
      <div className="space-y-4">
        <h3 className="text-2xl font-black px-2 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-kidYellow" /> MY ACHIEVEMENTS
        </h3>
        <BadgeGallery badges={currentUser?.badges || []} />
      </div>
      {myGradings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-black px-2 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-kidBlue" /> UPCOMING GRADING
          </h3>
          {myGradings.map(g => (
            <PlayfulCard key={g.id} color="bg-white" className="border-black">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-black">{g.title}</p>
                  <p className="text-sm font-bold text-muted-foreground">{format(new Date(g.date), 'EEEE, MMMM do')}</p>
                </div>
                <div className="bg-kidYellow p-3 rounded-full border-4 border-black">
                  <Trophy className="w-6 h-6 text-black" />
                </div>
              </div>
            </PlayfulCard>
          ))}
        </div>
      )}
    </div>
  );
}