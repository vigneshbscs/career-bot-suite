import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Upload, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, resume: file }));
      toast.success("Resume uploaded successfully!");
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      toast.success("Profile created! Your AI agent is now active.");
      setTimeout(() => navigate("/dashboard"), 1500);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const steps = [
    { number: 1, title: "Job Preferences" },
    { number: 2, title: "Resume & Details" },
    { number: 3, title: "Final Setup" }
  ];

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="font-serif text-4xl font-bold mb-4">Create Your Profile</h1>
          <p className="text-muted-foreground">Set up your AI job application agent in 3 simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= s.number 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                </div>
                <span className="text-xs mt-2 text-center">{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${step > s.number ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="p-8 shadow-card">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold mb-6">Tell us about your ideal job</h2>
              
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
                  <SelectContent>
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
                  <SelectContent>
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
                  <SelectContent>
                    <SelectItem value="est">EST (UTC-5)</SelectItem>
                    <SelectItem value="cst">CST (UTC-6)</SelectItem>
                    <SelectItem value="mst">MST (UTC-7)</SelectItem>
                    <SelectItem value="pst">PST (UTC-8)</SelectItem>
                    <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold mb-6">Upload your resume & details</h2>
              
              <div className="space-y-2">
                <Label>Resume</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="resume" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-1">
                      {formData.resume ? formData.resume.name : "Click to upload resume"}
                    </p>
                    <p className="text-sm text-muted-foreground">PDF, DOC, or DOCX (Max 5MB)</p>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll extract your information and create custom resumes for each job
                </p>
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

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold mb-6">Configure your AI agent</h2>
              
              <div className="space-y-2">
                <Label htmlFor="jobMatches">Job Match Preference</Label>
                <Select value={formData.jobMatches} onValueChange={(v) => handleInputChange("jobMatches", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How many jobs to apply?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ideal">Ideal Only (10-20/day)</SelectItem>
                    <SelectItem value="aligns">Aligns Well (30-50/day)</SelectItem>
                    <SelectItem value="highest">Highest Volume (100+/day)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Our AI will apply to jobs that match your criteria and preferences
                </p>
              </div>

              <div className="bg-secondary/50 rounded-xl p-6">
                <h3 className="font-semibold mb-3">Your Profile Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Job Title:</span> {formData.jobTitle || "Not set"}</p>
                  <p><span className="text-muted-foreground">Location:</span> {formData.workLocation || "Not set"}</p>
                  <p><span className="text-muted-foreground">Type:</span> {formData.jobType || "Not set"}</p>
                  <p><span className="text-muted-foreground">Salary Range:</span> ${formData.salaryMin || "0"} - ${formData.salaryMax || "0"}</p>
                  <p><span className="text-muted-foreground">Resume:</span> {formData.resume ? "✓ Uploaded" : "Not uploaded"}</p>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
                <p className="text-primary font-medium">🚀 Your AI agent will start working immediately after setup!</p>
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
              {step === 3 ? "Complete Setup" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
