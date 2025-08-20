
import { useState } from "react";
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trophy, Calendar, Filter } from "lucide-react";

interface Milestone {
  id: number;
  emoji: string;
  title: string;
  date: string;
  isUserAdded?: boolean;
  type: 'achievement' | 'custom';
}

interface FitnessJourneyTimelineProps {
  milestones?: Milestone[];
  onAddMilestone?: (milestone: Omit<Milestone, 'id'>) => void;
}

export function FitnessJourneyTimeline({
  milestones = [
    { id: 1, emoji: "🎯", title: "First workout completed", date: "2 weeks ago", type: 'achievement' },
    { id: 2, emoji: "🍎", title: "First meal tracked", date: "10 days ago", type: 'achievement' },
    { id: 3, emoji: "🔥", title: "Longest streak achieved", date: "5 days ago", type: 'achievement' },
    { id: 4, emoji: "🏃", title: "Ran 5K", date: "3 days ago", isUserAdded: true, type: 'custom' }
  ],
  onAddMilestone
}: FitnessJourneyTimelineProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'achievements' | 'custom'>('all');
  const [newMilestone, setNewMilestone] = useState({
    emoji: "🎯",
    title: "",
    date: new Date().toISOString().split('T')[0]
  });

  const emojiOptions = ["🎯", "🏃", "💪", "🔥", "🏆", "⭐", "🎉", "✨", "🚀", "💫"];

  const handleAddMilestone = () => {
    if (newMilestone.title.trim()) {
      onAddMilestone?.({
        ...newMilestone,
        isUserAdded: true,
        type: 'custom'
      });
      setNewMilestone({ emoji: "🎯", title: "", date: new Date().toISOString().split('T')[0] });
      setIsAddModalOpen(false);
    }
  };

  const filteredMilestones = milestones.filter(milestone => {
    if (filter === 'all') return true;
    if (filter === 'achievements') return milestone.type === 'achievement';
    if (filter === 'custom') return milestone.type === 'custom';
    return true;
  });

  return (
    <>
      <AnimatedCard className="mb-6" delay={200}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Trophy size={18} className="mr-2 text-hashim-600" />
            <h3 className="font-semibold">Your Fitness Journey</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={(value: 'all' | 'achievements' | 'custom') => setFilter(value)}>
              <SelectTrigger className="w-32">
                <Filter size={14} className="mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="achievements">Achievements</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center"
            >
              <Plus size={14} className="mr-1" />
              Add
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredMilestones.map((milestone, index) => (
            <div 
              key={milestone.id}
              className="flex items-start space-x-4 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-hashim-500 to-blue-500 rounded-full flex items-center justify-center text-sm">
                  {milestone.emoji}
                </div>
                {index < filteredMilestones.length - 1 && (
                  <div className="w-0.5 h-8 bg-gradient-to-b from-hashim-200 to-transparent mt-2"></div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{milestone.title}</h4>
                  <span className="text-xs text-muted-foreground">{milestone.date}</span>
                </div>
                {milestone.isUserAdded && (
                  <Badge variant="secondary" className="text-xs">
                    Your Win
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emoji">Emoji</Label>
              <Select value={newMilestone.emoji} onValueChange={(value) => setNewMilestone(prev => ({ ...prev, emoji: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emojiOptions.map((emoji) => (
                    <SelectItem key={emoji} value={emoji}>
                      {emoji} {emoji}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Achievement</Label>
              <Input
                id="title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ran my first 5K"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddMilestone} className="flex-1">
                Add Milestone
              </Button>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
