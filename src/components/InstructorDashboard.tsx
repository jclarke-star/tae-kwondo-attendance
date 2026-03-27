import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { GradingManager } from '@/components/GradingManager';
import { api } from '@/lib/api-client';
import { ClassSession, User } from '@shared/types';
import { Check, X, Users, ShieldCheck, Hourglass, ClipboardList, CalendarDays, BellRing, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
export function InstructorDashboard() {
  const [session, setSession] = useState<ClassSession | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const prevPendingIds = useRef<string[]>([]);
  const fetchData = useCallback(async () => {
    try {
      const [classData, userData] = await Promise.all([
        api<ClassSession[]>('/api/classes'),
        api<User[]>('/api/users')
      ]);
      const currentSession = classData[0] || null;
      setSession(currentSession);
      setUsers(userData);
      const currentPendingIds = currentSession?.pendingCheckIns || [];
      const hasNewArrivals = currentPendingIds.some(id => !prevPendingIds.current.includes(id));
      if (hasNewArrivals) {
        toast.info("STUDENT WAITING", {
          icon: <BellRing className="w-4 h-4 text-kidRed" />,
          description: "A student is ready for approval."
        });
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.2;
          audio.play();
        } catch (e) { /* ignore */ }
      }
      prevPendingIds.current = currentPendingIds;
    } catch (e) {
      console.error('Instructor polling error', e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);
  const handleAction = useCallback(async (userId: string, action: 'approve' | 'deny') => {
    if (!session) return;
    try {
      await api(`/api/classes/${session.id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      toast.success(action === 'approve' ? 'Confirmed!' : 'Denied');
      fetchData();
    } catch (e) {
      toast.error('Operation failed');
    }
  }, [session, fetchData]);
  if (loading && !session) return <div className="p-20 text-center font-black italic uppercase animate-pulse">Opening Command Center...</div>;
  const pendingUsers = users.filter(u => session?.pendingCheckIns.includes(u.id));
  const confirmedUsers = users.filter(u => session?.confirmedCheckIns.includes(u.id));
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 py-4">
      <div className="flex items-center gap-4 px-2">
        <div className="bg-kidRed text-white p-3 rounded-2xl border-4 border-black shadow-playful-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black leading-tight uppercase italic">Master Station</h2>
          <p className="font-black text-kidRed uppercase text-[10px] tracking-widest italic">Command & Control</p>
        </div>
      </div>
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2 h-auto p-0">
          <TabsTrigger
            value="attendance"
            className={cn(
              "relative border-4 border-black rounded-xl font-black data-[state=active]:bg-kidRed data-[state=active]:text-white shadow-playful data-[state=active]:shadow-none data-[state=active]:translate-y-1 py-4 transition-all uppercase italic",
              pendingUsers.length > 0 && "data-[state=inactive]:animate-bounce-subtle"
            )}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Attendance
            {pendingUsers.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-kidYellow text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-black animate-in zoom-in duration-300">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="gradings"
            className="border-4 border-black rounded-xl font-black data-[state=active]:bg-kidYellow data-[state=active]:text-black shadow-playful data-[state=active]:shadow-none data-[state=active]:translate-y-1 py-4 uppercase italic"
          >
            <CalendarDays className="w-4 h-4 mr-2" /> Gradings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="space-y-8 mt-8 animate-in fade-in duration-300">
          <div className="space-y-4">
            <h3 className="text-xl font-black px-2 flex items-center gap-2 uppercase italic text-kidRed">
              <Hourglass className="w-5 h-5" /> Pending Approval ({pendingUsers.length})
            </h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {pendingUsers.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-16 text-center border-4 border-dashed border-black/10 rounded-[40px] bg-white flex flex-col items-center gap-3"
                  >
                    <Sparkles className="w-10 h-10 text-black/10" />
                    <p className="font-black text-muted-foreground/40 italic uppercase">All students confirmed</p>
                  </motion.div>
                ) : (
                  pendingUsers.map(u => (
                    <motion.div
                      key={u.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <PlayfulCard className="flex items-center justify-between p-4 hover:translate-x-1 transition-transform border-kidRed">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl drop-shadow-sm">{u.avatar}</span>
                          <div className="text-left">
                            <p className="font-black leading-tight text-lg uppercase italic">{u.name}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{u.belt}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <PlayfulButton variant="green" size="sm" onClick={() => handleAction(u.id, 'approve')} className="w-12 h-12 p-0 rounded-full">
                            <Check className="w-6 h-6" />
                          </PlayfulButton>
                          <PlayfulButton variant="white" size="sm" onClick={() => handleAction(u.id, 'deny')} className="w-12 h-12 p-0 rounded-full border-2">
                            <X className="w-6 h-6" />
                          </PlayfulButton>
                        </div>
                      </PlayfulCard>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="space-y-4 pt-6 border-t-4 border-black/5">
            <h3 className="text-xl font-black px-2 flex items-center gap-2 uppercase italic text-kidBlue">
              <Users className="w-5 h-5" /> Active On Mat ({confirmedUsers.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {confirmedUsers.map(u => (
                  <motion.div
                    key={u.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-4 border-black rounded-3xl p-4 flex flex-col items-center text-center shadow-playful hover:-rotate-1 transition-transform"
                  >
                    <span className="text-4xl mb-1">{u.avatar}</span>
                    <p className="font-black text-sm truncate w-full uppercase italic">{u.name}</p>
                    <div className="mt-2 bg-kidGreen/20 text-kidGreen border-2 border-kidGreen/30 px-3 py-1 rounded-full text-[10px] font-black uppercase italic">
                      TRAINING
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="gradings" className="mt-8">
          <GradingManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}