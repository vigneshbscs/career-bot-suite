import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Star, Award, Rocket } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface InterviewGrade {
  score: number;
  strengths: string[];
  improvements: string[];
  overall: string;
}

const InterviewPrep = () => {
  const [interviewTranscript, setInterviewTranscript] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [interviewGrade, setInterviewGrade] = useState<InterviewGrade | null>(null);
  const [certValidation, setCertValidation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const gradeData = localStorage.getItem('jobplexity_interview_grade');
    const certData = localStorage.getItem('jobplexity_certificate');
    setIsReady(!!(gradeData && certData));
  }, [interviewGrade, certValidation]);

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
            contents: [
              {
                parts: [
                  {
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
                  }
                ]
              }
            ]
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
              contents: [
                {
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
                }
              ]
            })
          }
        );

        const data = await response.json();
        const validation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to validate certification';
        
        let certData;
        try {
          const jsonMatch = validation.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            certData = JSON.parse(jsonMatch[0]);
            localStorage.setItem('jobplexity_certificate', JSON.stringify(certData));
          }
        } catch (e) {
          console.error('Failed to parse cert JSON:', e);
        }
        
        setCertValidation(validation);
        toast({
          title: 'Certification Analyzed',
          description: certData?.valid ? 'Certificate validated and saved!' : 'Analysis complete'
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
          {isReady && (
            <Button onClick={() => navigate('/onboarding')} size="lg" className="font-semibold">
              <Rocket className="w-5 h-5 mr-2" />
              Start Applying to Jobs
            </Button>
          )}
        </div>

        <h1 className="text-4xl font-serif font-bold mb-8">Interview Prep & Validation</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Interview Grading
              </CardTitle>
              <CardDescription>
                Paste your interview transcript to get AI-powered feedback and grading
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
                  rows={8}
                  className="mt-2"
                />
              </div>
              <Button onClick={gradeInterview} disabled={loading} className="w-full">
                {loading ? 'Analyzing...' : 'Grade Interview'}
              </Button>

              {interviewGrade && (
                <div className="mt-6 space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">{interviewGrade.score}</div>
                    <div className="text-sm text-muted-foreground">out of 100</div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Strengths:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {interviewGrade.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Areas for Improvement:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {interviewGrade.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm">{interviewGrade.overall}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Certification Validation
              </CardTitle>
              <CardDescription>
                Upload a certification image to validate its authenticity and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cert">Upload Certification</Label>
                <div className="mt-2">
                  <Input
                    id="cert"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                  />
                </div>
                {certFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {certFile.name}
                  </p>
                )}
              </div>
              <Button onClick={validateCertification} disabled={loading} className="w-full">
                {loading ? 'Validating...' : 'Validate Certification'}
              </Button>

              {certValidation && (
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h3 className="font-semibold mb-2">Validation Report:</h3>
                  <p className="text-sm whitespace-pre-wrap">{certValidation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
