import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { PlayfulCard } from '@/components/ui/PlayfulCard';
import { BELT_ORDER, User as UserType } from '@shared/types';
import { api } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, User, Shield, Smile, ChevronRight } from 'lucide-react';
const EMOJIS = ['🥋', '🐯', '🦈', '🐉', '🐼', ' eagles', '🦁', '🔥', '⚡️', '🌟'];
export function SettingsPage() {
  const currentUser = useAppStore(s => s.currentUser);
  const userRole = useAppStore(s => s.userRole);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const setUserRole = useAppStore(s => s.setUserRole);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [belt, setBelt] = useState(BELT_ORDER[0]);
  const [avatar, setAvatar] = useState('🥋');
  const [saving, setSaving] = useState(false);
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!userRole) {
      navigate('/');
      return;
    }
    // Only initialize form fields once from store to prevent background updates from overwriting typing
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
    setSaving(true);
    try {
      const user = await api<UserType>('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({
          id: currentUser?.id,
          name: name.trim(),
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] border-4 border-black rounded-[40px] overflow-hidden shadow-playful-lg">
          <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white sticky top-0 z-50">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-xl font-black uppercase tracking-tight italic text-foreground">
              {currentUser ? 'Update Warrior' : 'New Warrior'}
            </h1>
            <div className="w-10" />
          </header>
          <main className="p-6 space-y-8 py-8 md:py-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 bg-white border-4 border-black rounded-[40px] shadow-playful-lg flex items-center justify-center text-6xl relative animate-in zoom-in duration-300">
                {avatar}
                <div className="absolute -bottom-2 -right-2 bg-kidYellow p-2 rounded-full border-2 border-black">
                  <Smile className="w-4 h-4 text-black" />
                </div>
              </div>
              <p className="font-black text-xs text-muted-foreground uppercase tracking-widest italic">Choose Your Avatar</p>
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
                <label className="flex items-center gap-2 font-black text-sm px-1 italic uppercase text-foreground">
                  <User className="w-4 h-4 text-kidBlue" /> Warrior Name
                </label>
                <input
                  className="w-full p-4 border-4 border-black rounded-2xl font-black text-xl placeholder:text-black/20 focus:outline-none bg-white shadow-playful-sm focus:translate-y-[-2px] transition-transform uppercase text-foreground"
                  placeholder="Your name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-black text-sm px-1 italic uppercase text-foreground">
                  <Shield className="w-4 h-4 text-kidBlue" /> Current Rank
                </label>
                <select
                  className="w-full p-4 border-4 border-black rounded-2xl font-black text-xl appearance-none bg-white focus:outline-none shadow-playful-sm uppercase text-foreground"
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
              variant="blue"
              size="xl"
              className="w-full mt-4"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? 'PREPARING...' : currentUser ? 'SAVE WARRIOR' : 'JOIN THE DOJO'}
            </PlayfulButton>
            {!currentUser && (
              <div className="pt-8 border-t-2 border-black/5 text-center space-y-4">
                <p className="text-xs font-bold text-muted-foreground px-4 uppercase italic">
                  Wrong portal?
                </p>
                <button
                  onClick={() => {
                    setUserRole(null);
                    navigate('/');
                  }}
                  className="inline-flex items-center gap-1 font-black text-sm text-kidBlue hover:underline uppercase italic"
                >
                  Change Role <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}