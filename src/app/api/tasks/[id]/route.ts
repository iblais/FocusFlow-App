import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateTaskSchema } from "@/types/task";
import { z } from "zod";

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        subTasks: {
          orderBy: {
            createdAt: "asc",
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateTaskSchema.parse(body);

    // If status is being changed to COMPLETED, set completedAt
    const updateData: Record<string, unknown> = { ...validatedData };

    if (validatedData.status === "COMPLETED" && existingTask.status !== "COMPLETED") {
      updateData.completedAt = new Date();
    } else if (validatedData.status && validatedData.status !== "COMPLETED") {
      updateData.completedAt = null;
    }

    // Convert date strings to Date objects
    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }
    if (validatedData.deferredUntil) {
      updateData.deferredUntil = new Date(validatedData.deferredUntil);
    }

    const task = await prisma.task.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        subTasks: true,
      },
    });

    // If task is completed and user has a profile, award XP
    if (task.status === "COMPLETED" && existingTask.status !== "COMPLETED") {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (profile) {
        // Base XP: 10, +5 for each difficulty level
        const xpGain = 10 + (task.difficulty || 0) * 5;

        await prisma.userProfile.update({
          where: { userId: session.user.id },
          data: {
            totalXP: profile.totalXP + xpGain,
            level: Math.floor((profile.totalXP + xpGain) / 100) + 1,
          },
        });
      }
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid task data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Delete the task (cascade will handle subtasks)
    await prisma.task.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
