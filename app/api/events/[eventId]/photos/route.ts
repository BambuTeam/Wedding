import { NextRequest, NextResponse } from "next/server";
import { EventsRepository } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const photos = await EventsRepository.getPhotos(params.eventId);
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json({ error: "Error al obtener fotos" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json();
    if (!body.url) {
      return NextResponse.json({ error: "URL de la foto es requerida" }, { status: 400 });
    }

    const newPhoto = await EventsRepository.addPhoto(params.eventId, {
      url: body.url,
      author: body.author || "Invitado Aurea",
      message: body.message || "",
      likes: 1,
    });

    return NextResponse.json({ photo: newPhoto }, { status: 201 });
  } catch (error) {
    console.error("Error creating photo:", error);
    return NextResponse.json({ error: "Error al publicar foto" }, { status: 500 });
  }
}
