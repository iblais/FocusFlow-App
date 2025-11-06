import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { TaskTreeNode, MicroStep, TaskCompletionPrediction } from '@/types/adhd-task-system';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const breakdownSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  estimatedTime: z.number().optional(),
  energyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  difficulty: z.number().min(1).max(10).optional(),
  userId: z.string(),
  executiveFunctionScores: z
    .object({
      planning: z.number().min(0).max(100),
      workingMemory: z.number().min(0).max(100),
      inhibition: z.number().min(0).max(100),
      flexibility: z.number().min(0).max(100),
      timeManagement: z.number().min(0).max(100),
      selfMonitoring: z.number().min(0).max(100),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = breakdownSchema.parse(body);

    // Fetch user's past task performance for learning
    const pastTasks = await prisma.task.findMany({
      where: {
        userId: validatedData.userId,
        status: 'COMPLETED',
        estimatedTime: { not: null },
        actualTime: { not: null },
      },
      select: {
        estimatedTime: true,
        actualTime: true,
        energyLevel: true,
        difficulty: true,
        title: true,
      },
      take: 50,
      orderBy: { completedAt: 'desc' },
    });

    // Calculate user's estimation accuracy
    const accuracyScores = pastTasks
      .filter(t => t.estimatedTime && t.actualTime)
      .map(t => {
        const estimated = t.estimatedTime!;
        const actual = t.actualTime!;
        const diff = Math.abs(estimated - actual);
        return 1 - Math.min(diff / estimated, 1);
      });

    const averageAccuracy =
      accuracyScores.length > 0
        ? accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length
        : 0.5;

    // Find similar tasks
    const similarTasks = pastTasks.filter(t => {
      const titleSimilarity = calculateSimilarity(
        validatedData.title.toLowerCase(),
        t.title.toLowerCase()
      );
      const energyMatch = t.energyLevel === validatedData.energyLevel;
      const difficultyMatch =
        validatedData.difficulty && t.difficulty
          ? Math.abs(validatedData.difficulty - t.difficulty) <= 2
          : true;

      return titleSimilarity > 0.3 || (energyMatch && difficultyMatch);
    });

    const averageSimilarTime =
      similarTasks.length > 0
        ? similarTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0) / similarTasks.length
        : validatedData.estimatedTime || 30;

    // Build AI prompt with learning data
    const systemPrompt = `You are an ADHD-specialized task breakdown AI. Your goal is to break down tasks into micro-steps that are:
1. 5-15 minutes each (optimal for ADHD focus)
2. Concrete and actionable
3. Ordered logically with transition buffers
4. Energy-aware (matching task difficulty to user's energy levels)
5. Executive function-aware (considering planning, working memory, etc.)

User's Executive Function Profile:
${
  validatedData.executiveFunctionScores
    ? Object.entries(validatedData.executiveFunctionScores)
        .map(([key, value]) => `- ${key}: ${value}/100`)
        .join('\n')
    : 'Not provided'
}

User's Historical Performance:
- Total completed tasks: ${pastTasks.length}
- Average estimation accuracy: ${Math.round(averageAccuracy * 100)}%
- Similar tasks completed: ${similarTasks.length}
- Average time for similar tasks: ${Math.round(averageSimilarTime)} minutes

IMPORTANT: Use positive, encouraging language. Avoid overwhelming language. Include micro-transitions between steps.`;

    const userPrompt = `Break down this task into a tree structure with subtasks and micro-steps:

Title: ${validatedData.title}
Description: ${validatedData.description || 'None provided'}
Energy Level: ${validatedData.energyLevel}
Difficulty: ${validatedData.difficulty || 'Unknown'}/10
User's Estimate: ${validatedData.estimatedTime || 'Not provided'} minutes

Provide a JSON response with this exact structure:
{
  "tree": {
    "id": "root",
    "title": "Main task title",
    "microSteps": [
      {
        "id": "step-1",
        "step": "Step description",
        "description": "Detailed explanation",
        "estimatedTime": 10,
        "energyLevel": "MEDIUM",
        "completed": false,
        "order": 0,
        "executiveFunctionChallenge": "planning" // or "working-memory", "inhibition", etc.
      }
    ],
    "subTasks": [], // Can contain nested TaskTreeNodes
    "energyCost": 3,
    "estimatedTime": 30,
    "completed": false,
    "collapsed": false
  },
  "suggestion": "One-sentence suggestion for tackling this task",
  "adjustedEstimate": 35, // Your recommended time estimate based on learning
  "confidence": 0.85 // 0-1 confidence in the estimate
}`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');

    // Build predictions
    const predictions: TaskCompletionPrediction = {
      taskId: 'pending',
      estimatedCompletionTime: aiResponse.adjustedEstimate || validatedData.estimatedTime || 30,
      confidence: aiResponse.confidence || 0.5,
      similarTasksData: {
        count: similarTasks.length,
        averageTime: Math.round(averageSimilarTime),
        userAccuracyScore: averageAccuracy,
      },
      adjustmentFactors: {
        energyLevel: getEnergyAdjustment(validatedData.energyLevel),
        timeOfDay: getTimeOfDayAdjustment(),
        taskComplexity: validatedData.difficulty ? validatedData.difficulty / 10 : 0.5,
        userExperience: Math.min(similarTasks.length / 10, 1),
      },
    };

    return NextResponse.json({
      tree: aiResponse.tree,
      suggestion: aiResponse.suggestion,
      predictions,
      learningData: {
        totalTasks: pastTasks.length,
        averageAccuracy: Math.round(averageAccuracy * 100),
        similarTasksCount: similarTasks.length,
      },
    });
  } catch (error) {
    console.error('Breakdown v2 error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate task breakdown' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  const commonWords = words1.filter(w => words2.includes(w)).length;
  return commonWords / Math.max(words1.length, words2.length);
}

function getEnergyAdjustment(energyLevel: 'LOW' | 'MEDIUM' | 'HIGH'): number {
  const adjustments = { LOW: 0.8, MEDIUM: 1.0, HIGH: 1.2 };
  return adjustments[energyLevel];
}

function getTimeOfDayAdjustment(): number {
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 11) return 1.1; // Morning peak
  if (hour >= 14 && hour <= 16) return 0.9; // Afternoon dip
  if (hour >= 19 || hour <= 7) return 0.7; // Evening/night
  return 1.0;
}
