import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Send, 
  TrendingUp, 
  FileText, 
  Award,
  MapPin,
  DollarSign,
  Calendar,
  Activity,
  Zap,
  ExternalLink,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { Job } from "@/utils/jobMatcher";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    const storedJobs = localStorage.getItem('jobplexity_applied_jobs');
    if (storedJobs) {
      const jobs: Job[] = JSON.parse(storedJobs);
      setAppliedJobs(jobs.filter(j => j.status === 'applied' || j.status === 'failed'));
    }
  }, []);

  const stats = {
    totalApplied: appliedJobs.filter(j => j.status === 'applied').length,
    failed: appliedJobs.filter(j => j.status === 'failed').length,
    successRate: appliedJobs.length > 0 
      ? Math.round((appliedJobs.filter(j => j.status === 'applied').length / appliedJobs.length) * 100)
      : 0,
  };

  const upcomingApplications = [
    { title: "Backend Engineer", company: "CloudTech", time: "In 2 hours" },
    { title: "DevOps Engineer", company: "DataFlow", time: "In 5 hours" },
    { title: "Mobile Developer", company: "AppStudio", time: "Tomorrow" }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-serif text-2xl font-bold">JOBPLEXITY</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">Home</Button>
              </Link>
              <Button size="sm">Profile</Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-muted-foreground">Your AI agent has been busy applying to jobs for you</p>
          </div>
          <div className="flex gap-2">
            <Link to="/interview-prep">
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Interview Prep
              </Button>
            </Link>
            <Link to="/onboarding">
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Apply to More Jobs
              </Button>
            </Link>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-card border-l-4 border-l-primary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Applied</span>
              <Send className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold font-serif">{stats.totalApplied}</p>
            <p className="text-xs text-muted-foreground mt-1">Successfully applied</p>
          </Card>

          <Card className="p-6 shadow-card border-l-4 border-l-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Failed</span>
              <Activity className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold font-serif">{stats.failed}</p>
            <p className="text-xs text-muted-foreground mt-1">Manual action required</p>
          </Card>

          <Card className="p-6 shadow-card border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <Award className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold font-serif">{stats.successRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Applications successful</p>
          </Card>

          <Card className="p-6 shadow-card border-l-4 border-l-primary-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Match</span>
              <TrendingUp className="w-5 h-5 text-primary-dark" />
            </div>
            <p className="text-3xl font-bold font-serif">
              {appliedJobs.length > 0 
                ? Math.round(appliedJobs.reduce((acc, j) => acc + j.match, 0) / appliedJobs.length)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Average job match</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Applications */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="applied" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="applied">Applied ({appliedJobs.length})</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
              </TabsList>

              <TabsContent value="applied" className="space-y-4 mt-6">
                {appliedJobs.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="font-serif text-xl font-semibold mb-2">No Applications Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete your profile setup to start auto-applying to jobs
                    </p>
                    <Link to="/onboarding">
                      <Button>Set Up Profile</Button>
                    </Link>
                  </Card>
                ) : (
                  appliedJobs.map((job: Job) => (
                    <Card key={job.id} className="p-6 hover:shadow-teal transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif text-xl font-semibold">{job.title}</h3>
                            {job.status === 'failed' && (
                              <Badge variant="destructive" className="text-xs">Failed</Badge>
                            )}
                          </div>
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
                      <div className="flex items-center justify-between gap-4">
                        {job.customResume && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const blob = new Blob([job.customResume!], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `resume-${job.company.replace(/\s+/g, '-')}.txt`;
                              a.click();
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Custom Resume
                          </Button>
                        )}
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          View Job <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4 mt-6">
                <Card className="p-8 text-center">
                  <Activity className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold mb-2">AI Agent Working</h3>
                  <p className="text-muted-foreground mb-4">
                    Your AI agent continuously scans for new job matches. Applications are processed automatically.
                  </p>
                  <Link to="/onboarding">
                    <Button variant="outline">Update Preferences</Button>
                  </Link>
                </Card>
              </TabsContent>

              <TabsContent value="interviews" className="mt-6">
                <Card className="p-8 text-center">
                  <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold mb-2">Interview Grading & Certification</h3>
                  <p className="text-muted-foreground mb-4">
                    Get AI-powered interview feedback and validate your certifications
                  </p>
                  <Link to="/interview-prep">
                    <Button>Try Interview Prep Tools</Button>
                  </Link>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Agent Status */}
          <div className="space-y-6">
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold">AI Agent Status</h3>
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-primary">Active 24/7</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Jobs Scanned Today</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Applications Sent</span>
                  <span className="font-semibold">{stats.totalApplied}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold text-primary">{stats.successRate}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <h3 className="font-serif text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Resumes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Update Preferences
                </Button>
                <Link to="/interview-prep" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    Interview Prep
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary to-primary-dark text-white shadow-teal">
              <h3 className="font-serif text-lg font-semibold mb-2">Upgrade to Pro</h3>
              <p className="text-sm opacity-90 mb-4">
                Get priority applications and advanced AI features
              </p>
              <Button variant="secondary" className="w-full">
                Learn More
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
