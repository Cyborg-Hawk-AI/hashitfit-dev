import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PlanGenerationService } from '@/lib/supabase/services/PlanGenerationService';

interface AssessmentGuardProps {
  children: ReactNode;
}

export function AssessmentGuard({ children }: AssessmentGuardProps) {
  const { isAuthenticated, userId, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAssessmentStatus = async () => {
      if (!isAuthenticated || !userId) {
        setIsChecking(false);
        return;
      }

      try {
        const hasCompleted = await PlanGenerationService.checkUserPlanStatus(userId);
        setHasCompletedAssessment(hasCompleted);
        
        if (!hasCompleted) {
          console.log('User has not completed assessment, redirecting to /assessment');
          navigate('/assessment', { replace: true });
        }
      } catch (error) {
        console.error('Error checking assessment status:', error);
        setHasCompletedAssessment(false);
        navigate('/assessment', { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    checkAssessmentStatus();
  }, [isAuthenticated, userId, navigate]);
  
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hashim-600"></div>
      </div>
    );
  }
  
  return hasCompletedAssessment ? <>{children}</> : null;
} 