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
import { useNavigate, useLocation } from 'react-router-dom';
export function HomePage() {
  const currentUser = useAppStore(s => s.currentUser);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const logout = useAppStore(s => s.logout);
  const restoreSession = useAppStore(s => s.restoreSession);
  const navigate = useNavigate();
  const location = useLocation();
  const [mockUsers, setMockUsers] = useState<User[]>([]);
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    const init = async () => {
      try {
        await api('/api/init');
        const restored = await restoreSession();
        // Check for 'demo' query param
        const searchParams = new URLSearchParams(location.search);
        const isDemoMode = searchParams.get('demo') === 'true';
        if (!restored) {
          if (isDemoMode) {
            const users = await api<User[]>('/api/users');
            setMockUsers(users);
          } else {
            // Auto-redirect unregistered users to settings for onboarding
            navigate('/settings');
          }
        }
      } catch (e) {
        console.error('Failed to initialize app', e);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [restoreSession, navigate, location.search]);
  if (initializing) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black flex items-center justify-center">
        <div className="text-center space-y-4 animate-bounce">
          <Rocket className="w-16 h-16 text-kidRed mx-auto" />
          <p className="font-black text-xl italic">Tae Kwon-Do Attendance is Loading...</p>
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
          <h1 className="text-4xl font-black tracking-tighter italic leading-tight">Tae Kwon-Do Attendance</h1>
          <p className="font-bold text-muted-foreground">Train like a tiger, kick like a dragon!</p>
        </div>
        <div className="space-y-4">
          <PlayfulCard color="bg-kidBlue/10" className="border-kidBlue">
             <div className="flex flex-col gap-4">
                <h3 className="font-black text-lg text-center">STUDENT PORTAL</h3>
                <PlayfulButton variant="blue" onClick={() => navigate('/settings')} className="w-full">
                  CREATE MY PROFILE <ChevronRight className="w-4 h-4 ml-2" />
                </PlayfulButton>
             </div>
          </PlayfulCard>
          <div className="grid grid-cols-1 gap-3">
            {mockUsers.length > 0 && mockUsers.map(u => (
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
          <span className="font-black text-lg italic tracking-tighter leading-none">Tae Kwon-Do Attendance</span>
        </div>
        <div className="flex items-center gap-1">
          {currentUser.role === 'student' && (
            <button onClick={() => navigate('/settings')} className="p-2 hover:bg-black/5 rounded-xl transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          )}
          <button onClick={logout} className="p-2 hover:bg-black/5 rounded-xl transition-colors">
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