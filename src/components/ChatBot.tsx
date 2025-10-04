import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, X, MessageSquare, FileText, Mail, Briefcase, Plus, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface JobResult {
  id: string;
  company: string;
  title: string;
  matchScore: number;
  snippet: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  summary?: string;
  results?: JobResult[];
}

interface ChatBotProps {
  onStartApplying?: () => void;
}

export const ChatBot = ({ onStartApplying }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = user
        ? `Hi ${user.name}! Tell me what job you're looking for and I'll find matches for you.`
        : "Hi! Tell me what job you're looking for. Sign in to apply instantly!";
      
      setTimeout(() => {
        setMessages([{ role: 'assistant', content: welcomeMessage }]);
      }, 500);
    }
  }, [isOpen, user]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyC7f1K1ST77E0ZY68Qhf8NaV71Rrb06BJk`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                     text: `You are a friendly job-search assistant. Parse the user's job request and extract: job title, seniority level, location/timezone, salary range, years of experience, and number of applications they want.

User request: "${userMessage}"

Then generate ${Math.min(5, Math.floor(Math.random() * 3) + 3)} realistic job results with: company name, job title, match score (80-98%), and a brief snippet about the role.

Return ONLY a JSON object with this structure:
{
  "summary": "1-2 line friendly summary of what you found",
  "results": [
    {
      "id": "unique-id",
      "company": "Company Name",
      "title": "Job Title",
      "matchScore": 95,
      "snippet": "Brief description of the role"
    }
  ]
}

Make it conversational and helpful. If the request is unclear, use reasonable defaults (remote, mid-level, market rate salary).`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help! Could you rephrase that?";

      setTimeout(() => {
        try {
          // Try to parse JSON from the response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: parsed.summary || aiResponse,
              summary: parsed.summary,
              results: parsed.results || []
            }]);
          } else {
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
          }
        } catch {
          setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        }
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
        size="icon"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
      <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">Jobplexity AI</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-primary-foreground hover:bg-primary-light"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <div className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground max-w-[80%]'
                    : 'bg-muted max-w-full'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
            
            {/* Job Results */}
            {msg.role === 'assistant' && msg.results && msg.results.length > 0 && (
              <div className="ml-10 mt-3 space-y-2">
                {msg.results.map((job) => (
                  <Card key={job.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{job.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {job.matchScore}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{job.company}</p>
                        <p className="text-xs text-muted-foreground">{job.snippet}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Cover Letter
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <Briefcase className="w-3 h-3 mr-1" />
                        Resume
                      </Button>
                      <Button size="sm" className="h-7 text-xs">
                        <Send className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Auto-Apply
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 'Remote React dev, mid-level, EST, $50–80k — apply to 5 matches'"
            disabled={isTyping}
            className="text-sm"
          />
          <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
