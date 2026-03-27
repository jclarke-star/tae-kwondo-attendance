import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { PlayfulCard } from "@/components/ui/PlayfulCard";
import { PlayfulButton } from "@/components/ui/PlayfulButton";
import { api } from "@/lib/api-client";
import { GradingEvent, User, BELT_ORDER } from "@shared/types";
import { format, isSameDay } from "date-fns";
import { Plus, Trophy, Calendar as CalendarIcon, Info } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
const COLOURED_BELTS = BELT_ORDER.filter(b => !b.includes('Black'));
const BLACK_BELTS = BELT_ORDER.filter(b => b.includes('Black'));
export function GradingManager() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [gradings, setGradings] = useState<GradingEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGrading, setNewGrading] = useState({ title: '', description: '', targetBelts: [] as string[] });
  const fetchData = async () => {
    try {
      const [gData, uData] = await Promise.all([
        api<GradingEvent[]>('/api/gradings'),
        api<User[]>('/api/users')
      ]);
      setGradings(gData);
      setUsers(uData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);
  const handleCreateGrading = async () => {
    if (!date || !newGrading.title) return;
    try {
      await api('/api/gradings', {
        method: 'POST',
        body: JSON.stringify({
          ...newGrading,
          date: date.toISOString()
        })
      });
      toast.success('Grading Scheduled!');
      setIsDialogOpen(false);
      setNewGrading({ title: '', description: '', targetBelts: [] });
      fetchData();
    } catch (e) {
      toast.error('Failed to schedule');
    }
  };
  const toggleGroup = (belts: string[], checked: boolean) => {
    setNewGrading(prev => {
      const others = prev.targetBelts.filter(b => !belts.includes(b));
      return {
        ...prev,
        targetBelts: checked ? [...others, ...belts] : others
      };
    });
  };
  const eligibleCount = useMemo(() => {
    return users.filter(u => newGrading.targetBelts.includes(u.belt)).length;
  }, [users, newGrading.targetBelts]);
  const activeGradings = gradings.filter(g => date && isSameDay(new Date(g.date), date));
  const gradingDates = gradings.map(g => new Date(g.date));
  return (
    <div className="space-y-6 pb-20">
      <PlayfulCard className="p-2 border-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-xl"
          modifiers={{ highlighted: gradingDates }}
          modifiersClassNames={{ highlighted: "bg-kidYellow/40 font-black border-2 border-black" }}
        />
      </PlayfulCard>
      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl font-black flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" /> {date ? format(date, 'MMM do') : 'Select date'}
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <PlayfulButton variant="blue" size="sm">
              <Plus className="w-4 h-4" />
            </PlayfulButton>
          </DialogTrigger>
          <DialogContent className="border-4 border-black rounded-3xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">SCHEDULE GRADING</DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">
                Set up a new belt test for your students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <input
                className="w-full p-3 border-4 border-black rounded-xl font-bold focus:ring-0"
                placeholder="Title (e.g. Spring Test)"
                value={newGrading.title}
                onChange={e => setNewGrading(prev => ({ ...prev, title: e.target.value }))}
              />
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border-2 border-black/10">
                <p className="font-black text-xs uppercase tracking-wider">Target Groups:</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="group-coloured" className="text-sm font-bold cursor-pointer">Coloured Belts (White-Red)</label>
                    <Checkbox 
                      id="group-coloured" 
                      checked={COLOURED_BELTS.every(b => newGrading.targetBelts.includes(b))}
                      onCheckedChange={(checked) => toggleGroup(COLOURED_BELTS, !!checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="group-black" className="text-sm font-bold cursor-pointer">Black Belts (1st-2nd Dan)</label>
                    <Checkbox 
                      id="group-black" 
                      checked={BLACK_BELTS.every(b => newGrading.targetBelts.includes(b))}
                      onCheckedChange={(checked) => toggleGroup(BLACK_BELTS, !!checked)}
                    />
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t-2 border-black/5 flex items-center gap-2">
                  <div className="bg-kidBlue/20 px-2 py-1 rounded-lg border border-black">
                    <span className="text-xs font-black">{eligibleCount} STUDENTS ELIGIBLE</span>
                  </div>
                </div>
              </div>
              <PlayfulButton variant="red" className="w-full" onClick={handleCreateGrading}>
                SAVE GRADING
              </PlayfulButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {activeGradings.length === 0 ? (
          <div className="text-center py-8 border-4 border-dashed border-black/20 rounded-3xl">
            <p className="font-bold text-muted-foreground italic">No events today.</p>
          </div>
        ) : (
          activeGradings.map(g => (
            <PlayfulCard key={g.id} className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-black">{g.title}</p>
                  <p className="text-xs font-bold text-muted-foreground">{g.targetBelts.length} rank categories</p>
                </div>
                <div className="bg-kidYellow p-2 rounded-xl border-2 border-black">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {g.targetBelts.length > 5 ? (
                   <span className="text-[10px] font-black px-2 py-0.5 bg-black text-white rounded-full">ALL RANKS</span>
                ) : (
                  g.targetBelts.map(b => (
                    <span key={b} className="text-[10px] font-black px-2 py-0.5 bg-black text-white rounded-full">
                      {b.toUpperCase()}
                    </span>
                  ))
                )}
              </div>
            </PlayfulCard>
          ))
        )}
      </div>
    </div>
  );
}