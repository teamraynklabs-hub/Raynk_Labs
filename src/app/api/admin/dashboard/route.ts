import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Service from "@/lib/models/Service";
import Course from "@/lib/models/Course";
import Project from "@/lib/models/Project";
import Software from "@/lib/models/Software";
import TeamMember from "@/lib/models/Team";

export async function GET() {
  try {
    await connectDB();

    const [
      services,
      courses,
      projects,
      softwares,
      team,
    ] = await Promise.all([
      Service.countDocuments(),
      Course.countDocuments(),
      Project.countDocuments(),
      Software.countDocuments(),
      TeamMember.countDocuments(),
    ]);

    return NextResponse.json(
      {
        services,
        courses,
        projects,
        softwares,
        team,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
