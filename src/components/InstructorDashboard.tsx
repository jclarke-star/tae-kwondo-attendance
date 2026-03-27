import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { GradingManager } from '@/components/GradingManager';
import { api } from '@/lib/api-client';
import { ClassSession, User } from '@shared/types';
import { Check, X, Users, ShieldCheck, Hourglass, ClipboardList, CalendarDays, BellRing, Sparkles, Trash2, Trophy, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
export function InstructorDashboard() {
  const isVerifiedInstructor = useAppStore(s => s.isVerifiedInstructor);
  const clearVerification = useAppStore(s => s.clearVerification);
  const [session, setSession] = useState<ClassSession | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const prevPendingIds = useRef<string[]>([]);
  const fetchData = useCallback(async () => {
    if (!isVerifiedInstructor) return;
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
      if ((e as Error).message.includes('PIN')) {
        toast.error("Security Session Expired");
        clearVerification();
      }
    } finally {
      setLoading(false);
    }
  }, [isVerifiedInstructor, clearVerification]);
  useEffect(() => {
    if (!isVerifiedInstructor) return;
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData, isVerifiedInstructor]);
  const handleAction = useCallback(async (userId: string, action: 'approve' | 'deny') => {
    if (!session || !isVerifiedInstructor) return;
    try {
      await api(`/api/classes/${session.id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      toast.success(action === 'approve' ? 'Confirmed!' : 'Denied');
      fetchData();
    } catch (e) {
      if ((e as Error).message.includes('PIN')) {
        toast.error("Instructor PIN required");
        clearVerification();
      } else {
        toast.error('Operation failed');
      }
    }
  }, [session, fetchData, clearVerification, isVerifiedInstructor]);
  const handlePromote = async (userId: string) => {
    if (!isVerifiedInstructor) return;
    try {
      await api(`/api/users/${userId}/promote`, { method: 'POST' });
      toast.success('RANK UP! Student promoted successfully.');
      fetchData();
    } catch (e) {
      toast.error('Promotion failed');
    }
  };
  const handleEndSession = async () => {
    if (!session || !isVerifiedInstructor) return;
    try {
      await api(`/api/classes/${session.id}/end`, { method: 'POST' });
      toast.success('Mat cleared! Class finished.');
      fetchData();
    } catch (e) {
      if ((e as Error).message.includes('PIN')) {
        toast.error("Instructor PIN required");
        clearVerification();
      } else {
        toast.error('Failed to end session');
      }
    }
  };
  if (!isVerifiedInstructor) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-black italic uppercase">Access Denied</h2>
        <p className="font-bold text-muted-foreground italic">Verification required to access Master Station.</p>
        <PlayfulButton onClick={() => window.location.reload()} variant="blue">Return to Login</PlayfulButton>
      </div>
    );
  }
  if (loading && !session && users.length === 0) {
    return <div className="p-20 text-center font-black italic uppercase animate-pulse">Contacting Dojo...</div>;
  }
  const pendingUsers = users.filter(u => session?.pendingCheckIns.includes(u.id));
  const confirmedUsers = users.filter(u => session?.confirmedCheckIns.includes(u.id));
  const studentRoster = users.filter(u => u.role === 'student');
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
        <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2 h-auto p-0">
          <TabsTrigger
            value="attendance"
            className="relative border-4 border-black rounded-xl font-black data-[state=active]:bg-kidRed data-[state=active]:text-white shadow-playful data-[state=active]:shadow-none data-[state=active]:translate-y-1 py-4 uppercase italic"
          >
            <ClipboardList className="w-4 h-4 mr-2 hidden sm:inline" />
            Check-in
            {pendingUsers.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-kidYellow text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-black">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="roster"
            className="border-4 border-black rounded-xl font-black data-[state=active]:bg-kidBlue data-[state=active]:text-white shadow-playful data-[state=active]:shadow-none data-[state=active]:translate-y-1 py-4 uppercase italic"
          >
            <UserRound className="w-4 h-4 mr-2 hidden sm:inline" /> Roster
          </TabsTrigger>
          <TabsTrigger
            value="gradings"
            className="border-4 border-black rounded-xl font-black data-[state=active]:bg-kidYellow data-[state=active]:text-black shadow-playful data-[state=active]:shadow-none data-[state=active]:translate-y-1 py-4 uppercase italic"
          >
            <CalendarDays className="w-4 h-4 mr-2 hidden sm:inline" /> Dates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="space-y-8 mt-8 animate-in fade-in duration-300">
          <div className="space-y-4">
            <h3 className="text-xl font-black px-2 flex items-center gap-2 uppercase italic text-kidRed">
              <Hourglass className="w-5 h-5" /> Pending ({pendingUsers.length})
            </h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {pendingUsers.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-12 text-center border-4 border-dashed border-black/10 rounded-[40px] bg-white">
                    <p className="font-black text-muted-foreground/40 italic uppercase">All clear</p>
                  </motion.div>
                ) : (
                  pendingUsers.map(u => (
                    <motion.div key={u.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                      <PlayfulCard className="flex items-center justify-between p-4 border-kidRed">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{u.avatar}</span>
                          <div className="text-left">
                            <p className="font-black text-lg uppercase italic leading-none">{u.name}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase">{u.belt}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <PlayfulButton variant="green" size="sm" onClick={() => handleAction(u.id, 'approve')} className="w-10 h-10 p-0 rounded-full">
                            <Check className="w-5 h-5" />
                          </PlayfulButton>
                          <PlayfulButton variant="white" size="sm" onClick={() => handleAction(u.id, 'deny')} className="w-10 h-10 p-0 rounded-full border-2">
                            <X className="w-5 h-5" />
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
              <Users className="w-5 h-5" /> Active ({confirmedUsers.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {confirmedUsers.map(u => (
                <div key={u.id} className="bg-white border-4 border-black rounded-3xl p-4 flex flex-col items-center text-center shadow-playful">
                  <span className="text-4xl mb-1">{u.avatar}</span>
                  <p className="font-black text-sm truncate w-full uppercase italic">{u.name}</p>
                </div>
              ))}
            </div>
          </div>
          {(confirmedUsers.length > 0 || pendingUsers.length > 0) && (
            <div className="pt-10 flex justify-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <PlayfulButton variant="red" size="lg" className="w-full flex gap-2">
                    <Trash2 className="w-5 h-5" /> END SESSION
                  </PlayfulButton>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-4 border-black rounded-[40px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black italic uppercase">FINISH CLASS?</AlertDialogTitle>
                    <AlertDialogDescription className="font-bold text-muted-foreground">This clears the current attendance roster.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-4 gap-4">
                    <AlertDialogCancel className="playful-btn border-4 border-black rounded-xl font-black">CANCEL</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEndSession} className="bg-kidRed text-white border-4 border-black rounded-xl font-black hover:bg-kidRed">CLEAR MAT</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </TabsContent>
        <TabsContent value="roster" className="space-y-6 mt-8 animate-in fade-in duration-300">
           <h3 className="text-xl font-black px-2 flex items-center gap-2 uppercase italic text-kidBlue">
              <UserRound className="w-5 h-5" /> DOJO ROSTER ({studentRoster.length})
            </h3>
            <div className="space-y-4">
              {studentRoster.map(u => {
                const sessions = u.totalSessions ?? 0;
                const isQualified = sessions >= 10;
                const progress = Math.min((sessions / 10) * 100, 100);
                return (
                  <PlayfulCard key={u.id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{u.avatar}</span>
                        <div className="text-left">
                          <p className="font-black text-lg uppercase italic leading-none">{u.name}</p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase">{u.belt}</p>
                        </div>
                      </div>
                      {isQualified ? (
                        <PlayfulButton variant="yellow" size="sm" className="px-4 py-2 flex gap-1 animate-bounce-subtle" onClick={() => handlePromote(u.id)}>
                          <Trophy className="w-4 h-4" /> PROMOTE
                        </PlayfulButton>
                      ) : (
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{10 - sessions} CLASSES TO GO</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Progress value={progress} className="h-3 border-2 border-black bg-slate-100" />
                      <div className="flex justify-between text-[10px] font-black uppercase italic">
                        <span>Sessions: {sessions}/10</span>
                        {isQualified && <span className="text-kidRed">READY FOR TEST</span>}
                      </div>
                    </div>
                  </PlayfulCard>
                );
              })}
            </div>
        </TabsContent>
        <TabsContent value="gradings" className="mt-8">
          <GradingManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}