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
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data for MVP
  const stats = {
    totalApplied: 247,
    activeApplications: 189,
    interviews: 12,
    todayApplied: 34
  };

  const mockJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "Remote",
      salary: "$120k - $150k",
      applied: "2 hours ago",
      status: "Applied",
      match: 95
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Hybrid - San Francisco",
      salary: "$100k - $130k",
      applied: "5 hours ago",
      status: "Applied",
      match: 88
    },
    {
      id: 3,
      title: "React Developer",
      company: "Digital Agency",
      location: "Remote",
      salary: "$90k - $110k",
      applied: "1 day ago",
      status: "Under Review",
      match: 92
    },
    {
      id: 4,
      title: "Frontend Engineer",
      company: "E-commerce Giant",
      location: "Onsite - New York",
      salary: "$110k - $140k",
      applied: "2 days ago",
      status: "Interview Scheduled",
      match: 90
    }
  ];

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
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2">Welcome back, Alex!</h1>
          <p className="text-muted-foreground">Your AI agent has been busy applying to jobs for you</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-card border-l-4 border-l-primary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Applied</span>
              <Send className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold font-serif">{stats.totalApplied}</p>
            <p className="text-xs text-muted-foreground mt-1">+{stats.todayApplied} today</p>
          </Card>

          <Card className="p-6 shadow-card border-l-4 border-l-accent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active</span>
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold font-serif">{stats.activeApplications}</p>
            <p className="text-xs text-muted-foreground mt-1">Under review</p>
          </Card>

          <Card className="p-6 shadow-card border-l-4 border-l-primary-light">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Interviews</span>
              <Award className="w-5 h-5 text-primary-light" />
            </div>
            <p className="text-3xl font-bold font-serif">{stats.interviews}</p>
            <p className="text-xs text-muted-foreground mt-1">3 this week</p>
          </Card>

          <Card className="p-6 shadow-card border-l-4 border-l-primary-dark">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <TrendingUp className="w-5 h-5 text-primary-dark" />
            </div>
            <p className="text-3xl font-bold font-serif">4.9%</p>
            <p className="text-xs text-muted-foreground mt-1">Interview conversion</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Applications */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="applied" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="applied">Applied</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
              </TabsList>

              <TabsContent value="applied" className="space-y-4 mt-6">
                {mockJobs.map((job) => (
                  <Card key={job.id} className="p-6 hover:shadow-teal transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
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
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {job.applied}
                          </span>
                        </div>
                      </div>
                      <Badge variant={job.status === "Interview Scheduled" ? "default" : "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">Match Score</span>
                          <span className="text-xs font-semibold text-primary">{job.match}%</span>
                        </div>
                        <Progress value={job.match} className="h-2" />
                      </div>
                      <Button variant="ghost" size="sm" className="ml-4">
                        <FileText className="w-4 h-4 mr-1" />
                        View Resume
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4 mt-6">
                {upcomingApplications.map((app, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{app.title}</h3>
                        <p className="text-sm text-muted-foreground">{app.company}</p>
                      </div>
                      <Badge variant="outline">{app.time}</Badge>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="interviews" className="mt-6">
                <Card className="p-8 text-center">
                  <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold mb-2">Interview Grading</h3>
                  <p className="text-muted-foreground mb-4">
                    Coming soon: AI-powered interview analysis and preparation
                  </p>
                  <Badge>Feature in Development</Badge>
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
                  <span className="font-semibold">{stats.todayApplied}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold text-primary">95%</span>
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
                <Button variant="outline" className="w-full justify-start">
                  <Award className="w-4 h-4 mr-2" />
                  Interview Prep
                </Button>
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
