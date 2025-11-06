import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const suggestionSchema = z.object({
  taskTitle: z.string().min(1),
  currentSteps: z.array(z.string()),
  context: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskTitle, currentSteps, context } = suggestionSchema.parse(body);

    const systemPrompt = `You are an ADHD-friendly task planning AI. Given a task and its current steps, suggest the next logical micro-step that:
1. Is 5-15 minutes to complete
2. Follows naturally from the previous steps
3. Is concrete and actionable
4. Uses positive, clear language
5. Considers ADHD-friendly transitions

Always provide a clear next step, even if you think the task might be complete.`;

    const userPrompt = `Task: ${taskTitle}
${context ? `Context: ${context}` : ''}

Current steps completed:
${currentSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Suggest the next micro-step as JSON:
{
  "step": "Clear, actionable step description",
  "description": "Brief explanation of why this step and what to focus on",
  "estimatedTime": 10,
  "energyLevel": "MEDIUM",
  "reasoning": "Why this step should come next"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const suggestion = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Next step suggestion error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
