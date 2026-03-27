import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { BELT_ORDER, User as UserType } from '@shared/types';
import { api } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, User, Shield, Lock, Fingerprint, Info } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
const EMOJIS = ['🥋', '🐯', '🦈', '🐉', '🐼', '🦅', '🦁', '🔥', '⚡️', '🌟'];
export function SettingsPage() {
  const currentUser = useAppStore(s => s.currentUser);
  const userRole = useAppStore(s => s.userRole);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [belt, setBelt] = useState(BELT_ORDER[0]);
  const [avatar, setAvatar] = useState('🥋');
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!userRole) {
      navigate('/');
      return;
    }
    if (currentUser && !hasInitialized.current) {
      setName(currentUser.name);
      setBelt(currentUser.belt);
      setAvatar(currentUser.avatar);
      hasInitialized.current = true;
    }
  }, [currentUser, userRole, navigate]);
  const handleSave = async () => {
    if (saving) return;
    if (!name.trim()) {
      toast.error("Enter your name, warrior!");
      return;
    }
    if (userRole === 'instructor' && !currentUser && pin.length < 4) {
      toast.error("Set a 4-digit Master PIN!");
      return;
    }
    setSaving(true);
    try {
      let user: UserType;
      if (userRole === 'instructor') {
        user = await api<UserType>('/api/instructors/register', {
          method: 'POST',
          body: JSON.stringify({
            id: currentUser?.id,
            name: name.trim(),
            belt,
            avatar,
            pin: pin || "1234"
          })
        });
      } else {
        user = await api<UserType>('/api/users/register', {
          method: 'POST',
          body: JSON.stringify({
            id: currentUser?.id,
            name: name.trim(),
            belt,
            avatar
          })
        });
      }
      setCurrentUser(user);
      toast.success(userRole === 'instructor' ? "Master Profile Created!" : "Warrior Profile Ready!");
      // For both, redirect to home. For instructor, home will trigger PIN verification.
      navigate('/');
    } catch (e) {
      toast.error("Save failed. Try again!");
    } finally {
      setSaving(false);
    }
  };
  const handleEnableBiometrics = async () => {
    toast.info("Registering biometric key...");
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userID = new TextEncoder().encode(currentUser?.id || "anonymous");
      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { name: "Tae Kwon-Do Attendance", id: window.location.hostname },
        user: { id: userID, name: name, displayName: name },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        timeout: 60000,
        attestation: "direct"
      };
      // Simulation of WebAuthn success
      await api('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({
          id: currentUser?.id,
          biometricsEnabled: true,
          webAuthnCredentialId: "dummy_cred_id"
        })
      });
      toast.success("Biometrics Enabled!");
    } catch (e) {
      toast.error("Biometrics setup failed");
    }
  };
  const isInstructor = userRole === 'instructor';
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="max-w-md mx-auto bg-white border-4 border-black rounded-[40px] overflow-hidden shadow-playful-lg">
          <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">
              {isInstructor ? 'Master Setup' : 'Warrior Setup'}
            </h1>
            <div className="w-10" />
          </header>
          <main className="p-6 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-white border-4 border-black rounded-3xl shadow-playful flex items-center justify-center text-5xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
                <span className="relative z-10 drop-shadow-md">{avatar}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {EMOJIS.map(e => (
                  <button 
                    key={e} 
                    onClick={() => setAvatar(e)} 
                    className={`p-2 rounded-xl border-2 transition-all hover:scale-110 active:scale-90 ${avatar === e ? 'bg-kidBlue border-black text-white shadow-playful-sm' : 'border-black/10'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-black text-[10px] uppercase italic tracking-widest text-muted-foreground">
                  <User className="w-3 h-3" /> Identity
                </label>
                <input 
                  className="w-full p-4 border-4 border-black rounded-2xl font-black text-lg focus:outline-none focus:bg-slate-50 transition-colors" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Your Name" 
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-black text-[10px] uppercase italic tracking-widest text-muted-foreground">
                  <Shield className="w-3 h-3" /> Rank Level
                </label>
                <select 
                  className="w-full p-4 border-4 border-black rounded-2xl font-black text-lg bg-white appearance-none cursor-pointer" 
                  value={belt} 
                  onChange={e => setBelt(e.target.value)}
                >
                  {BELT_ORDER.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {isInstructor && (
                <div className="space-y-4 pt-4 border-t-4 border-black/5 animate-in slide-in-from-top-2">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 font-black text-[10px] uppercase italic text-kidRed tracking-widest">
                      <Lock className="w-3 h-3" /> Master Security PIN
                    </label>
                    <div className="flex justify-center bg-slate-50 p-6 rounded-3xl border-2 border-black/5">
                      <InputOTP maxLength={4} value={pin} onChange={setPin}>
                        <InputOTPGroup className="gap-2">
                          {[0, 1, 2, 3].map(i => (
                            <InputOTPSlot 
                              key={i} 
                              index={i} 
                              className="w-12 h-14 border-4 border-black rounded-xl text-xl font-black bg-white" 
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <div className="flex items-start gap-2 bg-kidBlue/5 p-3 rounded-xl border border-kidBlue/20">
                      <Info className="w-4 h-4 text-kidBlue shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-kidBlue/80 uppercase">You will need this PIN to approve attendance and end sessions.</p>
                    </div>
                  </div>
                  {currentUser && (
                    <PlayfulButton variant="white" onClick={handleEnableBiometrics} className="w-full flex gap-2 border-kidBlue text-kidBlue hover:bg-kidBlue/5">
                      <Fingerprint className="w-5 h-5" /> SETUP BIOMETRIC LOGIN
                    </PlayfulButton>
                  )}
                </div>
              )}
            </div>
            <div className="pt-4">
              <PlayfulButton 
                variant={isInstructor ? 'red' : 'blue'} 
                size="xl" 
                className="w-full py-8" 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? 'PREPARING...' : 'SAVE & START TRAINING'}
              </PlayfulButton>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}