import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { BELT_ORDER, User as UserType } from '@shared/types';
import { api } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, User, Shield, Lock, Fingerprint } from 'lucide-react';
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
    if (userRole === 'instructor' && !currentUser && !pin) {
      toast.error("Set a Master PIN!");
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
      toast.success("Warrior Profile Ready! KI-YAH!");
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
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="max-w-md mx-auto bg-white border-4 border-black rounded-[40px] overflow-hidden shadow-playful-lg">
          <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white">
            <button onClick={() => navigate(-1)} className="p-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black uppercase italic">
              {userRole === 'instructor' ? 'Master Setup' : 'Warrior Setup'}
            </h1>
            <div className="w-10" />
          </header>
          <main className="p-6 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-white border-4 border-black rounded-3xl shadow-playful flex items-center justify-center text-5xl">
                {avatar}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setAvatar(e)} className={`p-2 rounded-xl border-2 ${avatar === e ? 'bg-kidBlue border-black text-white' : 'border-black/10'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-black text-xs uppercase italic"><User className="w-4 h-4" /> Name</label>
                <input className="w-full p-4 border-4 border-black rounded-2xl font-black text-lg focus:outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-black text-xs uppercase italic"><Shield className="w-4 h-4" /> Rank</label>
                <select className="w-full p-4 border-4 border-black rounded-2xl font-black text-lg bg-white" value={belt} onChange={e => setBelt(e.target.value)}>
                  {BELT_ORDER.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {userRole === 'instructor' && (
                <div className="space-y-4 pt-4 border-t-4 border-black/5">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-black text-xs uppercase italic text-kidRed"><Lock className="w-4 h-4" /> Set Master PIN</label>
                    <div className="flex justify-center">
                      <InputOTP maxLength={4} value={pin} onChange={setPin}>
                        <InputOTPGroup className="gap-2">
                          {[0, 1, 2, 3].map(i => <InputOTPSlot key={i} index={i} className="w-12 h-14 border-4 border-black rounded-xl text-xl font-black" />)}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  {currentUser && (
                    <PlayfulButton variant="white" onClick={handleEnableBiometrics} className="w-full flex gap-2 border-kidBlue text-kidBlue">
                      <Fingerprint className="w-5 h-5" /> ENABLE FACE / TOUCH ID
                    </PlayfulButton>
                  )}
                </div>
              )}
            </div>
            <PlayfulButton variant={userRole === 'instructor' ? 'red' : 'blue'} size="xl" className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? 'PREPARING...' : 'SAVE & ENTER'}
            </PlayfulButton>
          </main>
        </div>
      </div>
    </div>
  );
}