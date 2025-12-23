import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/mongodb";
import PersonalTask from "@/lib/models/PersonalTask";

export async function GET() {
  try {
    const token = cookies().get("admin_token")?.value;
    if (!token) return NextResponse.json([], { status: 401 });

    const { adminId } = verifyJWT(token);
    await connectDB();

    const tasks = await PersonalTask.find({ adminId }).sort({
      createdAt: -1,
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("admin_token")?.value;
    if (!token) return NextResponse.json({}, { status: 401 });

    const { adminId } = verifyJWT(token);
    const { title } = await request.json();

    await connectDB();

    const task = await PersonalTask.create({
      adminId,
      title,
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 }
    );
  }
}
