import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, CheckCircle2, XCircle, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Job } from '@/utils/jobMatcher';
import { ParsedResume, generateCustomResume } from '@/utils/resumeParser';

const ApplyingLive = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const storedJobs = localStorage.getItem('jobplexity_jobs');
    const storedResume = localStorage.getItem('jobplexity_resume');

    if (!storedJobs || !storedResume) {
      toast.error('No job data found. Please complete onboarding first.');
      navigate('/onboarding');
      return;
    }

    const loadedJobs: Job[] = JSON.parse(storedJobs);
    const loadedResume: ParsedResume = JSON.parse(storedResume);
    
    setJobs(loadedJobs);
    setParsedResume(loadedResume);
  }, [navigate]);

  useEffect(() => {
    if (jobs.length === 0 || !parsedResume || isComplete) return;

    const applyToJob = async (index: number) => {
      if (index >= jobs.length) {
        setIsComplete(true);
        const appliedJobs = jobs.map(job => ({
          ...job,
          status: job.status === 'applied' ? 'applied' : job.status,
        }));
        localStorage.setItem('jobplexity_applied_jobs', JSON.stringify(appliedJobs));
        toast.success('All applications completed!');
        return;
      }

      // Update job to "applying" status
      setJobs(prevJobs => {
        const newJobs = [...prevJobs];
        newJobs[index] = { ...newJobs[index], status: 'applying' };
        return newJobs;
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate custom resume for this job
      const customResume = generateCustomResume(
        parsedResume,
        jobs[index].title,
        jobs[index].description
      );

      // Simulate application (90% success rate)
      const success = Math.random() > 0.1;

      setJobs(prevJobs => {
        const newJobs = [...prevJobs];
        newJobs[index] = {
          ...newJobs[index],
          status: success ? 'applied' : 'failed',
          appliedAt: new Date(),
          customResume,
        };
        return newJobs;
      });

      if (success) {
        toast.success(`Applied to ${jobs[index].title} at ${jobs[index].company}`);
      } else {
        toast.error(`Failed to apply to ${jobs[index].title}. Manual application required.`);
      }

      setCurrentJobIndex(index + 1);
    };

    const timer = setTimeout(() => {
      applyToJob(currentJobIndex);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentJobIndex, jobs, parsedResume, isComplete]);

  const progress = jobs.length > 0 ? (currentJobIndex / jobs.length) * 100 : 0;
  const appliedCount = jobs.filter(j => j.status === 'applied').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Loader2 className={`w-4 h-4 text-primary ${!isComplete ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-primary">
              {isComplete ? 'Applications Complete' : 'AI Agent Active'}
            </span>
          </div>
          <h1 className="font-serif text-4xl font-bold mb-2">
            {isComplete ? 'Application Session Complete!' : 'Applying to Jobs...'}
          </h1>
          <p className="text-muted-foreground">
            {isComplete 
              ? 'Your applications are ready to view in the dashboard'
              : 'Watch as your AI agent customizes and submits applications'}
          </p>
        </div>

        {/* Progress Card */}
        <Card className="p-6 mb-6 shadow-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-lg">Application Progress</h3>
              <p className="text-sm text-muted-foreground">
                {appliedCount} applied • {failedCount} failed • {jobs.length - currentJobIndex} pending
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </Card>

        {/* Job List */}
        <div className="space-y-3">
          {jobs.map((job, index) => (
            <Card
              key={job.id}
              className={`p-4 transition-all duration-300 ${
                job.status === 'applying' 
                  ? 'ring-2 ring-primary shadow-teal' 
                  : job.status === 'applied'
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  : job.status === 'failed'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded whitespace-nowrap">
                      {job.match}% Match
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {job.company} • {job.location} • {job.salary}
                  </p>
                  
                  {job.status === 'applying' && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Customizing resume and applying...</span>
                    </div>
                  )}
                  
                  {job.status === 'applied' && job.customResume && (
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const blob = new Blob([job.customResume!], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `resume-${job.company.replace(/\s+/g, '-')}.txt`;
                          a.click();
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        View Custom Resume
                      </Button>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View Job <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {job.status === 'failed' && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 mt-2"
                    >
                      Try Manual Application <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {job.status === 'pending' && (
                    <div className="w-6 h-6 rounded-full border-2 border-muted" />
                  )}
                  {job.status === 'applying' && (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  )}
                  {job.status === 'applied' && (
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  )}
                  {job.status === 'failed' && (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {isComplete && (
          <div className="text-center mt-8">
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyingLive;
