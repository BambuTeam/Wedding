import { NextResponse } from "next/server";
import { checkDynamoConnection, TABLE_NAME } from "@/lib/aws/dynamodb";
import { BUCKET_NAME } from "@/lib/aws/s3";

export async function GET() {
  try {
    const dynamoCheck = await checkDynamoConnection();

    return NextResponse.json({
      success: true,
      dynamodb: {
        connected: dynamoCheck.connected,
        table: TABLE_NAME,
        status: dynamoCheck.connected ? "Conectado" : "Modo Fallback / Desconectado",
        error: dynamoCheck.error,
      },
      s3: {
        bucket: BUCKET_NAME,
        region: process.env.AWS_REGION || "us-east-1",
      },
      env: {
        region: process.env.AWS_REGION || "us-east-1",
        hasAccessKey: Boolean(process.env.AWS_ACCESS_KEY_ID),
        hasSecretKey: Boolean(process.env.AWS_SECRET_ACCESS_KEY),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Error al verificar conexión",
      },
      { status: 500 }
    );
  }
}
