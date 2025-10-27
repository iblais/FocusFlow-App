import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateFocusSessionSchema = z.object({
  taskId: z.string().optional().nullable(),
  duration: z.number().min(1),
  distractionCount: z.number().min(0).default(0),
  completed: z.boolean(),
  xpEarned: z.number().min(0).default(0),
});

// POST /api/focus-sessions - Create a new focus session
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
    const validatedData = CreateFocusSessionSchema.parse(body);

    // Create the focus session
    const focusSession = await prisma.focusSession.create({
      data: {
        userId: session.user.id,
        taskId: validatedData.taskId,
        duration: validatedData.duration,
        distractionCount: validatedData.distractionCount,
        completed: validatedData.completed,
        xpEarned: validatedData.xpEarned,
        endTime: new Date(),
      },
    });

    // Update user's XP and potentially level
    if (validatedData.completed && validatedData.xpEarned > 0) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (userProfile) {
        const newTotalXP = userProfile.totalXP + validatedData.xpEarned;
        const newLevel = Math.floor(newTotalXP / 100) + 1;

        await prisma.userProfile.update({
          where: { userId: session.user.id },
          data: {
            totalXP: newTotalXP,
            level: newLevel,
          },
        });

        // Check if we need to update streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastCheckin = await prisma.dailyCheckin.findFirst({
          where: {
            userId: session.user.id,
          },
          orderBy: {
            date: "desc",
          },
        });

        if (lastCheckin) {
          const lastCheckinDate = new Date(lastCheckin.date);
          lastCheckinDate.setHours(0, 0, 0, 0);

          const daysDiff = Math.floor(
            (today.getTime() - lastCheckinDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 1) {
            // Continue streak
            await prisma.userProfile.update({
              where: { userId: session.user.id },
              data: {
                currentStreak: userProfile.currentStreak + 1,
                longestStreak: Math.max(
                  userProfile.longestStreak,
                  userProfile.currentStreak + 1
                ),
              },
            });
          } else if (daysDiff > 1) {
            // Streak broken, reset to 1
            await prisma.userProfile.update({
              where: { userId: session.user.id },
              data: {
                currentStreak: 1,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ focusSession }, { status: 201 });
  } catch (error) {
    console.error("Error creating focus session:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid session data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/focus-sessions - Get user's focus sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const taskId = searchParams.get("taskId");

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (taskId) {
      where.taskId = taskId;
    }

    const focusSessions = await prisma.focusSession.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ focusSessions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching focus sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
