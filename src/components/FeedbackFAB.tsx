import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, X, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { FeedbackService } from '@/lib/supabase/services/FeedbackService';
import { useToast } from '@/hooks/use-toast';

export function FeedbackFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature' | 'improvement'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { userId } = useAuth();
  const { toast } = useToast();

  // Debug logging
  console.log('FeedbackFAB - userId:', userId);
  console.log('FeedbackFAB - isOpen:', isOpen);

  const handleSubmit = async () => {
    if (!feedbackText.trim() || !userId) {
      toast({
        title: "Error",
        description: "Please enter your feedback and make sure you're logged in.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await FeedbackService.submitFeedback({
        user_id: userId,
        feedback_text: feedbackText.trim(),
        feedback_type: feedbackType,
        page_location: window.location.pathname,
        user_agent: navigator.userAgent
      });

      if (result.success) {
        setIsSubmitted(true);
        setFeedbackText('');
        setFeedbackType('general');
        
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback! We'll review it shortly.",
        });

        // Close dialog after a short delay
        setTimeout(() => {
          setIsOpen(false);
          setIsSubmitted(false);
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit feedback. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setIsSubmitted(false);
      setFeedbackText('');
      setFeedbackType('general');
    }
  };

  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case 'bug': return '🐛 Bug Report';
      case 'feature': return '💡 Feature Request';
      case 'improvement': return '⚡ Improvement';
      default: return '💬 General Feedback';
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <Button
        onClick={() => {
          console.log('Feedback button clicked!');
          setIsOpen(true);
        }}
        className="fixed bottom-28 left-16 z-[9999] rounded-full w-14 h-14 p-0 shadow-lg transition-all duration-300 hover:scale-110 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer pointer-events-auto"
        title="Send Feedback"
        style={{ pointerEvents: 'auto' }}
      >
        <MessageSquare size={24} className="text-white pointer-events-none" />
      </Button>

      {/* Feedback Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        console.log('Dialog onOpenChange:', open);
        handleClose();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Send Feedback
            </DialogTitle>
          </DialogHeader>

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">Thank You!</h3>
              <p className="text-sm text-gray-600">
                Your feedback has been submitted successfully.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Feedback Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="feedback-type">Feedback Type</Label>
                <Select value={feedbackType} onValueChange={(value: any) => setFeedbackType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">💬 General Feedback</SelectItem>
                    <SelectItem value="bug">🐛 Bug Report</SelectItem>
                    <SelectItem value="feature">💡 Feature Request</SelectItem>
                    <SelectItem value="improvement">⚡ Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback Text */}
              <div className="space-y-2">
                <Label htmlFor="feedback-text">Your Feedback</Label>
                <Textarea
                  id="feedback-text"
                  placeholder={`Tell us about your ${getFeedbackTypeLabel(feedbackType).toLowerCase()}...`}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!feedbackText.trim() || isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Submit Feedback
                    </div>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Page Location Info */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                <p>Page: {window.location.pathname}</p>
                <p>Time: {new Date().toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
