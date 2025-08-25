
import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AnimatedCard } from "./ui-components";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { aiChatService, ChatMessage } from "@/lib/supabase/services/AIChatService";
import { sendChatMessage } from "@/lib/supabase/edge-functions/ai-chat";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      user_id: "",
      content: "Hello! I'm your AI fitness assistant. I can help you with personalized workout advice, nutrition guidance, and track your progress using your actual fitness data. How can I help you today?",
      role: "assistant",
      created_at: new Date().toISOString()
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, userId } = useAuth();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, streamingMessage]);

  useEffect(() => {
    // Load chat history from Supabase when authenticated
    if (isAuthenticated && userId && isOpen) {
      fetchChatHistory();
    }
  }, [isAuthenticated, userId, isOpen]);

  const fetchChatHistory = async () => {
    if (!userId) return;
    
    try {
      const chatHistory = await aiChatService.getChatHistory(userId, 50);
      
      if (chatHistory && chatHistory.length > 0) {
        setMessages([
          {
            id: "welcome",
            user_id: userId,
            content: "Hello! I'm your AI fitness assistant. I can help you with personalized workout advice, nutrition guidance, and track your progress using your actual fitness data. How can I help you today?",
            role: "assistant",
            created_at: new Date().toISOString()
          },
          ...chatHistory
        ]);
      }
    } catch (error) {
      console.error('Error in fetchChatHistory:', error);
      setError('Failed to load chat history');
    }
  };

  // Set up real-time subscription for new messages
  useEffect(() => {
    // Clean up previous subscription if it exists
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (isAuthenticated && userId) {
      const unsubscribe = aiChatService.subscribeToNewMessages(userId, (newMessage) => {
        // Only add the message if it's not already in the list
        setMessages(prevMessages => {
          if (!prevMessages.some(msg => msg.id === newMessage.id)) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      });
      
      unsubscribeRef.current = unsubscribe;
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isAuthenticated, userId]);

  const handleSendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated || !userId) {
      setError('Please log in to use the AI fitness assistant.');
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI fitness assistant.",
        variant: "destructive"
      });
      return;
    }

    setInput("");
    const userMessageObj: ChatMessage = {
      user_id: userId,
      content: userMessage,
      role: "user",
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage("");
    setError(null); // Clear any previous errors

    try {
      // Save user message to Supabase
      await aiChatService.saveChatMessage(userMessageObj);

      // Call the enhanced edge function
      const response = await sendChatMessage(userMessage);
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        user_id: userId,
        content: response,
        role: "assistant",
        created_at: new Date().toISOString()
      };

      // Save assistant message
      await aiChatService.saveChatMessage(assistantMessage);

      // Add to messages
      setMessages((prev) => [...prev, assistantMessage]);

      // Show success toast
      toast({
        title: "Message sent",
        description: "Your fitness assistant has responded!",
      });

    } catch (error) {
      console.error('Error in chat flow:', error);
      setError('Failed to send message. Please try again.');
      
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleSendMessage();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] animate-fade-in flex items-start justify-center pt-4">
      <AnimatedCard className="w-full max-w-md mx-4 h-[85vh] sm:h-[70vh] max-h-[600px] flex flex-col p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg">Fitness Assistant</h3>
            {!isAuthenticated && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>Login Required</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-lg",
                  message.role === "user"
                    ? "bg-hashim-600 text-white rounded-tr-none"
                    : "bg-muted rounded-tl-none"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {/* Streaming message */}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-muted rounded-tl-none">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-red-50 border border-red-200 rounded-tl-none">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t flex-shrink-0 bg-white dark:bg-gray-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isLoading && input.trim()) {
                handleSendMessage();
              }
            }}
            className="flex items-center space-x-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isAuthenticated ? "Ask about your fitness data, workouts, nutrition..." : "Please log in to use the AI assistant..."}
              className="flex-1"
              disabled={isLoading || !isAuthenticated}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim() || !isAuthenticated}
              className={cn(
                "rounded-full h-10 w-10",
                input.trim() && !isLoading && isAuthenticated ? "bg-hashim-600 hover:bg-hashim-700" : ""
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </form>
        </div>
      </AnimatedCard>
    </div>
  );
}
