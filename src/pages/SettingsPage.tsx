import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { BELT_ORDER } from '@shared/types';
import { api } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, User, Shield, Smile } from 'lucide-react';
const EMOJIS = ['🥋', '🐯', '🦈', '🐉', '🐼', '🦅', '🦁', '🔥', '⚡️', '🌟'];
export function SettingsPage() {
  const currentUser = useAppStore(s => s.currentUser);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const navigate = useNavigate();
  const [name, setName] = useState(currentUser?.name || '');
  const [belt, setBelt] = useState(currentUser?.belt || BELT_ORDER[0]);
  const [avatar, setAvatar] = useState(currentUser?.avatar || '🥋');
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name!");
      return;
    }
    setSaving(true);
    try {
      const user = await api<any>('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, belt, avatar })
      });
      setCurrentUser(user);
      toast.success("Profile saved! KI-YAH!");
      navigate('/');
    } catch (e) {
      toast.error("Save failed. Try again!");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-x-4 border-black">
      <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 rounded-xl">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black">MY PROFILE</h1>
        <div className="w-10" />
      </header>
      <main className="p-6 space-y-8 py-8 md:py-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 bg-white border-4 border-black rounded-[40px] shadow-playful-lg flex items-center justify-center text-6xl relative">
            {avatar}
            <div className="absolute -bottom-2 -right-2 bg-kidYellow p-2 rounded-full border-2 border-black">
              <Smile className="w-4 h-4" />
            </div>
          </div>
          <p className="font-black text-xs text-muted-foreground uppercase tracking-widest">Choose Your Warrior</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EMOJIS.map(e => (
              <button 
                key={e} 
                onClick={() => setAvatar(e)}
                className={`text-2xl p-2 rounded-xl border-2 transition-all ${avatar === e ? 'bg-kidBlue border-black scale-110' : 'bg-white border-transparent hover:border-black/20'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-black text-sm px-1">
              <User className="w-4 h-4" /> STUDENT NAME
            </label>
            <input
              className="w-full p-4 border-4 border-black rounded-2xl font-black text-xl placeholder:text-black/20 focus:outline-none"
              placeholder="Enter name..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-black text-sm px-1">
              <Shield className="w-4 h-4" /> CURRENT BELT
            </label>
            <select
              className="w-full p-4 border-4 border-black rounded-2xl font-black text-xl appearance-none bg-white focus:outline-none"
              value={belt}
              onChange={e => setBelt(e.target.value)}
            >
              {BELT_ORDER.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
        <PlayfulButton 
          variant="red" 
          size="xl" 
          className="w-full mt-4" 
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? 'SAVING...' : 'SAVE PROFILE'}
        </PlayfulButton>
        <p className="text-center text-xs font-bold text-muted-foreground px-4">
          By saving your profile, you'll be able to track your belt progress and earn badges!
        </p>
      </main>
    </div>
  );
}