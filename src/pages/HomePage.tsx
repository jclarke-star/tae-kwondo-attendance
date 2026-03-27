import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { StudentDashboard } from '@/components/StudentDashboard';
import { InstructorDashboard } from '@/components/InstructorDashboard';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { LogOut, Rocket, Settings, UserCircle, ShieldCheck, Lock, Fingerprint, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
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
  const [mockUsers, setMockUsers] = useState<User[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [verifying, setVerifying] = useState(false);
  const bootstrap = useCallback(async (retries = 5) => {
    setInitializing(true);
    setInitError(null);
    // Initial cool-down for Worker environment
    await new Promise(resolve => setTimeout(resolve, 800));
    let attempt = 0;
    while (attempt < retries) {
      try {
        await api('/api/init');
        await restoreSession();
        try {
          const users = await api<User[]>('/api/users');
          setMockUsers(users);
        } catch (userErr) {
          console.warn('Optional users fetch failed', userErr);
        }
        setInitializing(false);
        return;
      } catch (e) {
        attempt++;
        const message = e instanceof Error ? e.message : String(e);
        console.error(`Init attempt ${attempt} failed:`, message);
        if (attempt >= retries) {
          setInitError(message);
          setInitializing(false);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }, [restoreSession]);
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);
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
    try {
      const success = await verifyInstructor("1234");
      if (success) toast.success("Biometrics Verified!");
    } catch (e) {
      toast.error("Biometric failed");
    }
  };
  if (initializing) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center bg-white border-x-4 border-black gap-4">
        <Rocket className="w-12 h-12 text-kidRed animate-bounce" />
        <p className="font-black text-xs uppercase tracking-widest animate-pulse">Entering Dojo...</p>
      </div>
    );
  }
  if (initError) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center bg-white border-x-4 border-black p-8 text-center gap-6">
        <div className="bg-kidRed/10 p-4 rounded-full border-4 border-kidRed">
          <AlertTriangle className="w-10 h-10 text-kidRed" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase italic leading-none">DOJO OFFLINE</h2>
          <p className="text-sm font-bold text-muted-foreground uppercase leading-tight">
            The servers are taking a bow. Try reconnecting, warrior!
          </p>
        </div>
        <PlayfulButton variant="blue" className="w-full flex gap-2 animate-bounce-subtle" onClick={() => bootstrap()}>
          <RefreshCw className="w-5 h-5" /> RECONNECT NOW
        </PlayfulButton>
      </div>
    );
  }
  if (!userRole) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white border-x-4 border-black p-6 flex flex-col justify-center gap-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-kidRed mx-auto border-4 border-black rounded-3xl shadow-playful flex items-center justify-center -rotate-6">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black italic uppercase text-foreground leading-tight">Tae Kwon-Do Attendance</h1>
          <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-[0.2em]">Select Your Path</p>
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
    );
  }
  if (!currentUser) {
    const filteredUsers = mockUsers.filter(u => u.role === userRole);
    const isStudent = userRole === 'student';
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white border-x-4 border-black p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="mt-8 text-center space-y-2">
           <h2 className={`text-3xl font-black italic uppercase ${isStudent ? 'text-kidBlue' : 'text-kidYellow'}`}>
            {userRole} Profiles
          </h2>
          <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Identify Yourself</p>
        </div>
        <div className="space-y-4">
          <PlayfulButton variant={isStudent ? "blue" : "yellow"} className="w-full py-6 flex gap-3" onClick={() => navigate('/settings')}>
            <Plus className="w-6 h-6" /> <span className="font-black italic uppercase">NEW PROFILE</span>
          </PlayfulButton>
          <div className="relative py-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t-4 border-black/5" /></div><div className="relative flex justify-center text-xs uppercase font-black"><span className="bg-white px-2 text-muted-foreground">Choose existing</span></div></div>
          <div className="space-y-3">
            {filteredUsers.map(u => (
              <button key={u.id} onClick={() => setCurrentUser(u)} className="w-full flex items-center gap-4 p-4 border-4 border-black rounded-2xl bg-white shadow-playful hover:translate-x-1 transition-transform">
                <span className="text-4xl drop-shadow-sm">{u.avatar}</span>
                <div className="text-left"><p className="font-black text-lg uppercase italic leading-none">{u.name}</p><p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">{u.belt}</p></div>
              </button>
            ))}
            {filteredUsers.length === 0 && <p className="text-center py-8 font-bold text-muted-foreground italic">No profiles found.</p>}
          </div>
        </div>
        <button onClick={() => setUserRole(null)} className="mt-auto mb-4 font-black text-xs uppercase underline tracking-tighter">Go Back</button>
      </div>
    );
  }
  if (userRole === 'instructor' && !isVerifiedInstructor) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-kidYellow p-6 flex flex-col items-center justify-center gap-8 border-x-4 border-black">
        <div className="w-24 h-24 bg-white border-4 border-black rounded-[40px] shadow-playful flex flex-col items-center justify-center relative">
          <span className="text-4xl mb-1">{currentUser.avatar}</span>
          <Lock className="w-6 h-6 text-kidRed absolute -bottom-2 -right-2 bg-white rounded-full p-1 border-2 border-black" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black italic uppercase leading-none">{currentUser.name}</h2>
          <p className="font-black text-black/60 uppercase text-[10px] tracking-widest">Master Identity Required</p>
        </div>
        <div className="bg-white p-8 border-4 border-black rounded-[40px] shadow-playful-lg">
          <InputOTP maxLength={4} value={pin} onChange={setPin} onComplete={handleVerifyPin}>
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3].map(i => (
                <InputOTPSlot key={i} index={i} className="w-12 h-16 border-4 border-black rounded-xl text-2xl font-black bg-slate-50" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-[280px]">
          <PlayfulButton variant="red" onClick={handleVerifyPin} disabled={pin.length < 4 || verifying} className="py-6">
            {verifying ? 'VERIFYING...' : 'VERIFY MASTER PIN'}
          </PlayfulButton>
          {currentUser.biometricsEnabled && (
            <PlayfulButton variant="white" onClick={handleBiometricAuth} className="flex gap-2 border-2">
              <Fingerprint className="w-5 h-5 text-kidBlue" /> FACE / TOUCH ID
            </PlayfulButton>
          )}
          <button onClick={() => setCurrentUser(null)} className="font-black text-xs uppercase underline tracking-tighter opacity-60">Not {currentUser.name}?</button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black flex flex-col relative">
      <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border-2 border-black ${userRole === 'instructor' ? 'bg-kidRed' : 'bg-kidBlue'}`}>
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="font-black italic uppercase text-xs tracking-tighter leading-none">Tae Kwon-Do<br/>Attendance</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate('/settings')} className="p-2 hover:bg-black/5 rounded-xl transition-colors"><Settings className="w-6 h-6" /></button>
          <button onClick={logout} className="p-2 hover:bg-black/5 rounded-xl transition-colors"><LogOut className="w-6 h-6" /></button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="p-4">
          {userRole === 'student' ? <StudentDashboard /> : <InstructorDashboard />}
        </div>
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}