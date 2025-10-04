import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2, MapPin, DollarSign, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  match: number;
  status: "pending" | "applying" | "applied";
}

const ApplyingLive = () => {
  const navigate = useNavigate();
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [totalApplied, setTotalApplied] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "Remote",
      salary: "$120k - $150k",
      match: 95,
      status: "pending"
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Hybrid - San Francisco",
      salary: "$100k - $130k",
      match: 88,
      status: "pending"
    },
    {
      id: 3,
      title: "React Developer",
      company: "Digital Agency",
      location: "Remote",
      salary: "$90k - $110k",
      match: 92,
      status: "pending"
    },
    {
      id: 4,
      title: "Frontend Engineer",
      company: "E-commerce Giant",
      location: "Onsite - New York",
      salary: "$110k - $140k",
      match: 90,
      status: "pending"
    },
    {
      id: 5,
      title: "Software Developer",
      company: "FinTech Solutions",
      location: "Remote",
      salary: "$95k - $125k",
      match: 87,
      status: "pending"
    },
    {
      id: 6,
      title: "Web Developer",
      company: "Creative Studio",
      location: "Hybrid - Austin",
      salary: "$85k - $110k",
      match: 84,
      status: "pending"
    },
    {
      id: 7,
      title: "UI Developer",
      company: "Design Systems Co",
      location: "Remote",
      salary: "$100k - $130k",
      match: 91,
      status: "pending"
    },
    {
      id: 8,
      title: "JavaScript Engineer",
      company: "Cloud Platform",
      location: "Remote",
      salary: "$115k - $145k",
      match: 93,
      status: "pending"
    }
  ]);

  useEffect(() => {
    if (currentJobIndex >= jobs.length) {
      setIsComplete(true);
      // Save applied jobs to localStorage for dashboard
      localStorage.setItem("appliedJobs", JSON.stringify(jobs));
      return;
    }

    // Set current job to applying
    const applyTimer = setTimeout(() => {
      setJobs(prev => prev.map((job, idx) => 
        idx === currentJobIndex ? { ...job, status: "applying" as const } : job
      ));

      // After 2 seconds, mark as applied and move to next
      setTimeout(() => {
        setJobs(prev => prev.map((job, idx) => 
          idx === currentJobIndex ? { ...job, status: "applied" as const } : job
        ));
        setTotalApplied(prev => prev + 1);
        setCurrentJobIndex(prev => prev + 1);
      }, 2000);
    }, 500);

    return () => clearTimeout(applyTimer);
  }, [currentJobIndex, jobs.length]);

  const progress = (totalApplied / jobs.length) * 100;

  return (
    <div className="min-h-screen py-12 px-6 bg-background">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">AI AGENT ACTIVE</span>
          </div>
          <h1 className="font-serif text-4xl font-bold mb-4">
            {isComplete ? "Application Batch Complete!" : "Applying to Jobs..."}
          </h1>
          <p className="text-muted-foreground">
            {isComplete 
              ? `Successfully applied to ${totalApplied} jobs that match your profile`
              : "Your AI agent is customizing and submitting applications based on your profile"
            }
          </p>
        </div>

        {/* Progress Stats */}
        <Card className="p-6 mb-8 shadow-teal">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                {isComplete ? (
                  <Check className="w-6 h-6 text-primary" />
                ) : (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold font-serif">{totalApplied} / {jobs.length}</p>
                <p className="text-sm text-muted-foreground">Applications Submitted</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-primary">{Math.round(progress)}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </Card>

        {/* Job Application List */}
        <div className="space-y-4 mb-8">
          {jobs.map((job, index) => (
            <Card 
              key={job.id} 
              className={`p-6 transition-all duration-500 ${
                job.status === "applying" 
                  ? "shadow-teal border-primary animate-pulse" 
                  : job.status === "applied"
                  ? "opacity-75 bg-secondary/30"
                  : "opacity-40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      job.status === "applied" 
                        ? "bg-primary text-white" 
                        : job.status === "applying"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {job.status === "applied" ? (
                        <Check className="w-5 h-5" />
                      ) : job.status === "applying" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Briefcase className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-xl font-semibold mb-1">{job.title}</h3>
                      <p className="text-muted-foreground mb-2">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                        <Badge variant="outline" className="text-primary border-primary">
                          {job.match}% Match
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {job.status === "applying" && (
                    <div className="mt-3 pl-13">
                      <p className="text-sm text-primary font-medium animate-pulse">
                        <Zap className="w-4 h-4 inline mr-1" />
                        Customizing resume and cover letter...
                      </p>
                    </div>
                  )}
                  {job.status === "applied" && (
                    <div className="mt-3 pl-13">
                      <p className="text-sm text-muted-foreground">
                        ✓ Applied with custom resume and cover letter
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        {isComplete && (
          <div className="text-center space-y-4">
            <Card className="p-6 bg-gradient-to-br from-primary to-primary-dark text-white shadow-teal">
              <h3 className="font-serif text-2xl font-bold mb-2">🎉 Batch Complete!</h3>
              <p className="mb-4 opacity-90">
                Your AI agent will continue applying to matching jobs 24/7
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate("/dashboard")}
              >
                View Dashboard
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyingLive;
