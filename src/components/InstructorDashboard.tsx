import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { GradingManager } from '@/components/GradingManager';
import { api } from '@/lib/api-client';
import { ClassSession, User } from '@shared/types';
import { Check, X, Users, ShieldCheck, Hourglass, ClipboardList, CalendarDays, BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
export function InstructorDashboard() {
  const [session, setSession] = useState<ClassSession | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const prevPendingCount = useRef<number>(0);
  const fetchData = useCallback(async () => {
    try {
      const [classData, userData] = await Promise.all([
        api<ClassSession[]>('/api/classes'),
        api<User[]>('/api/users')
      ]);
      const currentSession = classData[0] || null;
      setSession(currentSession);
      setUsers(userData);
      const pendingCount = currentSession?.pendingCheckIns.length || 0;
      if (pendingCount > prevPendingCount.current) {
        toast.info("NEW CHECK-IN!", {
          icon: <BellRing className="w-4 h-4 text-kidRed" />,
          description: "A student is waiting for approval."
        });
        // Play subtle sound if browser permits
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.3;
          audio.play();
        } catch (e) {}
      }
      prevPendingCount.current = pendingCount;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Fast poll for instructors
    return () => clearInterval(interval);
  }, [fetchData]);
  const handleAction = async (userId: string, action: 'approve' | 'deny') => {
    if (!session) return;
    try {
      await api(`/api/classes/${session.id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      toast.success(action === 'approve' ? 'Approved!' : 'Denied');
      fetchData();
    } catch (e) {
      toast.error('Action failed');
    }
  };
  if (loading && !session) return <div className="p-8 text-center font-black">LOADING COMMAND CENTER...</div>;
  const pendingUsers = users.filter(u => session?.pendingCheckIns.includes(u.id));
  const confirmedUsers = users.filter(u => session?.confirmedCheckIns.includes(u.id));
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4 px-2">
        <div className="bg-black text-white p-3 rounded-2xl border-4 border-black shadow-playful-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black">COMMAND CENTER</h2>
          <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Master Lee's Station</p>
        </div>
      </div>
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2 h-auto p-0">
          <TabsTrigger
            value="attendance"
            className={cn(
              "relative border-4 border-black rounded-xl font-black data-[state=active]:bg-kidBlue data-[state=active]:text-white shadow-playful data-[state=active]:shadow-none data-[state=active]:translate-y-1 py-3 transition-all",
              pendingUsers.length > 0 && "data-[state=inactive]:animate-bounce-subtle"
            )}
          >
            <ClipboardList className="w-4 h-4 mr-2" /> 
            ATTENDANCE
            {pendingUsers.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-kidRed text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-black animate-in zoom-in duration-300">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="gradings"
            className="border-4 border-black rounded-xl font-black data-[state=active]:bg-kidYellow data-[state=active]:text-black shadow-playful data-[state=active]:shadow-none data-[state=active]:translate-y-1 py-3"
          >
            <CalendarDays className="w-4 h-4 mr-2" /> GRADINGS
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="space-y-6 mt-6">
          <div className="space-y-4">
            <h3 className="text-xl font-black px-2 flex items-center gap-2">
              <Hourglass className="w-5 h-5 text-kidYellow" /> WAITING ({pendingUsers.length})
            </h3>
            {pendingUsers.length === 0 ? (
              <div className="px-4 py-16 text-center border-4 border-dashed border-black/10 rounded-[40px] bg-slate-50">
                <p className="font-black text-muted-foreground/40 italic">Roster is clear!</p>
              </div>
            ) : (
              pendingUsers.map(u => (
                <PlayfulCard key={u.id} className="flex items-center justify-between p-4 group">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl drop-shadow-sm">{u.avatar}</span>
                    <div>
                      <p className="font-black leading-tight text-lg">{u.name}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{u.belt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <PlayfulButton variant="green" size="sm" onClick={() => handleAction(u.id, 'approve')} className="w-10 h-10 p-0">
                      <Check className="w-6 h-6" />
                    </PlayfulButton>
                    <PlayfulButton variant="white" size="sm" onClick={() => handleAction(u.id, 'deny')} className="w-10 h-10 p-0">
                      <X className="w-6 h-6" />
                    </PlayfulButton>
                  </div>
                </PlayfulCard>
              ))
            )}
          </div>
          <div className="space-y-4 pt-4 border-t-4 border-black/5">
            <h3 className="text-xl font-black px-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-kidBlue" /> ON THE MAT ({confirmedUsers.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {confirmedUsers.map(u => (
                <div key={u.id} className="bg-white border-2 border-black rounded-2xl p-3 flex flex-col items-center text-center shadow-playful-sm">
                  <span className="text-4xl mb-1">{u.avatar}</span>
                  <p className="font-black text-[12px] truncate w-full">{u.name}</p>
                  <div className="mt-1 bg-kidGreen/20 text-kidGreen border border-kidGreen/30 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
                    ACTIVE
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="gradings" className="mt-6">
          <GradingManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}