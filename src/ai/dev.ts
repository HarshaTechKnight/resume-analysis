import { config } from 'dotenv';
config();

import '@/ai/flows/dynamic-interview-question-generation.ts';
import '@/ai/flows/ats-score-generation.ts';
import '@/ai/flows/resume-feedback-generation.ts';
import '@/ai/flows/job-description-generation.ts'; // Added import
