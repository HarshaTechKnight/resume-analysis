// use server'
/**
 * @fileOverview Generates a job description based on a given job role.
 *
 * - generateJobDescription - A function that handles the job description generation process.
 * - JobDescriptionGenerationInput - The input type for the generateJobDescription function.
 * - JobDescriptionGenerationOutput - The return type for the generateJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobDescriptionGenerationInputSchema = z.object({
  jobRole: z.string().describe('The job role for which to generate a description (e.g., "Software Engineer", "Product Manager").'),
});
export type JobDescriptionGenerationInput = z.infer<typeof JobDescriptionGenerationInputSchema>;

const JobDescriptionGenerationOutputSchema = z.object({
  jobDescription: z.string().describe('The generated job description text.'),
});
export type JobDescriptionGenerationOutput = z.infer<typeof JobDescriptionGenerationOutputSchema>;

export async function generateJobDescription(input: JobDescriptionGenerationInput): Promise<JobDescriptionGenerationOutput> {
  return jobDescriptionGenerationFlow(input);
}

const jobDescriptionGenerationPrompt = ai.definePrompt({
  name: 'jobDescriptionGenerationPrompt',
  input: {schema: JobDescriptionGenerationInputSchema},
  output: {schema: JobDescriptionGenerationOutputSchema},
  prompt: `You are an expert HR professional specializing in writing compelling job descriptions.
Generate a comprehensive and engaging job description for the following role: {{jobRole}}.

The job description should include:
- A brief company overview (you can use a generic placeholder).
- Key responsibilities of the role.
- Required qualifications (education, experience, skills).
- Preferred qualifications or nice-to-haves.
- Information about company culture or benefits (use generic placeholders).

Ensure the description is well-structured, clear, and formatted professionally using markdown (e.g., bullet points for lists). Aim for a description suitable for posting on a job board.
`,
});

const jobDescriptionGenerationFlow = ai.defineFlow(
  {
    name: 'jobDescriptionGenerationFlow',
    inputSchema: JobDescriptionGenerationInputSchema,
    outputSchema: JobDescriptionGenerationOutputSchema,
  },
  async input => {
    const {output} = await jobDescriptionGenerationPrompt(input);
    // Add basic error handling in case the output is unexpectedly null
    if (!output) {
      throw new Error("Failed to generate job description. The AI model did not return an output.");
    }
    return output;
  }
);
