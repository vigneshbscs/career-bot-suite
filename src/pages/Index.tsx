import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, Brain } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChatBot } from "@/components/ChatBot";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
              <Link to="/dashboard" className="text-sm hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/onboarding" className="text-sm hover:text-primary transition-colors">Get Started</Link>
              <Button size="sm">Sign In</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
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

      <ChatBot onStartApplying={() => navigate(user ? "/onboarding" : "/auth")} />
    </div>
  );
};

export default Index;
