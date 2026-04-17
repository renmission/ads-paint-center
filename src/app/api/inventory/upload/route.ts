export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/shared/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 },
    );
  }
  if (session.user.role !== "administrator") {
    return Response.json(
      {
        error: { code: "FORBIDDEN", message: "Administrator access required." },
      },
      { status: 403 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json(
      { error: { code: "BAD_REQUEST", message: "No file provided." } },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Only JPEG, PNG, and WebP images are allowed.",
        },
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: { code: "BAD_REQUEST", message: "File must be under 4 MB." } },
      { status: 400 },
    );
  }

  const blob = await put(`products/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  return Response.json({ url: blob.url }, { status: 200 });
}
