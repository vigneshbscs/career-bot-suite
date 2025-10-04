import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, ArrowRight, ArrowLeft, Check, FileText, Star, Award, Rocket, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { parseResume, ParsedResume } from "@/utils/resumeParser";
import { generatePersonalizedJobs } from "@/utils/jobMatcher";

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

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [interviewTranscript, setInterviewTranscript] = useState('');
  const [interviewGrade, setInterviewGrade] = useState<InterviewGrade | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [formData, setFormData] = useState({
    jobTitle: "",
    workLocation: "",
    jobType: "",
    timeZone: "",
    salaryMin: "",
    salaryMax: "",
    jobMatches: "",
    resume: null as File | null,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, resume: file }));
      setIsExtractingResume(true);
      toast.info("Extracting information from your resume...");
      
      try {
        const parsed = await parseResume(file);
        setParsedResume(parsed);
        setIsExtractingResume(false);
        toast.success("Resume data extracted successfully!");
      } catch (error) {
        setIsExtractingResume(false);
        toast.error("Failed to extract resume data. Please try again.");
      }
    }
  };

  const gradeInterview = async () => {
    if (!interviewTranscript.trim()) {
      toast.error('Please enter your interview transcript');
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
        toast.success(`Interview graded! You scored ${grade.score}/100`);
      }
    } catch (error) {
      console.error('Grading error:', error);
      toast.error('Failed to grade interview');
    } finally {
      setLoading(false);
    }
  };

  const validateCertification = async () => {
    if (!certFile) {
      toast.error('Please upload a certification image');
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
            toast.success(cert.valid ? 'Certificate validated!' : 'Certificate analyzed');
          }
        } catch (e) {
          console.error('Failed to parse cert JSON:', e);
          toast.error('Failed to parse certificate data');
        }
        setLoading(false);
      };
      reader.readAsDataURL(certFile);
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate certification');
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.jobTitle || !formData.workLocation || !formData.jobType) {
        toast.error("Please fill in all job preferences");
        return;
      }
    } else if (step === 2) {
      if (!parsedResume || !formData.resume) {
        toast.error("Please upload your resume");
        return;
      }
    } else if (step === 3) {
      if (!interviewGrade) {
        toast.error("Please complete interview grading");
        return;
      }
    } else if (step === 4) {
      if (!certData) {
        toast.error("Please validate your certification");
        return;
      }
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      // Final step - start applying
      const jobs = generatePersonalizedJobs(parsedResume!, {
        jobTitle: formData.jobTitle,
        location: formData.workLocation,
        jobType: formData.jobType,
        salaryMin: parseInt(formData.salaryMin) || 0,
        salaryMax: parseInt(formData.salaryMax) || 0,
      });

      localStorage.setItem('jobplexity_jobs', JSON.stringify(jobs));
      localStorage.setItem('jobplexity_resume', JSON.stringify(parsedResume));
      localStorage.setItem('jobplexity_profile', JSON.stringify(formData));

      toast.success("Profile complete! Starting auto-apply...");
      setTimeout(() => navigate("/applying-live"), 1000);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const steps = [
    { number: 1, title: "Job Preferences", icon: Rocket },
    { number: 2, title: "Resume & Details", icon: FileText },
    { number: 3, title: "Interview Grading", icon: Star },
    { number: 4, title: "Certificate Validation", icon: Award },
    { number: 5, title: "Final Review", icon: CheckCircle2 }
  ];

  const progress = (step / 5) * 100;

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Complete Your Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground">5 steps to optimize your job applications</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((s) => (
              <span key={s.number} className={`${step >= s.number ? 'text-primary font-medium' : ''} hidden sm:inline`}>
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6 sm:p-8 shadow-card">
          {/* Step 1: Job Preferences */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Rocket className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl font-semibold">Job Preferences</h2>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Desired Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Software Engineer, Data Analyst"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <Select value={formData.workLocation} onValueChange={(v) => handleInputChange("workLocation", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select value={formData.jobType} onValueChange={(v) => handleInputChange("jobType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="fulltime">Full-time</SelectItem>
                    <SelectItem value="parttime">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeZone">Time Zone</Label>
                <Select value={formData.timeZone} onValueChange={(v) => handleInputChange("timeZone", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your time zone" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="est">EST (UTC-5)</SelectItem>
                    <SelectItem value="cst">CST (UTC-6)</SelectItem>
                    <SelectItem value="mst">MST (UTC-7)</SelectItem>
                    <SelectItem value="pst">PST (UTC-8)</SelectItem>
                    <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Min Salary ($)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="50000"
                    value={formData.salaryMin}
                    onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Max Salary ($)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="100000"
                    value={formData.salaryMax}
                    onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Resume & Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl font-semibold">Resume & Details</h2>
              </div>
              
              <div className="space-y-2">
                <Label>Upload Resume</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isExtractingResume}
                  />
                  <label htmlFor="resume" className="cursor-pointer">
                    {isExtractingResume ? (
                      <>
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="font-medium mb-1 text-primary">Extracting resume data...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium mb-1">
                          {formData.resume ? formData.resume.name : "Click to upload resume"}
                        </p>
                      </>
                    )}
                    <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, or TXT</p>
                  </label>
                </div>
              </div>

              {parsedResume && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-2">Extracted Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Name:</span> {parsedResume.name}</p>
                        <p><span className="text-muted-foreground">Email:</span> {parsedResume.email}</p>
                        <p><span className="text-muted-foreground">Phone:</span> {parsedResume.phone}</p>
                        <p><span className="text-muted-foreground">Skills:</span> {parsedResume.skills?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Interview Grading */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl font-semibold">Interview Grading</h2>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transcript">Interview Transcript</Label>
                <Textarea
                  id="transcript"
                  placeholder="Paste your interview Q&A here..."
                  value={interviewTranscript}
                  onChange={(e) => setInterviewTranscript(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>

              <Button onClick={gradeInterview} disabled={loading} className="w-full">
                {loading ? 'Analyzing...' : 'Grade Interview'}
              </Button>

              {interviewGrade && (
                <Card className="p-4 bg-primary/5 border-primary/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-center flex-1">
                      <div className="text-4xl font-bold text-primary">{interviewGrade.score}</div>
                      <div className="text-sm text-muted-foreground">out of 100</div>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">{interviewGrade.overall}</p>
                </Card>
              )}
            </div>
          )}

          {/* Step 4: Certificate Validation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl font-semibold">Certificate Validation</h2>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cert">Upload Certification Image</Label>
                <Input
                  id="cert"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                />
                {certFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {certFile.name}
                  </p>
                )}
              </div>

              <Button onClick={validateCertification} disabled={loading} className="w-full">
                {loading ? 'Validating...' : 'Validate Certificate'}
              </Button>

              {certData && (
                <Card className="p-4 bg-primary/5 border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Certificate Validated</h4>
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {certData.certificationName}</p>
                    <p><strong>Organization:</strong> {certData.organization}</p>
                    <p><strong>Score:</strong> {certData.score}/100</p>
                    <p className={certData.valid ? 'text-green-500' : 'text-yellow-500'}>
                      {certData.valid ? '✓ Valid' : '⚠ Needs Review'}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 5: Final Review */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl font-semibold">Final Review</h2>
              </div>

              {/* Job Preferences Summary */}
              <Card className="p-4 bg-primary/5 border-primary/10">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-primary" />
                  Job Preferences
                </h3>
                <div className="text-sm space-y-1">
                  <p><strong>Title:</strong> {formData.jobTitle}</p>
                  <p><strong>Location:</strong> {formData.workLocation}</p>
                  <p><strong>Type:</strong> {formData.jobType}</p>
                  <p><strong>Salary:</strong> ${formData.salaryMin} - ${formData.salaryMax}</p>
                </div>
              </Card>

              {/* Resume Summary */}
              <Card className="p-4 bg-primary/5 border-primary/10">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Resume
                </h3>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {parsedResume?.name}</p>
                  <p><strong>Email:</strong> {parsedResume?.email}</p>
                  <p><strong>Skills:</strong> {parsedResume?.skills?.slice(0, 5).join(', ')}</p>
                </div>
              </Card>

              {/* Interview Score */}
              <Card className="p-4 bg-primary/5 border-primary/10">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Interview Score
                </h3>
                <div className="text-3xl font-bold text-primary mb-1">{interviewGrade?.score}/100</div>
                <p className="text-sm text-muted-foreground">{interviewGrade?.overall}</p>
              </Card>

              {/* Certificate */}
              <Card className="p-4 bg-primary/5 border-primary/10">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Certificate
                </h3>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {certData?.certificationName}</p>
                  <p><strong>Score:</strong> {certData?.score}/100</p>
                  <p className={certData?.valid ? 'text-green-500' : 'text-yellow-500'}>
                    {certData?.valid ? '✓ Valid Certificate' : '⚠ Needs Review'}
                  </p>
                </div>
              </Card>

              {/* Success Rate */}
              <Card className="p-4 bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30">
                <h3 className="font-semibold mb-2">Estimated Success Rate</h3>
                <div className="text-4xl font-bold text-primary mb-1">
                  {Math.min(90, 45 + (interviewGrade?.score || 0) * 0.25 + (certData?.score || 0) * 0.20).toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on your interview score and certificate validation
                </p>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="jobMatches">Job Match Preference</Label>
                <Select value={formData.jobMatches} onValueChange={(v) => handleInputChange("jobMatches", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How many jobs to apply?" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="ideal">Ideal Only (10-20/day)</SelectItem>
                    <SelectItem value="aligns">Aligns Well (30-50/day)</SelectItem>
                    <SelectItem value="highest">Highest Volume (100+/day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext}>
              {step === 5 ? (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Applying
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
