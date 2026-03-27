import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { StudentDashboard } from '@/components/StudentDashboard';
import { InstructorDashboard } from '@/components/InstructorDashboard';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { LogOut, Rocket, Settings, UserCircle, ShieldCheck, Lock, Fingerprint } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
export function HomePage() {
  const currentUser = useAppStore(s => s.currentUser);
  const userRole = useAppStore(s => s.userRole);
  const isVerifiedInstructor = useAppStore(s => s.isVerifiedInstructor);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const setUserRole = useAppStore(s => s.setUserRole);
  const verifyInstructor = useAppStore(s => s.verifyInstructor);
  const logout = useAppStore(s => s.logout);
  const restoreSession = useAppStore(s => s.restoreSession);
  const navigate = useNavigate();
  const location = useLocation();
  const [mockUsers, setMockUsers] = useState<User[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [pin, setPin] = useState("");
  const [verifying, setVerifying] = useState(false);
  useEffect(() => {
    const init = async () => {
      try {
        await api('/api/init');
        const restored = await restoreSession();
        const users = await api<User[]>('/api/users');
        setMockUsers(users);
        // If instructor role but no profile exists, go to settings
        if (restored && userRole === 'instructor' && !currentUser) {
          const instructor = users.find(u => u.role === 'instructor');
          if (!instructor) {
            navigate('/settings');
          } else {
            setCurrentUser(instructor);
          }
        }
      } catch (e) {
        console.error('Init failed', e);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [restoreSession, navigate]);
  const handleVerifyPin = async () => {
    if (pin.length < 4 || verifying) return;
    setVerifying(true);
    const success = await verifyInstructor(pin);
    setVerifying(false);
    if (success) {
      toast.success("Welcome, Master!");
    } else {
      toast.error("Incorrect PIN");
      setPin("");
    }
  };
  const handleBiometricAuth = async () => {
    if (!currentUser?.biometricsEnabled) return;
    toast.info("Awaiting Biometrics...");
    // Simulated WebAuthn authentication
    try {
      // In real app: const assertion = await navigator.credentials.get({...})
      const success = await verifyInstructor("1234"); // Bypass for demo
      if (success) toast.success("Biometrics Verified!");
    } catch (e) {
      toast.error("Biometric failed");
    }
  };
  if (initializing) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center bg-white border-x-4 border-black">
        <Rocket className="w-12 h-12 text-kidRed animate-bounce" />
      </div>
    );
  }
  if (!userRole) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 max-w-md mx-auto min-h-[80vh] flex flex-col justify-center gap-12">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-kidRed mx-auto border-4 border-black rounded-3xl shadow-playful flex items-center justify-center -rotate-6">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black italic uppercase text-foreground">TaeKwonGo</h1>
            <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest">Select Your Path</p>
          </div>
          <div className="space-y-6">
            <PlayfulButton variant="blue" size="xl" className="w-full flex-col h-auto py-8" onClick={() => setUserRole('student')}>
              <UserCircle className="w-8 h-8 mb-2" />
              <span className="text-xl font-black italic">STUDENT</span>
            </PlayfulButton>
            <PlayfulButton variant="yellow" size="xl" className="w-full flex-col h-auto py-8" onClick={() => setUserRole('instructor')}>
              <ShieldCheck className="w-8 h-8 mb-2" />
              <span className="text-xl font-black italic text-black">INSTRUCTOR</span>
            </PlayfulButton>
          </div>
        </div>
        <Toaster richColors position="top-center" />
      </div>
    );
  }
  if (userRole === 'instructor' && !isVerifiedInstructor) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-kidYellow p-6 flex flex-col items-center justify-center gap-8 border-x-4 border-black">
        <div className="w-20 h-20 bg-white border-4 border-black rounded-3xl shadow-playful flex items-center justify-center"><Lock className="w-10 h-10 text-kidRed" /></div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black italic uppercase">Master Station</h2>
          <p className="font-bold text-black/60 uppercase text-[10px]">Security Required</p>
        </div>
        <div className="bg-white p-8 border-4 border-black rounded-[40px] shadow-playful-lg">
          <InputOTP maxLength={4} value={pin} onChange={setPin} onComplete={handleVerifyPin}>
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3].map(i => <InputOTPSlot key={i} index={i} className="w-12 h-16 border-4 border-black rounded-xl text-2xl font-black" />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-[280px]">
          <PlayfulButton variant="red" onClick={handleVerifyPin} disabled={pin.length < 4 || verifying}>
            {verifying ? 'VERIFYING...' : 'VERIFY PIN'}
          </PlayfulButton>
          {currentUser?.biometricsEnabled && (
            <PlayfulButton variant="white" onClick={handleBiometricAuth} className="flex gap-2">
              <Fingerprint className="w-5 h-5" /> USE FACE ID
            </PlayfulButton>
          )}
          <button onClick={() => setUserRole(null)} className="font-black text-xs uppercase underline">GO BACK</button>
        </div>
        <Toaster richColors position="top-center" />
      </div>
    );
  }
  if (userRole === 'student' && !currentUser) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white border-x-4 border-black p-6 flex flex-col justify-center gap-6">
        <h2 className="text-3xl font-black italic text-kidBlue text-center">STUDENT LOGIN</h2>
        <PlayfulButton variant="blue" onClick={() => navigate('/settings')}>NEW PROFILE</PlayfulButton>
        <div className="space-y-3">
          {mockUsers.filter(u => u.role === 'student').map(u => (
            <button key={u.id} onClick={() => setCurrentUser(u)} className="w-full flex items-center gap-4 p-4 border-4 border-black rounded-2xl bg-white shadow-playful">
              <span className="text-4xl">{u.avatar}</span>
              <div className="text-left"><p className="font-black text-lg">{u.name}</p><p className="text-[10px] font-black uppercase text-muted-foreground">{u.belt}</p></div>
            </button>
          ))}
        </div>
        <Toaster richColors position="top-center" />
      </div>
    );
  }
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black flex flex-col">
      <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Rocket className={`w-6 h-6 ${userRole === 'instructor' ? 'text-kidRed' : 'text-kidBlue'}`} />
          <span className="font-black italic uppercase">TaeKwonGo</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/settings')} className="p-2 hover:bg-black/5 rounded-xl"><Settings className="w-6 h-6" /></button>
          <button onClick={logout} className="p-2 hover:bg-black/5 rounded-xl"><LogOut className="w-6 h-6" /></button>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        {userRole === 'student' ? <StudentDashboard /> : <InstructorDashboard />}
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}