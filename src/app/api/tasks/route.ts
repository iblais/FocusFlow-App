import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTaskSchema, TaskFilterSchema } from "@/types/task";
import { z } from "zod";

// GET /api/tasks - List all tasks for the authenticated user
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

    // Parse filters from query params
    const filters: Record<string, unknown> = {};

    const status = searchParams.get("status");
    if (status) filters.status = status;

    const energyLevel = searchParams.get("energyLevel");
    if (energyLevel) filters.energyLevel = energyLevel;

    const parentTaskId = searchParams.get("parentTaskId");
    if (parentTaskId) filters.parentTaskId = parentTaskId;

    // Build Prisma query
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        ...filters,
      },
      include: {
        subTasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid filter parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
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
    const validatedData = CreateTaskSchema.parse(body);

    // If parentTaskId is provided, verify it exists and belongs to user
    if (validatedData.parentTaskId) {
      const parentTask = await prisma.task.findFirst({
        where: {
          id: validatedData.parentTaskId,
          userId: session.user.id,
        },
      });

      if (!parentTask) {
        return NextResponse.json(
          { error: "Parent task not found" },
          { status: 404 }
        );
      }
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        parentTaskId: validatedData.parentTaskId,
        estimatedTime: validatedData.estimatedTime,
        energyLevel: validatedData.energyLevel,
        difficulty: validatedData.difficulty,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        tags: validatedData.tags,
      },
      include: {
        subTasks: true,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);

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
