'use server';

import { z } from 'zod';
import { generateAtsScore, type AtsScoreInput, type AtsScoreOutput } from '@/ai/flows/ats-score-generation';

const AtsScoreActionSchema = z.object({
  resumeText: z.string().min(50, 'Resume text must be at least 50 characters.'),
  jobDescriptionText: z.string().min(50, 'Job description text must be at least 50 characters.'),
});

export type AtsScoreActionState = {
  success: boolean;
  data?: AtsScoreOutput;
  error?: string;
  fieldErrors?: {
    resumeText?: string[];
    jobDescriptionText?: string[];
  };
};

export async function getAtsScoreAction(
  prevState: AtsScoreActionState | null,
  formData: FormData
): Promise<AtsScoreActionState> {
  const rawFormData = {
    resumeText: formData.get('resumeText'),
    jobDescriptionText: formData.get('jobDescriptionText'),
  };

  const validatedFields = AtsScoreActionSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid input provided.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const inputData: AtsScoreInput = validatedFields.data;

  try {
    console.log('Calling generateAtsScore with input:', inputData);
    const result = await generateAtsScore(inputData);
    console.log('Received result from generateAtsScore:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error calling generateAtsScore:', error);
    let errorMessage = 'An unexpected error occurred while generating the ATS score.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
