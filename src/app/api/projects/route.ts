import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/lib/models/Project";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import fs from "fs";
import path from "path";
import os from "os";

/* =========================
   GET → Public projects
========================= */
export async function GET() {
  try {
    await connectDB();
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    return NextResponse.json(projects, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/* =========================
   POST → Create project
========================= */
export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const projectType = formData.get("projectType") as string;
    const link = formData.get("link") as string;
    const techStack = formData.getAll("techStack") as string[];
    const imageFile = formData.get("image") as File;

    if (!title || !description || !imageFile) {
      return NextResponse.json(
        { message: "Title, description and image are required" },
        { status: 400 }
      );
    }

    /* Save temp file */
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempPath = path.join(
      os.tmpdir(),
      `${Date.now()}-${imageFile.name}`
    );

    fs.writeFileSync(tempPath, buffer);

    /* Upload to Cloudinary */
    const image = await uploadImage(tempPath, "projects");

    fs.unlinkSync(tempPath);

    const project = await Project.create({
      title,
      description,
      projectType,
      link,
      techStack,
      image,
    });

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create project" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT → Update project
========================= */
export async function PUT(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return NextResponse.json(
        { message: "Project ID required" },
        { status: 400 }
      );
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    /* Replace image if new one provided */
    const imageFile = formData.get("image") as File | null;

    if (imageFile) {
      await deleteImage(project.image.publicId);

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const tempPath = path.join(
        os.tmpdir(),
        `${Date.now()}-${imageFile.name}`
      );

      fs.writeFileSync(tempPath, buffer);

      const image = await uploadImage(tempPath, "projects");

      fs.unlinkSync(tempPath);

      project.image = image;
    }

    project.title =
      (formData.get("title") as string) || project.title;
    project.description =
      (formData.get("description") as string) ||
      project.description;
    project.projectType =
      (formData.get("projectType") as string) ||
      project.projectType;
    project.link =
      (formData.get("link") as string) || project.link;

    const techStack = formData.getAll("techStack");
    if (techStack.length > 0) {
      project.techStack = techStack as string[];
    }

    await project.save();

    return NextResponse.json(project, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to update project" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE → Remove project
========================= */
export async function DELETE(req: Request) {
  try {
    await connectDB();

    const { id } = await req.json();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    /* Delete Cloudinary image */
    await deleteImage(project.image.publicId);

    await Project.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete project" },
      { status: 500 }
    );
  }
}
