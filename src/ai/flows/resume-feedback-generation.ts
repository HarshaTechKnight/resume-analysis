'use server';
/**
 * @fileOverview Provides feedback on how a candidate can improve their resume based on job description requirements.
 *
 * - resumeFeedbackGeneration - A function that generates feedback for resume improvement.
 * - ResumeFeedbackGenerationInput - The input type for the resumeFeedbackGeneration function.
 * - ResumeFeedbackGenerationOutput - The return type for the resumeFeedbackGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeFeedbackGenerationInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The job description for which the resume is being evaluated.'),
});
export type ResumeFeedbackGenerationInput = z.infer<typeof ResumeFeedbackGenerationInputSchema>;

const ResumeFeedbackGenerationOutputSchema = z.object({
  feedback: z.string().describe('Feedback on how to improve the resume to better match the job description.'),
});
export type ResumeFeedbackGenerationOutput = z.infer<typeof ResumeFeedbackGenerationOutputSchema>;

export async function resumeFeedbackGeneration(input: ResumeFeedbackGenerationInput): Promise<ResumeFeedbackGenerationOutput> {
  return resumeFeedbackGenerationFlow(input);
}

const resumeFeedbackGenerationPrompt = ai.definePrompt({
  name: 'resumeFeedbackGenerationPrompt',
  input: {schema: ResumeFeedbackGenerationInputSchema},
  output: {schema: ResumeFeedbackGenerationOutputSchema},
  prompt: `Given the following resume and job description, provide feedback on how the candidate can improve their resume to better match the job description.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}

Feedback:`,
});

const resumeFeedbackGenerationFlow = ai.defineFlow(
  {
    name: 'resumeFeedbackGenerationFlow',
    inputSchema: ResumeFeedbackGenerationInputSchema,
    outputSchema: ResumeFeedbackGenerationOutputSchema,
  },
  async input => {
    const {output} = await resumeFeedbackGenerationPrompt(input);
    return output!;
  }
);
