import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CommonTask from "@/lib/models/CommonTask";

export async function GET() {
  try {
    await connectDB();
    const tasks = await CommonTask.find().sort({ createdAt: -1 });
    return NextResponse.json(tasks, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch common tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    await connectDB();

    const task = await CommonTask.create({ title });
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 }
    );
  }
}
