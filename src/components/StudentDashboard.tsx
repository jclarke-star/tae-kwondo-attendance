import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { api } from '@/lib/api-client';
import { ClassSession, GradingEvent } from '@shared/types';
import { Loader2, CheckCircle2, Hourglass, Trophy, Star } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
export function StudentDashboard() {
  const user = useAppStore(s => s.currentUser);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [gradings, setGradings] = useState<GradingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      const [classData, gradingData] = await Promise.all([
        api<ClassSession[]>('/api/classes'),
        api<GradingEvent[]>('/api/gradings')
      ]);
      setClasses(classData);
      setGradings(gradingData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);
  const handleCheckIn = async (classId: string) => {
    if (!user) return;
    try {
      await api(`/api/classes/${classId}/checkin`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id })
      });
      toast.success('KI-YAH! Check-in sent!');
      fetchData();
    } catch (e) {
      toast.error('Failed to check in');
    }
  };
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="w-12 h-12 animate-spin text-kidBlue" />
      <p className="mt-4 font-black">GETTING READY...</p>
    </div>
  );
  const activeClass = classes[0];
  const myGradings = gradings.filter(g => g.targetBelts.includes(user?.belt || ''));
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <PlayfulCard className="text-center relative overflow-hidden">
        <div className="absolute -top-4 -right-4 bg-kidYellow p-4 rounded-full border-4 border-black rotate-12">
          <Star className="w-8 h-8 text-black" />
        </div>
        <div className="text-6xl mb-2">{user?.avatar}</div>
        <h2 className="text-3xl font-black">{user?.name}</h2>
        <p className="font-bold text-muted-foreground uppercase tracking-wider">{user?.belt}</p>
        <div className="mt-4 bg-kidBlue/10 p-2 rounded-xl inline-block border-2 border-black px-4">
          <p className="text-xs font-black">CLASSES ATTENDED: {user?.totalSessions ?? 0}</p>
        </div>
      </PlayfulCard>
      {!activeClass ? (
        <PlayfulCard color="bg-kidYellow/20">
          <p className="text-center font-black">No classes right now. Rest up!</p>
        </PlayfulCard>
      ) : (
        <div className="space-y-4">
          <h3 className="text-2xl font-black px-2">TODAY'S CLASS</h3>
          <PlayfulCard className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-black">{activeClass.title}</p>
                <p className="font-bold text-kidBlue">Starts Soon!</p>
              </div>
              <div className="text-3xl">🥋</div>
            </div>
            {activeClass.confirmedCheckIns.includes(user?.id || '') ? (
              <div className="bg-kidGreen p-6 rounded-2xl border-4 border-black text-white text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <p className="text-2xl font-black italic">CONFIRMED! KI-YAH!</p>
              </div>
            ) : activeClass.pendingCheckIns.includes(user?.id || '') ? (
              <div className="bg-kidYellow p-6 rounded-2xl border-4 border-black text-black text-center space-y-2 animate-pulse">
                <Hourglass className="w-12 h-12 mx-auto" />
                <p className="text-xl font-black">WAITING FOR MASTER...</p>
              </div>
            ) : (
              <PlayfulButton
                variant="red"
                size="xl"
                className="w-full py-10"
                onClick={() => handleCheckIn(activeClass.id)}
              >
                CHECK IN
              </PlayfulButton>
            )}
          </PlayfulCard>
        </div>
      )}
      {myGradings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-black px-2 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-kidYellow" /> NEXT BELT TEST
          </h3>
          {myGradings.map(g => (
            <PlayfulCard key={g.id} color="bg-kidYellow/10" className="border-kidYellow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-black">{g.title}</p>
                  <p className="text-sm font-bold text-muted-foreground">{format(new Date(g.date), 'EEEE, MMMM do')}</p>
                </div>
                <div className="bg-white p-3 rounded-full border-4 border-black">
                  <Trophy className="w-6 h-6 text-kidYellow" />
                </div>
              </div>
              <p className="mt-3 text-xs font-bold leading-relaxed">{g.description}</p>
            </PlayfulCard>
          ))}
        </div>
      )}
    </div>
  );
}