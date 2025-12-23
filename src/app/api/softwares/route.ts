import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Software from "@/lib/models/Software";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import fs from "fs";
import path from "path";
import os from "os";

/* =========================
   GET → Public softwares
========================= */
export async function GET() {
  try {
    await connectDB();

    const softwares = await Software.find().sort({
      createdAt: -1,
    });

    return NextResponse.json(softwares, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch softwares" },
      { status: 500 }
    );
  }
}

/* =========================
   POST → Create software
========================= */
export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = (formData.get("status") as string) || "upcoming";
    const link = formData.get("link") as string;
    const imageFile = formData.get("image") as File | null;

    if (!name || !description) {
      return NextResponse.json(
        { message: "Name and description are required" },
        { status: 400 }
      );
    }

    let image;

    /* Optional image upload */
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const tempPath = path.join(
        os.tmpdir(),
        `${Date.now()}-${imageFile.name}`
      );

      fs.writeFileSync(tempPath, buffer);

      image = await uploadImage(tempPath, "softwares");

      fs.unlinkSync(tempPath);
    }

    const software = await Software.create({
      name,
      description,
      status,
      link,
      image,
    });

    return NextResponse.json(software, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create software" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT → Update software
========================= */
export async function PUT(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return NextResponse.json(
        { message: "Software ID required" },
        { status: 400 }
      );
    }

    const software = await Software.findById(id);
    if (!software) {
      return NextResponse.json(
        { message: "Software not found" },
        { status: 404 }
      );
    }

    /* Optional image replace */
    const imageFile = formData.get("image") as File | null;

    if (imageFile) {
      if (software.image?.publicId) {
        await deleteImage(software.image.publicId);
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const tempPath = path.join(
        os.tmpdir(),
        `${Date.now()}-${imageFile.name}`
      );

      fs.writeFileSync(tempPath, buffer);

      const image = await uploadImage(tempPath, "softwares");

      fs.unlinkSync(tempPath);

      software.image = image;
    }

    software.name =
      (formData.get("name") as string) || software.name;
    software.description =
      (formData.get("description") as string) ||
      software.description;
    software.status =
      (formData.get("status") as string) || software.status;
    software.link =
      (formData.get("link") as string) || software.link;

    await software.save();

    return NextResponse.json(software, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to update software" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE → Remove software
========================= */
export async function DELETE(req: Request) {
  try {
    await connectDB();

    const { id } = await req.json();

    const software = await Software.findById(id);
    if (!software) {
      return NextResponse.json(
        { message: "Software not found" },
        { status: 404 }
      );
    }

    if (software.image?.publicId) {
      await deleteImage(software.image.publicId);
    }

    await Software.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Software deleted successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete software" },
      { status: 500 }
    );
  }
}
