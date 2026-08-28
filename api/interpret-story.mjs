import { generateText, Output } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

const concept = z.enum(['where', 'side', 'symptom', 'preciseLocation', 'start', 'duration', 'trigger', 'timing', 'relief', 'function', 'sensoryMap']);
const symptom = z.enum(['pain', 'numbness', 'tingling', 'swelling', 'stiffness', 'weakness', 'redness', 'warmth', 'wound']);
const duration = z.object({ value: z.number().positive(), unit: z.enum(['day', 'week', 'month', 'year']), raw: z.string(), approximate: z.boolean() }).nullable();
const problem = z.object({
  family: z.enum(['hand', 'knee', 'ankle', 'foot', 'elbow', 'shoulder', 'neck', 'back', 'hip', 'unspecified']),
  side: z.enum(['left', 'right', 'both']).nullable(),
  areas: z.array(z.string()), locations: z.array(z.string()), symptoms: z.array(symptom), negatives: z.array(symptom), qualities: z.array(z.string()),
  triggers: z.array(z.string()), patterns: z.array(z.string()), relievers: z.array(z.string()), functionEffects: z.array(z.string()), sensory: z.array(z.string()),
  onset: z.enum(['gradual', 'specific event']).nullable(), duration, provider: z.array(z.string())
});
const interpretationSchema = z.object({
  problems: z.array(problem).max(4),
  clarifications: z.array(z.object({ concept, candidate: z.string(), question: z.string() })).max(3),
  missingDecisionFacts: z.array(concept)
});

const SYSTEM = `You convert a consumer musculoskeletal conversation into structured facts. You do not diagnose, recommend products, or decide whether self-care is safe.
Preserve what the consumer communicated across ordinary paraphrases, approximate time language, corrections, and short answers that refer to the immediately preceding question. Treat hand, wrist, thumb, and fingers as the hand family while preserving each named area. Keep separate body-region problems separate. A denial belongs in negatives, never symptoms. A later correction supersedes an earlier statement.
Only record facts supported by the conversation. Do not infer absent safety facts. If a decision-relevant fact has a plausible meaning but remains genuinely uncertain, omit it from the problem and add one concise clarification. Do not request confirmation for normal equivalences such as “about a month” = approximately one month. missingDecisionFacts may identify only schema-listed concepts. Keep consumer language concise.`;

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const turns = Array.isArray(request.body?.turns) ? request.body.turns.slice(-30) : [];
  if (!turns.length || turns.some(turn => typeof turn?.content !== 'string' || !['assistant', 'user'].includes(turn.role))) return response.status(400).json({ error: 'A valid conversation is required' });
  const transcript = turns
    .map(turn => `${turn.role === 'assistant' ? 'Keneflex question' : 'Consumer'}: ${turn.content.slice(0, 1200)}`)
    .join('\n')
    .slice(-16000);
  const openAIKey = process.env.OPENAI_API_KEY;
  try {
    if (!openAIKey) throw new Error('OPENAI_API_KEY is not configured');
    const openai = createOpenAI({ apiKey: openAIKey });
    const result = await generateText({
      model: openai('gpt-5.6-luna'),
      system: SYSTEM,
      prompt: transcript,
      output: Output.object({ schema: interpretationSchema, name: 'keneflex_story' }),
      maxOutputTokens: 1200,
      abortSignal: AbortSignal.timeout(15000)
    });
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ interpretation: result.output });
  } catch (error) {
    console.error('story_interpretation_failed', error?.message || error);
    return response.status(503).json({ error: 'Interpretation temporarily unavailable' });
  }
}
