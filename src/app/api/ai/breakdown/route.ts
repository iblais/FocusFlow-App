import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AIBreakdownSchema, MicroStep } from "@/types/task";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/breakdown - Break down a task into micro-steps
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = AIBreakdownSchema.parse(body);

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI breakdown is not configured. Please set OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    // Build the prompt with ADHD-specific considerations
    const systemPrompt = `You are an expert task breakdown assistant specializing in ADHD task management.

Break down tasks into micro-steps following these rules:
1. Each step should take 5-15 minutes maximum
2. Steps must be concrete and actionable
3. Include transition buffers (5 min breaks) every 2-3 steps
4. Flag potential executive function challenges
5. Assign energy levels: LOW (admin/routine), MEDIUM (standard work), HIGH (creative/problem-solving)
6. Be encouraging and use positive language

Return ONLY a JSON array of objects with this structure:
[
  {
    "step": "Clear description of what to do",
    "time": 10,
    "energy": "MEDIUM"
  }
]`;

    const userPrompt = `Task: ${validatedData.taskTitle}
${validatedData.taskDescription ? `Description: ${validatedData.taskDescription}` : ""}
Estimated total time: ${validatedData.estimatedTime} minutes

${validatedData.userEFScores ? `User's Executive Function scores (0-100):
- Planning: ${validatedData.userEFScores.planning}
- Working Memory: ${validatedData.userEFScores.workingMemory}
- Inhibition: ${validatedData.userEFScores.inhibition}
- Flexibility: ${validatedData.userEFScores.flexibility}
- Time Management: ${validatedData.userEFScores.timeManagement}
- Self Monitoring: ${validatedData.userEFScores.selfMonitoring}

Consider these scores when creating steps. Lower scores mean the user needs more support in that area.` : ""}

Break this down into micro-steps:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse the response
    let microSteps: MicroStep[];
    try {
      const parsed = JSON.parse(responseContent);
      // Handle both array and object with steps array
      microSteps = Array.isArray(parsed) ? parsed : parsed.steps || parsed.microSteps || [];

      // Validate each step
      microSteps = microSteps.map((step: unknown) => {
        const validated = {
          step: typeof step === "object" && step !== null && "step" in step ? String(step.step) : "",
          time: typeof step === "object" && step !== null && "time" in step ? Number(step.time) : 10,
          energy: typeof step === "object" && step !== null && "energy" in step
            ? String(step.energy).toUpperCase()
            : "MEDIUM",
          completed: false,
        };

        // Ensure energy is valid
        if (!["LOW", "MEDIUM", "HIGH"].includes(validated.energy)) {
          validated.energy = "MEDIUM";
        }

        return validated;
      });
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error("Failed to parse AI response");
    }

    // Verify we got valid steps
    if (!microSteps || microSteps.length === 0) {
      throw new Error("No steps generated");
    }

    return NextResponse.json(
      {
        microSteps,
        metadata: {
          model: completion.model,
          tokensUsed: completion.usage?.total_tokens || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in AI breakdown:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
