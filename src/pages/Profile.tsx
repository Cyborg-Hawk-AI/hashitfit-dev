import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/hooks/useAuth";
import { SectionTitle } from "@/components/ui-components";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { FitnessSnapshotCard } from "@/components/profile/FitnessSnapshotCard";
import { CoachSuggestionCard } from "@/components/profile/CoachSuggestionCard";
import { FitnessJourneyTimeline } from "@/components/profile/FitnessJourneyTimeline";
import { GoalsSummaryBlock } from "@/components/profile/GoalsSummaryBlock";
import { EnhancedAICoachCard } from "@/components/profile/EnhancedAICoachCard";
import { QuickActionPanel } from "@/components/profile/QuickActionPanel";
import { BodyMetricsCard } from "@/components/profile/BodyMetricsCard";
import { FitnessPreferencesCard } from "@/components/profile/FitnessPreferencesCard";
import { NutritionPreferencesCard } from "@/components/profile/NutritionPreferencesCard";
import { AppSettingsCard } from "@/components/profile/AppSettingsCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ProfilePage() {
  const { user, updateUser } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your fitness data will be prepared and emailed to you shortly.",
    });
  };

  const handleReassess = () => {
    toast({
      title: "Profile Reassessed",
      description: "Your fitness plan has been updated based on your current progress.",
    });
  };

  const handleLogWeight = () => {
    toast({
      title: "Log Weight",
      description: "Weight logging feature coming soon!",
    });
  };

  const handleUploadPhoto = () => {
    toast({
      title: "Upload Photo",
      description: "Progress photo upload coming soon!",
    });
  };

  const handleViewProgress = () => {
    navigate('/progress');
  };

  const handleNutritionSettings = () => {
    toast({
      title: "Nutrition Settings",
      description: "Advanced nutrition settings coming soon!",
    });
  };

  const handleUpdateGoals = () => {
    toast({
      title: "Update Goals",
      description: "Goal reassessment feature coming soon!",
    });
  };

  const handleAddMilestone = (milestone: any) => {
    toast({
      title: "Milestone Added",
      description: `"${milestone.title}" has been added to your journey!`,
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Delete Account",
      description: "Account deletion requires email confirmation. Feature coming soon.",
      variant: "destructive"
    });
  };

  const handleApplyTip = () => {
    navigate('/assessment');
    toast({
      title: "Opening Goal Settings",
      description: "Adjust your goals based on AI recommendations.",
    });
  };

  const handleAdjustPlan = () => {
    toast({
      title: "Plan Adjustment",
      description: "Redirecting to plan customization...",
    });
  };

  const handleMessageCoach = () => {
    navigate('/chat');
    toast({
      title: "Coach Chat",
      description: "Opening chat with your AI coach.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50/50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportData}
              className="flex items-center"
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center text-destructive hover:text-destructive"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="pt-6 px-4 pb-24 animate-fade-in max-w-lg mx-auto">
        <SectionTitle title="Profile" subtitle="Your fitness control center" />
        
        {/* Enhanced Profile Header with Progress Ring */}
        <ProfileHeader user={user} />
        
        {/* Fitness Snapshot */}
        <FitnessSnapshotCard />
        
        {/* Coach Suggestion Card (Conditional) */}
        <CoachSuggestionCard 
          proteinCompliance={58}
          workoutsThisWeek={1}
          onAdjustPlan={handleAdjustPlan}
          onMessageCoach={handleMessageCoach}
        />
        
        {/* Enhanced AI Coach Assistant */}
        <EnhancedAICoachCard 
          onReassess={handleReassess}
          onApplyTip={handleApplyTip}
          isOverdue={false}
        />
        
        {/* Enhanced Fitness Journey Timeline */}
        <FitnessJourneyTimeline onAddMilestone={handleAddMilestone} />
        
        {/* Enhanced Goals Summary */}
        <GoalsSummaryBlock onUpdateGoals={handleUpdateGoals} />
        
        {/* Quick Actions */}
        <QuickActionPanel
          onLogWeight={handleLogWeight}
          onUploadPhoto={handleUploadPhoto}
          onReassess={handleReassess}
          onViewProgress={handleViewProgress}
          onNutritionSettings={handleNutritionSettings}
        />
        
        {/* Enhanced Detailed Settings in Accordion */}
        <Accordion type="single" collapsible className="mb-6">
          <AccordionItem value="body-metrics">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center space-x-2">
                <span>📏</span>
                <span>Body Metrics</span>
                <span className="text-sm text-muted-foreground ml-auto">Current: 73.2kg | ⬇️1.8kg</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <BodyMetricsCard user={user} updateUser={updateUser} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="fitness-preferences">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center space-x-2">
                <span>🏋️</span>
                <span>Fitness Preferences</span>
                <span className="text-sm text-muted-foreground ml-auto">5x/week – Muscle Gain</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <FitnessPreferencesCard user={user} updateUser={updateUser} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="nutrition-preferences">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center space-x-2">
                <span>🍽️</span>
                <span>Nutrition Preferences</span>
                <span className="text-sm text-muted-foreground ml-auto">Standard Diet</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <NutritionPreferencesCard user={user} updateUser={updateUser} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="app-settings">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center space-x-2">
                <span>⚙️</span>
                <span>App Settings</span>
                <span className="text-sm text-muted-foreground ml-auto">Notifications On</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <AppSettingsCard />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Footer Actions */}
        <div className="space-y-2 mb-6">
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </div>
        
        {/* Footer Links */}
        <div className="text-center text-sm text-muted-foreground space-x-4">
          <a href="#" className="hover:text-foreground">Terms</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground">Privacy Policy</a>
        </div>
      </main>
      
      <NavigationBar />
    </div>
  );
}
