import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { StudentDashboard } from '@/components/StudentDashboard';
import { InstructorDashboard } from '@/components/InstructorDashboard';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { LogOut, Rocket, Settings, ChevronRight, UserCircle, ShieldCheck } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { useNavigate, useLocation } from 'react-router-dom';
export function HomePage() {
  const currentUser = useAppStore(s => s.currentUser);
  const userRole = useAppStore(s => s.userRole);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const setUserRole = useAppStore(s => s.setUserRole);
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
        await restoreSession();
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('demo') === 'true') {
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
  }, [restoreSession, location.search]);
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
  // ROLE SELECTION SCREEN
  if (!userRole) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 max-w-md mx-auto min-h-[80vh] flex flex-col justify-center gap-12">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-kidRed mx-auto border-4 border-black rounded-3xl shadow-playful flex items-center justify-center -rotate-6 animate-in zoom-in duration-500">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic leading-none uppercase">TaeKwonGo</h1>
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Choose Your Path</p>
          </div>
          <div className="space-y-6">
            <PlayfulButton 
              variant="blue" 
              size="xl" 
              className="w-full py-12 flex-col h-auto"
              onClick={() => setUserRole('student')}
            >
              <UserCircle className="w-8 h-8 mb-2" />
              <span className="text-2xl font-black italic">I AM A STUDENT</span>
            </PlayfulButton>
            <PlayfulButton 
              variant="yellow" 
              size="xl" 
              className="w-full py-12 flex-col h-auto"
              onClick={() => setUserRole('instructor')}
            >
              <ShieldCheck className="w-8 h-8 mb-2" />
              <span className="text-2xl font-black italic text-black">I AM AN INSTRUCTOR</span>
            </PlayfulButton>
          </div>
        </div>
        <Toaster richColors position="top-center" />
      </div>
    );
  }
  // STUDENT LOGIN FLOW
  if (userRole === 'student' && !currentUser) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black p-6 flex flex-col justify-center gap-8 animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => setUserRole(null)}
          className="absolute top-6 left-6 font-black text-xs uppercase underline"
        >
          Back
        </button>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black italic tracking-tight text-kidBlue">STUDENT PORTAL</h2>
          <p className="font-bold text-muted-foreground">Log in to track your training!</p>
        </div>
        <div className="space-y-4">
          <PlayfulCard color="bg-kidBlue/10" className="border-kidBlue">
             <div className="flex flex-col gap-4">
                <PlayfulButton variant="blue" onClick={() => navigate('/settings')} className="w-full">
                  CREATE MY PROFILE <ChevronRight className="w-4 h-4 ml-2" />
                </PlayfulButton>
             </div>
          </PlayfulCard>
          {mockUsers.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-center text-muted-foreground uppercase">Or select a demo student:</p>
              {mockUsers.filter(u => u.role === 'student').map(u => (
                <button
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  className="w-full flex items-center gap-4 p-4 border-4 border-black rounded-2xl bg-white shadow-playful hover:translate-x-1 active:shadow-none transition-all text-left"
                >
                  <span className="text-4xl">{u.avatar}</span>
                  <div className="flex-1">
                    <p className="font-black text-lg">{u.name}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">{u.belt}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <Toaster richColors position="top-center" />
      </div>
    );
  }
  // INSTRUCTOR BYPASS/LOGIN
  if (userRole === 'instructor' && !currentUser) {
    // For demo, we auto-log in as the instructor if we find one
    const handleInstructorLogin = async () => {
      try {
        const users = await api<User[]>('/api/users');
        const instructor = users.find(u => u.role === 'instructor');
        if (instructor) setCurrentUser(instructor);
        else {
           // Fallback to mock login UI if no instructor found in DB
           setMockUsers(users);
        }
      } catch (e) {
        toast.error("Failed to find Master Lee");
      }
    };
    if (mockUsers.length === 0) {
      handleInstructorLogin();
      return <div className="max-w-md mx-auto min-h-screen border-x-4 border-black flex items-center justify-center font-black italic">Calling Master Lee...</div>;
    }
    return (
       <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black p-6 flex flex-col justify-center gap-8 animate-in slide-in-from-right duration-300">
          <button onClick={() => setUserRole(null)} className="absolute top-6 left-6 font-black text-xs uppercase underline">Back</button>
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black italic tracking-tight text-kidRed uppercase">Master Station</h2>
          </div>
          <div className="space-y-3">
            {mockUsers.filter(u => u.role === 'instructor').map(u => (
              <button
                key={u.id}
                onClick={() => setCurrentUser(u)}
                className="w-full flex items-center gap-4 p-4 border-4 border-black rounded-2xl bg-white shadow-playful hover:translate-x-1 active:shadow-none transition-all text-left"
              >
                <span className="text-4xl">{u.avatar}</span>
                <div className="flex-1">
                  <p className="font-black text-lg">{u.name}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">MASTER</p>
                </div>
              </button>
            ))}
          </div>
       </div>
    );
  }
  return (
    <div className={`max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black flex flex-col overflow-hidden relative ${userRole === 'instructor' ? 'border-kidRed/20' : 'border-kidBlue/20'}`}>
      <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className={`${userRole === 'instructor' ? 'bg-kidRed' : 'bg-kidBlue'} p-1 rounded-lg border-2 border-black`}>
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg italic tracking-tighter leading-none uppercase">TaeKwonGo</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setUserRole(null)} 
            className="p-2 hover:bg-black/5 rounded-xl transition-colors"
            title="Switch Role"
          >
            <ShieldCheck className="w-6 h-6 text-muted-foreground" />
          </button>
          {currentUser?.role === 'student' && (
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
        <div className="max-w-7xl mx-auto">
          {userRole === 'student' ? <StudentDashboard /> : <InstructorDashboard />}
        </div>
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}