import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { GradingManager } from '@/components/GradingManager';
import { api } from '@/lib/api-client';
import { ClassSession, User } from '@shared/types';
import { Check, X, Users, ShieldCheck, Hourglass, ClipboardList, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export function InstructorDashboard() {
  const [session, setSession] = useState<ClassSession | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      const [classData, userData] = await Promise.all([
        api<ClassSession[]>('/api/classes'),
        api<User[]>('/api/users')
      ]);
      setSession(classData[0] || null);
      setUsers(userData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);
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
  if (loading) return <div className="p-8 text-center font-black">LOADING COMMAND CENTER...</div>;
  const pendingUsers = users.filter(u => session?.pendingCheckIns.includes(u.id));
  const confirmedUsers = users.filter(u => session?.confirmedCheckIns.includes(u.id));
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 px-2">
        <div className="bg-black text-white p-3 rounded-2xl border-4 border-black">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black">COMMAND CENTER</h2>
          <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest">Master Lee's Roster</p>
        </div>
      </div>
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2 h-auto">
          <TabsTrigger 
            value="attendance" 
            className="border-4 border-black rounded-xl font-black data-[state=active]:bg-kidBlue data-[state=active]:text-white shadow-playful data-[state=active]:shadow-none data-[state=active]:translate-y-1 py-3"
          >
            <ClipboardList className="w-4 h-4 mr-2" /> ATTENDANCE
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
              <Hourglass className="w-5 h-5" /> PENDING ({pendingUsers.length})
            </h3>
            {pendingUsers.length === 0 ? (
              <p className="px-4 py-12 text-center font-bold text-muted-foreground border-4 border-dashed border-black/20 rounded-3xl">
                Everyone is accounted for!
              </p>
            ) : (
              pendingUsers.map(u => (
                <PlayfulCard key={u.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{u.avatar}</span>
                    <div>
                      <p className="font-black leading-tight">{u.name}</p>
                      <p className="text-xs font-bold text-muted-foreground">{u.belt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <PlayfulButton variant="green" size="sm" onClick={() => handleAction(u.id, 'approve')}>
                      <Check className="w-5 h-5" />
                    </PlayfulButton>
                    <PlayfulButton variant="white" size="sm" onClick={() => handleAction(u.id, 'deny')}>
                      <X className="w-5 h-5" />
                    </PlayfulButton>
                  </div>
                </PlayfulCard>
              ))
            )}
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-black px-2 flex items-center gap-2">
              <Users className="w-5 h-5" /> ON MAT ({confirmedUsers.length})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {confirmedUsers.map(u => (
                <PlayfulCard key={u.id} color="bg-kidBlue/10" className="p-4 flex flex-col items-center text-center">
                  <span className="text-4xl mb-2">{u.avatar}</span>
                  <p className="font-black text-sm">{u.name}</p>
                  <div className="mt-2 bg-kidGreen text-white px-2 py-0.5 rounded-full border-2 border-black text-[10px] font-black">
                    CONFIRMED
                  </div>
                </PlayfulCard>
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