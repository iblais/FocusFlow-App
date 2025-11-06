import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const parseSchema = z.object({
  text: z.string().min(1),
  userId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { text } = parseSchema.parse(body);

    const systemPrompt = `You are a natural language parser for task management. Parse user input and extract:
- Task title (required)
- Description (optional)
- Due date (if mentioned - parse relative dates like "tomorrow", "next Friday", "in 2 hours")
- Tags (optional - infer from context)
- Priority (1-10 scale, based on urgency words like "urgent", "important", "asap")

Use ADHD-friendly parsing:
- Be generous with interpretation
- Default to clear, actionable titles
- Extract time-related keywords
- Infer context from common phrases

Return JSON only.`;

    const userPrompt = `Parse this task input:

"${text}"

Current time: ${new Date().toISOString()}

Return JSON:
{
  "title": "Clear, actionable task title",
  "description": "Additional context (null if none)",
  "dueDate": "ISO date string or null",
  "tags": ["tag1", "tag2"] or [],
  "priority": 1-10,
  "confidence": 0.0-1.0,
  "timeContext": {
    "isUrgent": boolean,
    "hasDeadline": boolean,
    "estimatedDuration": minutes or null
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const parsed = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      title: parsed.title || text,
      description: parsed.description,
      dueDate: parsed.dueDate,
      tags: parsed.tags || [],
      priority: parsed.priority || 5,
      confidence: parsed.confidence || 0.8,
      timeContext: parsed.timeContext,
    });
  } catch (error) {
    console.error('Text parsing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to parse text' },
      { status: 500 }
    );
  }
}
