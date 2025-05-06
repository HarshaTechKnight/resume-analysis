'use server';

import { z } from 'zod';
import { generateAtsScore, type AtsScoreInput, type AtsScoreOutput } from '@/ai/flows/ats-score-generation';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// Define allowed file types and size limit
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

const AtsScoreActionSchema = z.object({
  resumeFile: z
    .instanceof(File, { message: 'Resume file is required.' })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      '.pdf, .docx, and .txt files are accepted.'
    ),
  jobDescriptionText: z.string().min(50, 'Job description text must be at least 50 characters.'),
});

export type AtsScoreActionState = {
  success: boolean;
  data?: AtsScoreOutput;
  error?: string;
  fieldErrors?: {
    resumeFile?: string[]; // Changed from resumeText
    jobDescriptionText?: string[];
  };
};

// Helper function to parse resume file content
async function parseResumeFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === 'application/pdf') {
    const data = await pdf(buffer);
    return data.text;
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  } else if (file.type === 'text/plain') {
    return buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type.');
  }
}


export async function getAtsScoreAction(
  prevState: AtsScoreActionState | null,
  formData: FormData
): Promise<AtsScoreActionState> {

  const rawFormData = {
    resumeFile: formData.get('resumeFile'),
    jobDescriptionText: formData.get('jobDescriptionText'),
  };

   // Basic check if file exists before Zod validation
  if (!(rawFormData.resumeFile instanceof File) || rawFormData.resumeFile.size === 0) {
    return {
      success: false,
      error: 'Resume file is required.',
      fieldErrors: {
        resumeFile: ['Please upload a resume file.'],
      },
    };
  }


  const validatedFields = AtsScoreActionSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    // Log validation errors for debugging
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      error: 'Invalid input provided.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { resumeFile, jobDescriptionText } = validatedFields.data;

  try {
    // Parse the resume file to get text content
    const resumeText = await parseResumeFile(resumeFile);

    if (!resumeText || resumeText.trim().length < 50) {
         return {
           success: false,
           error: 'Could not extract sufficient text from the resume file. Ensure the file is not empty or corrupted and contains at least 50 characters.',
           fieldErrors: { resumeFile: ['Resume content seems too short or could not be read.'] },
         };
    }


    const inputData: AtsScoreInput = {
        resumeText: resumeText,
        jobDescriptionText: jobDescriptionText,
    };


    console.log('Calling generateAtsScore with input (resume text length):', inputData.resumeText.length); // Don't log full text
    const result = await generateAtsScore(inputData);
    console.log('Received result from generateAtsScore:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in getAtsScoreAction:', error);
    let errorMessage = 'An unexpected error occurred while processing the resume or generating the ATS score.';
     if (error instanceof Error) {
        // Provide more specific error messages for common issues
        if (error.message.includes('Unsupported file type')) {
            errorMessage = 'The uploaded file type is not supported. Please use PDF, DOCX, or TXT.';
        } else if (error.message.includes('extractRawText') || error.message.includes('pdf')) {
            errorMessage = 'There was an error reading the content of the uploaded file. It might be corrupted or password-protected.';
        } else {
             errorMessage = error.message;
        }
    }
    return { success: false, error: errorMessage };
  }
}
