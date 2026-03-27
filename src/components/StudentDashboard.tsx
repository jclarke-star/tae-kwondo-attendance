import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { api } from '@/lib/api-client';
import { ClassSession } from '@shared/types';
import { Loader2, CheckCircle2, Hourglass } from 'lucide-react';
import { toast } from 'sonner';
export function StudentDashboard() {
  const user = useAppStore(s => s.currentUser);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchClasses = async () => {
    try {
      const data = await api<ClassSession[]>('/api/classes');
      setClasses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchClasses(); }, []);
  const handleCheckIn = async (classId: string) => {
    if (!user) return;
    try {
      await api(`/api/classes/${classId}/checkin`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id })
      });
      toast.success('KI-YAH! Check-in sent!');
      fetchClasses();
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
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PlayfulCard className="text-center">
        <div className="text-6xl mb-2">{user?.avatar}</div>
        <h2 className="text-3xl font-black">{user?.name}</h2>
        <p className="font-bold text-muted-foreground">{user?.belt}</p>
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
    </div>
  );
}