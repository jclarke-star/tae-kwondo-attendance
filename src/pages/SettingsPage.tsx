import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { BELT_ORDER, User as UserType } from '@shared/types';
import { api } from '@/lib/api-client';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, User, Shield, Smile, ChevronRight } from 'lucide-react';
const EMOJIS = ['🥋', '🐯', '🦈', '🐉', '🐼', '🦅', '🦁', '🔥', '⚡️', '🌟'];
export function SettingsPage() {
  const currentUser = useAppStore(s => s.currentUser);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [belt, setBelt] = useState(BELT_ORDER[0]);
  const [avatar, setAvatar] = useState('🥋');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setBelt(currentUser.belt);
      setAvatar(currentUser.avatar);
    }
  }, [currentUser]);
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name!");
      return;
    }
    setSaving(true);
    try {
      const user = await api<UserType>('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({ 
          id: currentUser?.id, // Pass ID if it exists to update instead of create
          name, 
          belt, 
          avatar 
        })
      });
      setCurrentUser(user);
      toast.success(currentUser ? "Profile updated! KI-YAH!" : "Profile created! KI-YAH!");
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
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tight">
          {currentUser ? 'Edit Profile' : 'New Profile'}
        </h1>
        <div className="w-10" />
      </header>
      <main className="p-6 space-y-8 py-8 md:py-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 bg-white border-4 border-black rounded-[40px] shadow-playful-lg flex items-center justify-center text-6xl relative animate-in zoom-in duration-300">
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
                className={`text-2xl p-2 rounded-xl border-2 transition-all active:scale-90 ${
                  avatar === e 
                    ? 'bg-kidBlue border-black scale-110 shadow-playful-sm text-white' 
                    : 'bg-white border-black/10 hover:border-black'
                }`}
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
              className="w-full p-4 border-4 border-black rounded-2xl font-black text-xl placeholder:text-black/20 focus:outline-none bg-white shadow-playful-sm focus:translate-y-[-2px] transition-transform"
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
              className="w-full p-4 border-4 border-black rounded-2xl font-black text-xl appearance-none bg-white focus:outline-none shadow-playful-sm"
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
          {saving ? 'SAVING...' : currentUser ? 'UPDATE PROFILE' : 'CREATE PROFILE'}
        </PlayfulButton>
        {!currentUser && (
          <div className="pt-8 border-t-2 border-black/5 text-center space-y-4">
            <p className="text-xs font-bold text-muted-foreground px-4">
              Need to test as a different user?
            </p>
            <Link
              to="/?demo=true"
              className="inline-flex items-center gap-1 font-black text-sm text-kidBlue hover:underline"
            >
              SWITCH TO DEMO ACCOUNTS <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}