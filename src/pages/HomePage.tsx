import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { StudentDashboard } from '@/components/StudentDashboard';
import { InstructorDashboard } from '@/components/InstructorDashboard';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { LogOut, Rocket } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
export function HomePage() {
  const currentUser = useAppStore(s => s.currentUser);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const logout = useAppStore(s => s.logout);
  const [mockUsers, setMockUsers] = useState<User[]>([]);
  useEffect(() => {
    const init = async () => {
      await api('/api/init');
      const users = await api<User[]>('/api/users');
      setMockUsers(users);
    };
    init();
  }, []);
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black p-6 flex flex-col justify-center gap-8">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-kidRed mx-auto border-4 border-black rounded-3xl shadow-playful flex items-center justify-center -rotate-6">
            <Rocket className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter italic">TaeKwonGo</h1>
          <p className="font-bold text-muted-foreground">Select your role to start training!</p>
        </div>
        <div className="space-y-4">
          {mockUsers.map(u => (
            <PlayfulCard 
              key={u.id} 
              className="cursor-pointer hover:translate-x-1 hover:-translate-y-1 transition-transform group"
              color={u.role === 'instructor' ? 'bg-kidBlue/20' : 'bg-white'}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{u.avatar}</span>
                <div className="flex-1">
                  <p className="text-2xl font-black">{u.name}</p>
                  <p className="font-bold text-sm text-muted-foreground uppercase">{u.role}</p>
                </div>
                <PlayfulButton 
                  variant={u.role === 'instructor' ? 'blue' : 'yellow'} 
                  size="sm"
                  onClick={() => setCurrentUser(u)}
                >
                  GO!
                </PlayfulButton>
              </div>
            </PlayfulCard>
          ))}
        </div>
        <Toaster richColors position="top-center" />
      </div>
    );
  }
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black flex flex-col overflow-hidden relative">
      {/* Playful Top Nav */}
      <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-kidRed p-1 rounded-lg border-2 border-black">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl italic tracking-tighter">TaeKwonGo</span>
        </div>
        <button 
          onClick={logout}
          className="p-2 hover:bg-black/5 rounded-xl transition-colors"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </header>
      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {currentUser.role === 'student' ? <StudentDashboard /> : <InstructorDashboard />}
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}