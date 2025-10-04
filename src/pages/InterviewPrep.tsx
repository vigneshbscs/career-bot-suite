import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Star, Award, Rocket, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface InterviewGrade {
  score: number;
  strengths: string[];
  improvements: string[];
  overall: string;
}

interface CertificateData {
  valid: boolean;
  certificationName: string;
  organization: string;
  issueDate: string;
  score: number;
}

interface JobPreferences {
  jobTitle: string;
  location: string;
  salaryMin: string;
  workType: string;
}

const InterviewPrep = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [interviewTranscript, setInterviewTranscript] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [interviewGrade, setInterviewGrade] = useState<InterviewGrade | null>(null);
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [jobPreferences, setJobPreferences] = useState<JobPreferences>({
    jobTitle: '',
    location: '',
    salaryMin: '',
    workType: 'remote'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved data
    const savedGrade = localStorage.getItem('jobplexity_interview_grade');
    const savedCert = localStorage.getItem('jobplexity_certificate');
    const savedPrefs = localStorage.getItem('jobplexity_job_preferences');
    
    if (savedGrade) setInterviewGrade(JSON.parse(savedGrade));
    if (savedCert) setCertData(JSON.parse(savedCert));
    if (savedPrefs) setJobPreferences(JSON.parse(savedPrefs));
  }, []);

  const gradeInterview = async () => {
    if (!interviewTranscript.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your interview transcript',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyC7f1K1ST77E0ZY68Qhf8NaV71Rrb06BJk`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert interview coach. Analyze this interview transcript and provide:
1. A score out of 100
2. 3 key strengths demonstrated
3. 3 areas for improvement
4. Overall feedback (2-3 sentences)

Format your response as JSON:
{
  "score": <number>,
  "strengths": [<string>, <string>, <string>],
  "improvements": [<string>, <string>, <string>],
  "overall": "<string>"
}

Interview transcript:
${interviewTranscript}

Respond ONLY with valid JSON, no other text.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const grade = JSON.parse(jsonMatch[0]);
        setInterviewGrade(grade);
        localStorage.setItem('jobplexity_interview_grade', JSON.stringify(grade));
        toast({
          title: 'Interview Graded',
          description: `You scored ${grade.score}/100!`
        });
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Grading error:', error);
      toast({
        title: 'Error',
        description: 'Failed to grade interview',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateCertification = async () => {
    if (!certFile) {
      toast({
        title: 'Error',
        description: 'Please upload a certification image',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyC7f1K1ST77E0ZY68Qhf8NaV71Rrb06BJk`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: `Analyze this certification image. Extract: 1) Certification name 2) Issuing organization 3) Issue date 4) Validity/expiration 5) Authenticity indicators. Return JSON: {"valid": true/false, "certificationName": "name", "organization": "org", "issueDate": "date", "score": 0-100}. Respond with valid JSON only.`
                  },
                  {
                    inline_data: {
                      mime_type: certFile.type,
                      data: base64
                    }
                  }
                ]
              }]
            })
          }
        );

        const data = await response.json();
        const validation = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        try {
          const jsonMatch = validation.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const cert = JSON.parse(jsonMatch[0]);
            setCertData(cert);
            localStorage.setItem('jobplexity_certificate', JSON.stringify(cert));
            toast({
              title: 'Certificate Validated',
              description: cert.valid ? 'Certificate is valid!' : 'Certificate analyzed'
            });
            setCurrentStep(3);
          }
        } catch (e) {
          console.error('Failed to parse cert JSON:', e);
          toast({
            title: 'Error',
            description: 'Failed to parse certificate data',
            variant: 'destructive'
          });
        }
        setLoading(false);
      };
      reader.readAsDataURL(certFile);
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate certification',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const savePreferences = () => {
    if (!jobPreferences.jobTitle || !jobPreferences.location) {
      toast({
        title: 'Error',
        description: 'Please fill in job title and location',
        variant: 'destructive'
      });
      return;
    }
    localStorage.setItem('jobplexity_job_preferences', JSON.stringify(jobPreferences));
    toast({
      title: 'Preferences Saved',
      description: 'Your job preferences have been saved'
    });
    setCurrentStep(4);
  };

  const startApplying = () => {
    navigate('/onboarding');
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Prepare Your Profile</h1>
          <p className="text-muted-foreground mb-6">Complete these steps to optimize your job applications</p>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span className={currentStep >= 1 ? 'text-primary font-medium' : ''}>Interview</span>
            <span className={currentStep >= 2 ? 'text-primary font-medium' : ''}>Certificate</span>
            <span className={currentStep >= 3 ? 'text-primary font-medium' : ''}>Preferences</span>
            <span className={currentStep >= 4 ? 'text-primary font-medium' : ''}>Review</span>
          </div>
        </div>

        {/* Step 1: Interview Grading */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Step 1: Interview Grading
              </CardTitle>
              <CardDescription>
                Paste your interview transcript to get AI-powered feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="transcript">Interview Transcript</Label>
                <Textarea
                  id="transcript"
                  placeholder="Paste your interview Q&A here..."
                  value={interviewTranscript}
                  onChange={(e) => setInterviewTranscript(e.target.value)}
                  rows={10}
                  className="mt-2"
                />
              </div>
              <Button onClick={gradeInterview} disabled={loading} className="w-full">
                {loading ? 'Analyzing...' : 'Grade Interview & Continue'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              {interviewGrade && (
                <div className="mt-6 space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="text-5xl font-bold text-primary">{interviewGrade.score}</div>
                      <div className="text-sm text-muted-foreground">out of 100</div>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <Button onClick={() => setCurrentStep(2)} className="w-full">
                    Continue to Certificate
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Certificate Validation */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Step 2: Certificate Validation
              </CardTitle>
              <CardDescription>
                Upload your certification to validate and boost your application success rate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cert">Upload Certification Image</Label>
                <Input
                  id="cert"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
                {certFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {certFile.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                <Button onClick={validateCertification} disabled={loading} className="flex-1">
                  {loading ? 'Validating...' : 'Validate & Continue'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {certData && (
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Certificate Validated</h3>
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {certData.certificationName} - Score: {certData.score}/100
                  </p>
                  <Button onClick={() => setCurrentStep(3)} className="w-full">
                    Continue to Preferences
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Job Preferences */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Step 3: Job Preferences
              </CardTitle>
              <CardDescription>
                Set your job search preferences to match the best opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Desired Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Software Engineer, Product Manager"
                  value={jobPreferences.jobTitle}
                  onChange={(e) => setJobPreferences({...jobPreferences, jobTitle: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="location">Preferred Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco, Remote, New York"
                  value={jobPreferences.location}
                  onChange={(e) => setJobPreferences({...jobPreferences, location: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="salary">Minimum Salary (USD)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="e.g. 80000"
                  value={jobPreferences.salaryMin}
                  onChange={(e) => setJobPreferences({...jobPreferences, salaryMin: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="workType">Work Type</Label>
                <select
                  id="workType"
                  value={jobPreferences.workType}
                  onChange={(e) => setJobPreferences({...jobPreferences, workType: e.target.value})}
                  className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                <Button onClick={savePreferences} className="flex-1">
                  Save & Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Apply */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Step 4: Review & Start Applying
              </CardTitle>
              <CardDescription>
                Review your profile data before starting auto-apply
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Interview Results */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Interview Score
                </h3>
                <div className="text-3xl font-bold text-primary mb-2">{interviewGrade?.score}/100</div>
                <div className="text-sm space-y-1">
                  <p><strong>Strengths:</strong> {interviewGrade?.strengths.slice(0, 2).join(', ')}</p>
                  <p className="text-muted-foreground">{interviewGrade?.overall}</p>
                </div>
              </div>

              {/* Certificate Info */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Certificate
                </h3>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {certData?.certificationName}</p>
                  <p><strong>Organization:</strong> {certData?.organization}</p>
                  <p><strong>Validity Score:</strong> {certData?.score}/100</p>
                  <p className={certData?.valid ? 'text-green-500' : 'text-yellow-500'}>
                    {certData?.valid ? '✓ Valid Certificate' : '⚠ Needs Review'}
                  </p>
                </div>
              </div>

              {/* Job Preferences */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-primary" />
                  Job Preferences
                </h3>
                <div className="text-sm space-y-1">
                  <p><strong>Job Title:</strong> {jobPreferences.jobTitle}</p>
                  <p><strong>Location:</strong> {jobPreferences.location}</p>
                  <p><strong>Min Salary:</strong> ${jobPreferences.salaryMin}</p>
                  <p><strong>Work Type:</strong> {jobPreferences.workType}</p>
                </div>
              </div>

              {/* Success Rate Estimate */}
              <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                <h3 className="font-semibold mb-2">Estimated Success Rate</h3>
                <div className="text-4xl font-bold text-primary mb-2">
                  {Math.min(90, 45 + (interviewGrade?.score || 0) * 0.25 + (certData?.score || 0) * 0.20)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on your interview score and certificate validation
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                <Button onClick={startApplying} size="lg" className="flex-1 font-semibold">
                  <Rocket className="mr-2 w-5 h-5" />
                  Start Auto-Applying to Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
