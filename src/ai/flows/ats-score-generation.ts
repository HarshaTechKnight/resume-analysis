// use server'

/**
 * @fileOverview Generates an ATS score for a resume based on a job description.
 *
 * - generateAtsScore - A function that handles the ATS score generation process.
 * - AtsScoreInput - The input type for the generateAtsScore function.
 * - AtsScoreOutput - The return type for the generateAtsScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AtsScoreInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be analyzed.'),
  jobDescriptionText: z
    .string()
    .describe('The text content of the job description.'),
});
export type AtsScoreInput = z.infer<typeof AtsScoreInputSchema>;

const AtsScoreOutputSchema = z.object({
  compatibilityScore: z
    .number()
    .describe(
      'A score between 0 and 100 representing the compatibility of the resume with the job description.'
    ),
  keywordMatches: z
    .array(z.string())
    .describe('List of keywords from the job description found in the resume.'),
  skillGaps: z
    .array(z.string())
    .describe('List of skills from the job description missing in the resume.'),
  feedback: z
    .string()
    .describe('Actionable feedback for the candidate to improve their resume.'),
});
export type AtsScoreOutput = z.infer<typeof AtsScoreOutputSchema>;

export async function generateAtsScore(input: AtsScoreInput): Promise<AtsScoreOutput> {
  return atsScoreFlow(input);
}

const atsScorePrompt = ai.definePrompt({
  name: 'atsScorePrompt',
  input: {schema: AtsScoreInputSchema},
  output: {schema: AtsScoreOutputSchema},
  prompt: `You are an AI-powered resume analysis tool. Given a resume and a job description,
you will determine the compatibility score, identify keyword matches and skill gaps, and provide feedback.

Resume:
{{resumeText}}

Job Description:
{{jobDescriptionText}}

Analyze the resume against the job description and provide the following:

- compatibilityScore: A score between 0 and 100 representing the compatibility of the resume with the job description.
- keywordMatches: List of keywords from the job description found in the resume.
- skillGaps: List of skills from the job description missing in the resume.
- feedback: Actionable feedback for the candidate to improve their resume.

Ensure that the output is well-formatted and easy to understand.
`,
});

const atsScoreFlow = ai.defineFlow(
  {
    name: 'atsScoreFlow',
    inputSchema: AtsScoreInputSchema,
    outputSchema: AtsScoreOutputSchema,
  },
  async input => {
    const {output} = await atsScorePrompt(input);
    return output!;
  }
);
