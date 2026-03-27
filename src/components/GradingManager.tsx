import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { PlayfulCard } from "@/components/ui/PlayfulCard";
import { PlayfulButton } from "@/components/ui/PlayfulButton";
import { api } from "@/lib/api-client";
import { GradingEvent, User, BELT_ORDER } from "@shared/types";
import { format, isSameDay } from "date-fns";
import { Plus, Trophy, Calendar as CalendarIcon, Info } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
  const activeGradings = gradings.filter(g => date && isSameDay(new Date(g.date), date));
  const gradingDates = gradings.map(g => new Date(g.date));
  return (
    <div className="space-y-6">
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
          <CalendarIcon className="w-5 h-5" /> {date ? format(date, 'MMM do, yyyy') : 'Select a date'}
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
            </DialogHeader>
            <div className="space-y-4 py-4">
              <input
                className="w-full p-3 border-4 border-black rounded-xl font-bold"
                placeholder="Grading Title (e.g. Spring Belt Test)"
                value={newGrading.title}
                onChange={e => setNewGrading(prev => ({ ...prev, title: e.target.value }))}
              />
              <textarea
                className="w-full p-3 border-4 border-black rounded-xl font-bold h-24"
                placeholder="Description..."
                value={newGrading.description}
                onChange={e => setNewGrading(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="space-y-2">
                <p className="font-black text-sm">TARGET BELTS:</p>
                <div className="grid grid-cols-2 gap-2">
                  {BELT_ORDER.slice(0, 5).map(belt => (
                    <div key={belt} className="flex items-center gap-2">
                      <Checkbox
                        id={belt}
                        checked={newGrading.targetBelts.includes(belt)}
                        onCheckedChange={(checked) => {
                          setNewGrading(prev => ({
                            ...prev,
                            targetBelts: checked 
                              ? [...prev.targetBelts, belt]
                              : prev.targetBelts.filter(b => b !== belt)
                          }));
                        }}
                      />
                      <label htmlFor={belt} className="text-xs font-bold leading-none">{belt}</label>
                    </div>
                  ))}
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
            <p className="font-bold text-muted-foreground">No events on this day.</p>
          </div>
        ) : (
          activeGradings.map(g => {
            const eligibleCount = users.filter(u => g.targetBelts.includes(u.belt)).length;
            return (
              <PlayfulCard key={g.id} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xl font-black">{g.title}</p>
                    <p className="text-sm font-bold text-muted-foreground">{g.description}</p>
                  </div>
                  <div className="bg-kidYellow p-2 rounded-xl border-2 border-black">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.targetBelts.map(b => (
                    <span key={b} className="text-[10px] font-black px-2 py-0.5 bg-black text-white rounded-full">
                      {b.toUpperCase()}
                    </span>
                  ))}
                </div>
                <div className="bg-kidBlue/10 p-3 rounded-xl border-2 border-black flex items-center gap-2">
                  <Info className="w-4 h-4 text-kidBlue" />
                  <p className="text-xs font-bold">
                    <span className="font-black">{eligibleCount}</span> Students eligible for this grading.
                  </p>
                </div>
              </PlayfulCard>
            );
          })
        )}
      </div>
    </div>
  );
}