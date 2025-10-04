import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Target, Brain, Search, Sparkles, FileText, Mail, Briefcase, Plus, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface JobResult {
  id: string;
  company: string;
  title: string;
  matchScore: number;
  snippet: string;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<JobResult[]>([]);
  const [searchSummary, setSearchSummary] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleJobSearch = async () => {
    if (!searchInput.trim()) return;

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to search for jobs",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setSearchSummary("");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyC7f1K1ST77E0ZY68Qhf8NaV71Rrb06BJk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a friendly job-search assistant. Parse this request: "${searchInput}"

Extract: title, seniority, location/timezone, salary, experience, number of applications.

Return a 1-2 line human summary and realistic job results.

Format:
{
  "summary": "Found 5 mid-level React positions in EST timezone, $50-80k range",
  "results": [
    {
      "id": "job1",
      "company": "TechCorp",
      "title": "Mid-Level React Developer",
      "matchScore": 95,
      "snippet": "Remote-first company, EST timezone, $60-75k, 3+ years experience"
    }
  ]
}

Return ONLY valid JSON.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setSearchSummary(parsed.summary || "");
        setSearchResults(parsed.results || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-serif text-2xl font-bold">JOBPLEXITY</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {user ? (
                <Link to="/dashboard">
                  <Button size="sm">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/onboarding" className="text-sm hover:text-primary transition-colors">Get Started</Link>
                  <Link to="/auth">
                    <Button size="sm">Sign In</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* AI Job Search Bar */}
          <div className="mb-12 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-primary/10 via-primary-light/10 to-primary/10 rounded-2xl p-8 shadow-teal border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-serif text-2xl font-bold">AI Job Search</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Tell me what you want: e.g. "Remote React dev, mid-level, EST, $50–80k — apply to 5 matches with Resume A"
              </p>
              <div className="flex gap-3">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleJobSearch()}
                  placeholder="Describe your ideal job..."
                  className="flex-1 h-12 text-base"
                  disabled={isSearching}
                />
                <Button 
                  onClick={handleJobSearch} 
                  size="lg"
                  disabled={isSearching || !searchInput.trim()}
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search Jobs
                    </>
                  )}
                </Button>
              </div>

              {searchSummary && (
                <div className="mt-4 p-4 bg-background/50 rounded-xl border border-border">
                  <p className="text-sm font-medium">{searchSummary}</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  {searchResults.map((job) => (
                    <div key={job.id} className="p-4 bg-background rounded-xl border border-border hover:shadow-card transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{job.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {job.matchScore}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                          <p className="text-sm mt-2">{job.snippet}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-3 h-3 mr-1" />
                          Cover Letter
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                        <Button size="sm">
                          <Briefcase className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Plus className="w-3 h-3 mr-1" />
                          Auto-Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">AI-POWERED JOB PLATFORM</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your AI Agent
              <br />
              <span className="text-primary">Applies for Jobs 24/7</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Stop spending hours on applications. Let our AI apply to thousands of jobs with 
              custom resumes and cover letters while you focus on interviews.
            </p>
            
            <div className="flex justify-center">
              <Link to={user ? "/onboarding" : "/auth"}>
                <Button size="lg" className="group">
                  Start Auto-Applying
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {[
              { number: "10,000+", label: "Jobs Applied Daily" },
              { number: "95%", label: "Application Success Rate" },
              { number: "24/7", label: "Auto-Apply Active" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-card rounded-2xl shadow-card border border-border">
                <div className="text-4xl font-bold text-primary font-serif mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4">How Jobplexity Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to automate your job search</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Set Your Preferences",
                description: "Tell us your dream job, location, salary range, and work preferences. Upload your resume and we'll extract all the important details."
              },
              {
                icon: Brain,
                title: "AI Agent Applies",
                description: "Our AI scans thousands of jobs daily, matches them to your profile, and auto-applies with custom resumes and cover letters for each position."
              },
              {
                icon: Zap,
                title: "Track & Interview",
                description: "Monitor all applications in your dashboard. Get interview grading and preparation tips. Focus on landing offers, not filling forms."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-card rounded-2xl shadow-card border border-border hover:shadow-teal transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-3xl p-12 text-center shadow-teal">
            <h2 className="font-serif text-4xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-lg mb-8 opacity-90">Join thousands who've automated their job search with AI</p>
            <Link to="/onboarding">
              <Button size="lg" variant="secondary" className="group">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
