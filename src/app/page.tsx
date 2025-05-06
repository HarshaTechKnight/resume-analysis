
'use client';

import React, { useState, useEffect, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { getAtsScoreAction, generateJobDescriptionAction, type AtsScoreActionState, type JobDescriptionActionState } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { Separator } from "@/components/ui/separator"; // Import Separator
import { FileText, Briefcase, Activity, AlertCircle, CheckCircle, ThumbsUp, UploadCloud, FileUp, Wand2, Loader2 } from "lucide-react"; // Added Wand2, Loader2

const jobRoles = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "UI/UX Designer",
  "Marketing Manager",
  "Sales Representative",
  "Human Resources Specialist",
  "Project Manager",
];

function AnalyzeSubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full bg-primary hover:bg-primary/90">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
        </>
      ) : (
        'Analyze Resume'
      )}
    </Button>
  );
}

function GenerateDescriptionButton({ disabled }: { disabled?: boolean }) {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" variant="outline" disabled={pending || disabled} className="w-full">
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
          </>
        ) : (
          <>
           <Wand2 className="mr-2 h-4 w-4" /> Generate Description
          </>
        )}
      </Button>
    );
}

export default function Home() {
  // State for ATS Score Analysis
  const initialAtsState: AtsScoreActionState | null = null;
  const [atsState, atsFormAction] = useActionState(getAtsScoreAction, initialAtsState);
  const [showResults, setShowResults] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  // State for Job Description Generation
  const initialJdState: JobDescriptionActionState | null = null;
  const [jdState, jdFormAction] = useActionState(generateJobDescriptionAction, initialJdState);
  const [selectedJobRole, setSelectedJobRole] = useState<string>('');
  const [generatedJobDescription, setGeneratedJobDescription] = useState<string>('');
  const [isGenerating, startGenerating] = useTransition(); // For disabling Analyze while generating

  useEffect(() => {
    if (atsState?.success) {
      setShowResults(true);
    } else if (atsState?.error || atsState?.fieldErrors) {
      setShowResults(false); // Hide previous results if there's a new error
    }
  }, [atsState]);

   useEffect(() => {
      if (jdState?.success && jdState.description) {
        setGeneratedJobDescription(jdState.description);
      }
      // Clear previous description on error or new generation attempt
      if(jdState?.error || !jdState?.success){
          setGeneratedJobDescription('');
      }
    }, [jdState]);

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setResumeFileName(file ? file.name : null);
  };

  const handleReset = () => {
    setShowResults(false);
    setResumeFileName(null);
    setSelectedJobRole('');
    setGeneratedJobDescription('');
    // Reset file input visually
    const fileInput = document.getElementById('resumeFile') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }
    // Optionally reset form states if needed (might require key changes on forms)
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center py-12 px-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">HireSmart ATS</h1>
        <p className="text-lg text-muted-foreground">AI-Powered Resume Analysis</p>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* --- Input Card --- */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Briefcase className="text-primary" /> Job & Resume Input
            </CardTitle>
            <CardDescription>Select a role to generate a description, then upload the resume.</CardDescription>
          </CardHeader>

           {/* --- Job Description Generation Form --- */}
          <form action={jdFormAction}>
              <CardContent className="space-y-4 pb-0">
                 <div className="space-y-2">
                    <Label htmlFor="jobRole" className="text-lg font-semibold flex items-center gap-2">
                      <Briefcase className="text-primary h-5 w-5" /> Job Role
                    </Label>
                    <Select
                       name="jobRole"
                       value={selectedJobRole}
                       onValueChange={setSelectedJobRole}
                       required // Make selector required for generation
                     >
                       <SelectTrigger className="w-full border-input focus:ring-primary">
                         <SelectValue placeholder="Select a job role..." />
                       </SelectTrigger>
                       <SelectContent>
                         {jobRoles.map((role) => (
                           <SelectItem key={role} value={role}>
                             {role}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     {/* Error display specifically for job role selection/generation */}
                     {jdState?.error && (
                         <Alert variant="destructive" className="mt-2">
                             <AlertCircle className="h-4 w-4" />
                             <AlertTitle>Generation Error</AlertTitle>
                             <AlertDescription>{jdState.error}</AlertDescription>
                         </Alert>
                     )}
                 </div>

                  {/* Display Generated Job Description */}
                 {generatedJobDescription && (
                   <div className="space-y-2">
                     <Label className="text-lg font-semibold">Generated Description</Label>
                     <Textarea
                       readOnly
                       value={generatedJobDescription}
                       className="min-h-[150px] bg-muted border-dashed border-input"
                       aria-label="Generated Job Description"
                     />
                   </div>
                 )}

              </CardContent>
              <CardFooter className="pt-4 pb-2">
                 <GenerateDescriptionButton disabled={!selectedJobRole || isGenerating} />
              </CardFooter>
          </form>

          <Separator className="my-4" />

           {/* --- Resume Upload & Analysis Form --- */}
          <form action={atsFormAction} encType="multipart/form-data">
            <CardContent className="space-y-6 pt-0">
              {/* Hidden input to pass the generated job description */}
               <input type="hidden" name="jobDescriptionText" value={generatedJobDescription} />
               {atsState?.fieldErrors?.jobDescriptionText && (
                  <p id="jd-hidden-error" className="text-sm text-destructive -mt-4 mb-2">{atsState.fieldErrors.jobDescriptionText.join(', ')}</p>
               )}

              <div className="space-y-2">
                <Label htmlFor="resumeFile" className="text-lg font-semibold flex items-center gap-2">
                   <FileUp className="text-primary h-5 w-5" /> Upload Resume
                </Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="resumeFile" className={`flex flex-col items-center justify-center w-full h-40 border-2 border-input border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted transition-colors ${!generatedJobDescription ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                            <UploadCloud className="w-10 h-10 mb-3 text-primary" />
                            {resumeFileName ? (
                                <p className="mb-2 text-sm text-foreground font-semibold truncate">{resumeFileName}</p>
                            ) : (
                                <>
                                    <p className="mb-2 text-sm text-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT (MAX. 5MB)</p>
                                </>
                            )}
                             {!generatedJobDescription && <p className="text-xs text-destructive mt-1">Generate description first</p>}
                        </div>
                        <Input
                          id="resumeFile"
                          name="resumeFile"
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.txt"
                          onChange={handleResumeFileChange}
                          aria-invalid={!!atsState?.fieldErrors?.resumeFile}
                          aria-describedby="resume-file-error"
                          disabled={!generatedJobDescription || isGenerating} // Disable if no JD or generating
                        />
                    </label>
                </div>
                 {atsState?.fieldErrors?.resumeFile && (
                    <p id="resume-file-error" className="text-sm text-destructive">{atsState.fieldErrors.resumeFile.join(', ')}</p>
                 )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
               {/* Combined error display for the ATS form */}
               {atsState?.error && !atsState.fieldErrors && (
                  <Alert variant="destructive" className="w-full">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Analysis Error</AlertTitle>
                      <AlertDescription>{atsState.error}</AlertDescription>
                  </Alert>
              )}
              <AnalyzeSubmitButton disabled={!resumeFileName || !generatedJobDescription || isGenerating} />
              <Button variant="outline" type="button" onClick={handleReset} className="w-full">
                Reset All
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* --- Analysis Results Card --- */}
        <Card className={`shadow-lg transition-opacity duration-500 ${showResults ? 'opacity-100' : 'opacity-50'}`}>
           <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                 <Activity className="text-primary"/> Analysis Results
              </CardTitle>
              <CardDescription>Compatibility score and insights based on the generated description and uploaded resume.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
            {!showResults && (
              <div className="text-center text-muted-foreground py-10">
                 <p>Generate a job description and upload a resume to see the analysis.</p>
              </div>
            )}
            {showResults && atsState?.success && atsState.data && (
              <>
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Compatibility Score</Label>
                  <div className="flex items-center gap-4">
                    <Progress value={atsState.data.compatibilityScore} className="w-full h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" aria-label={`Compatibility Score: ${atsState.data.compatibilityScore}%`} />
                    <span className="text-2xl font-bold text-primary">{atsState.data.compatibilityScore}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="text-green-600 h-5 w-5" /> Keyword Matches</h3>
                   {atsState.data.keywordMatches.length > 0 ? (
                     <div className="flex flex-wrap gap-2">
                       {atsState.data.keywordMatches.map((keyword, index) => (
                         <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-300">{keyword}</Badge>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-muted-foreground italic">No specific keyword matches found.</p>
                   )}
                </div>

                 <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><AlertCircle className="text-yellow-600 h-5 w-5"/> Skill Gaps</h3>
                     {atsState.data.skillGaps.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {atsState.data.skillGaps.map((skill, index) => (
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
                        <p className="text-sm text-foreground whitespace-pre-wrap">{atsState.data.feedback}</p>
                     </AlertDescription>
                  </Alert>
                </div>
              </>
            )}
             {/* Display analysis error only if results are meant to be shown but failed */}
             {showResults && atsState?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Analysis Failed</AlertTitle>
                  <AlertDescription>{atsState.error}</AlertDescription>
                </Alert>
             )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

