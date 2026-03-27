import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { StudentDashboard } from '@/components/StudentDashboard';
import { InstructorDashboard } from '@/components/InstructorDashboard';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { LogOut, Rocket, Settings, ChevronRight } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Link, useNavigate } from 'react-router-dom';
export function HomePage() {
  const currentUser = useAppStore(s => s.currentUser);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const logout = useAppStore(s => s.logout);
  const restoreSession = useAppStore(s => s.restoreSession);
  const navigate = useNavigate();
  const [mockUsers, setMockUsers] = useState<User[]>([]);
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    const init = async () => {
      try {
        await api('/api/init');
        const restored = await restoreSession();
        if (!restored) {
          const users = await api<User[]>('/api/users');
          setMockUsers(users);
        }
      } catch (e) {
        console.error('Failed to initialize app', e);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [restoreSession]);
  if (initializing) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black flex items-center justify-center">
        <div className="text-center space-y-4 animate-bounce">
          <Rocket className="w-16 h-16 text-kidRed mx-auto" />
          <p className="font-black text-xl italic">TaeKwonGo is Loading...</p>
        </div>
      </div>
    );
  }
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black p-6 flex flex-col justify-center gap-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-kidRed mx-auto border-4 border-black rounded-2xl shadow-playful flex items-center justify-center -rotate-6">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter italic">TaeKwonGo</h1>
          <p className="font-bold text-muted-foreground">Train like a tiger, kick like a dragon!</p>
        </div>
        <div className="space-y-4">
          <PlayfulCard color="bg-kidBlue/10" className="border-kidBlue">
             <div className="flex flex-col gap-4">
                <h3 className="font-black text-lg">NEW STUDENT?</h3>
                <PlayfulButton variant="blue" onClick={() => navigate('/settings')} className="w-full">
                  CREATE MY PROFILE <ChevronRight className="w-4 h-4 ml-2" />
                </PlayfulButton>
             </div>
          </PlayfulCard>
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-black/10" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#F8F9FA] px-2 font-black text-black/40 tracking-widest">OR CHOOSE DEMO</span></div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {mockUsers.map(u => (
              <button 
                key={u.id}
                onClick={() => setCurrentUser(u)}
                className="flex items-center gap-4 p-4 border-4 border-black rounded-2xl bg-white shadow-playful hover:translate-x-1 active:shadow-none transition-all text-left"
              >
                <span className="text-4xl">{u.avatar}</span>
                <div className="flex-1">
                  <p className="font-black text-lg">{u.name}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">{u.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <Toaster richColors position="top-center" />
      </div>
    );
  }
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black flex flex-col overflow-hidden relative">
      <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-kidRed p-1 rounded-lg border-2 border-black">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl italic tracking-tighter">TaeKwonGo</span>
        </div>
        <div className="flex items-center gap-1">
          {currentUser.role === 'student' && (
            <button onClick={() => navigate('/settings')} className="p-2 hover:bg-black/5 rounded-xl">
              <Settings className="w-6 h-6" />
            </button>
          )}
          <button onClick={logout} className="p-2 hover:bg-black/5 rounded-xl">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        {currentUser.role === 'student' ? <StudentDashboard /> : <InstructorDashboard />}
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}