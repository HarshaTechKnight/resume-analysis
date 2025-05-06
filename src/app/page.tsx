'use client';

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { getAtsScoreAction, type AtsScoreActionState } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Briefcase, Activity, AlertCircle, CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary hover:bg-primary/90">
      {pending ? 'Analyzing...' : 'Analyze Resume'}
    </Button>
  );
}

export default function Home() {
  const initialState: AtsScoreActionState | null = null;
  const [state, formAction] = useFormState(getAtsScoreAction, initialState);
  const [showResults, setShowResults] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');

  useEffect(() => {
    if (state?.success) {
      setShowResults(true);
    } else if (state?.error || state?.fieldErrors) {
      setShowResults(false); // Hide previous results if there's a new error
    }
  }, [state]);

  const handleReset = () => {
    setShowResults(false);
    setResumeText('');
    setJobDescriptionText('');
    // Reset form state (this might need more specific handling depending on how useFormState interacts with manual resets)
    // Consider using a key on the form or a dedicated reset mechanism if needed.
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center py-12 px-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">HireSmart ATS</h1>
        <p className="text-lg text-muted-foreground">AI-Powered Resume Analysis</p>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Briefcase className="text-primary" /> Job & Resume Input
            </CardTitle>
            <CardDescription>Paste the job description and resume text below.</CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobDescriptionText" className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="text-primary h-5 w-5" /> Job Description
                </Label>
                <Textarea
                  id="jobDescriptionText"
                  name="jobDescriptionText"
                  placeholder="Paste the full job description here..."
                  className="min-h-[200px] border-input focus:ring-primary"
                  value={jobDescriptionText}
                  onChange={(e) => setJobDescriptionText(e.target.value)}
                  aria-invalid={!!state?.fieldErrors?.jobDescriptionText}
                  aria-describedby="jd-error"
                />
                 {state?.fieldErrors?.jobDescriptionText && (
                    <p id="jd-error" className="text-sm text-destructive">{state.fieldErrors.jobDescriptionText.join(', ')}</p>
                 )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="resumeText" className="text-lg font-semibold flex items-center gap-2">
                   <FileText className="text-primary h-5 w-5" /> Resume Text
                </Label>
                <Textarea
                  id="resumeText"
                  name="resumeText"
                  placeholder="Paste the full resume text here..."
                  className="min-h-[250px] border-input focus:ring-primary"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                   aria-invalid={!!state?.fieldErrors?.resumeText}
                   aria-describedby="resume-error"
                />
                 {state?.fieldErrors?.resumeText && (
                    <p id="resume-error" className="text-sm text-destructive">{state.fieldErrors.resumeText.join(', ')}</p>
                 )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
               {state?.error && !state.fieldErrors && (
                  <Alert variant="destructive" className="w-full">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
              )}
              <SubmitButton />
              <Button variant="outline" type="button" onClick={handleReset} className="w-full">
                Reset
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className={`shadow-lg transition-opacity duration-500 ${showResults ? 'opacity-100' : 'opacity-50'}`}>
           <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                 <Activity className="text-primary"/> Analysis Results
              </CardTitle>
              <CardDescription>Compatibility score and insights based on the provided texts.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
            {!showResults && (
              <div className="text-center text-muted-foreground py-10">
                <p>Results will appear here after analysis.</p>
              </div>
            )}
            {showResults && state?.success && state.data && (
              <>
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Compatibility Score</Label>
                  <div className="flex items-center gap-4">
                    <Progress value={state.data.compatibilityScore} className="w-full h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" aria-label={`Compatibility Score: ${state.data.compatibilityScore}%`} />
                    <span className="text-2xl font-bold text-primary">{state.data.compatibilityScore}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="text-green-600 h-5 w-5" /> Keyword Matches</h3>
                   {state.data.keywordMatches.length > 0 ? (
                     <div className="flex flex-wrap gap-2">
                       {state.data.keywordMatches.map((keyword, index) => (
                         <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-300">{keyword}</Badge>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-muted-foreground italic">No specific keyword matches found.</p>
                   )}
                </div>

                 <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><AlertCircle className="text-yellow-600 h-5 w-5"/> Skill Gaps</h3>
                     {state.data.skillGaps.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {state.data.skillGaps.map((skill, index) => (
                             <Badge key={index} variant="outline" className="border-yellow-500 text-yellow-700">{skill}</Badge>
                          ))}
                        </div>
                     ) : (
                       <p className="text-sm text-muted-foreground italic">No specific skill gaps identified.</p>
                     )}
                 </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><ThumbsUp className="text-blue-600 h-5 w-5"/> Feedback</h3>
                  <Alert className="border-primary bg-blue-50">
                     <AlertDescription className="text-primary-foreground">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{state.data.feedback}</p>
                     </AlertDescription>
                  </Alert>
                </div>
              </>
            )}
             {showResults && state?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Analysis Failed</AlertTitle>
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
             )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
