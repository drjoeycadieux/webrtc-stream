'use server';

/**
 * @fileOverview A flow to generate meeting topics based on an imported document.
 *
 * - generateMeetingTopics - A function that generates meeting topics.
 * - GenerateMeetingTopicsInput - The input type for the generateMeetingTopics function.
 * - GenerateMeetingTopicsOutput - The return type for the generateMeetingTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMeetingTopicsInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to generate topics from.'),
});
export type GenerateMeetingTopicsInput = z.infer<typeof GenerateMeetingTopicsInputSchema>;

const GenerateMeetingTopicsOutputSchema = z.object({
  topics: z
    .array(z.string())
    .describe('An array of suggested meeting topics based on the document.'),
});
export type GenerateMeetingTopicsOutput = z.infer<typeof GenerateMeetingTopicsOutputSchema>;

export async function generateMeetingTopics(input: GenerateMeetingTopicsInput): Promise<GenerateMeetingTopicsOutput> {
  return generateMeetingTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMeetingTopicsPrompt',
  input: {schema: GenerateMeetingTopicsInputSchema},
  output: {schema: GenerateMeetingTopicsOutputSchema},
  prompt: `You are an AI assistant helping to generate meeting topics based on a document.

  Please generate a list of meeting topics based on the content of the following document:

  Document: {{{documentText}}}

  The topics should be relevant and concise, suitable for a team meeting.
  Return only a JSON array of topics.
  `,
});

const generateMeetingTopicsFlow = ai.defineFlow(
  {
    name: 'generateMeetingTopicsFlow',
    inputSchema: GenerateMeetingTopicsInputSchema,
    outputSchema: GenerateMeetingTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
