'use server';
/**
 * @fileOverview A meeting summarization AI agent.
 *
 * - summarizeMeetingNotes - A function that handles the meeting note summarization process.
 * - SummarizeMeetingNotesInput - The input type for the summarizeMeetingNotes function.
 * - SummarizeMeetingNotesOutput - The return type for the summarizeMeetingNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMeetingNotesInputSchema = z.object({
  transcript: z.string().describe('The transcript of the meeting.'),
});
export type SummarizeMeetingNotesInput = z.infer<typeof SummarizeMeetingNotesInputSchema>;

const SummarizeMeetingNotesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the meeting.'),
  actionItems: z.string().describe('A list of action items identified during the meeting.'),
});
export type SummarizeMeetingNotesOutput = z.infer<typeof SummarizeMeetingNotesOutputSchema>;

export async function summarizeMeetingNotes(input: SummarizeMeetingNotesInput): Promise<SummarizeMeetingNotesOutput> {
  return summarizeMeetingNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMeetingNotesPrompt',
  input: {schema: SummarizeMeetingNotesInputSchema},
  output: {schema: SummarizeMeetingNotesOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing meeting transcripts and identifying action items.\n\n  Given the following meeting transcript, please provide a concise summary of the key discussion points and a list of action items.\n\n  Transcript: {{{transcript}}}`,
});

const summarizeMeetingNotesFlow = ai.defineFlow(
  {
    name: 'summarizeMeetingNotesFlow',
    inputSchema: SummarizeMeetingNotesInputSchema,
    outputSchema: SummarizeMeetingNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
