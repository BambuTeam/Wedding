import { NextResponse } from "next/server";
import { checkDynamoConnection, TABLE_NAME } from "@/lib/aws/dynamodb";
import { BUCKET_NAME } from "@/lib/aws/s3";
import { getAwsConfig } from "@/lib/aws/clients";

export async function GET() {
  try {
    const dynamoCheck = await checkDynamoConnection();
    const awsConfig = getAwsConfig();

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
        region: awsConfig.region,
      },
      env: {
        region: awsConfig.region,
        hasAccessKey: Boolean(awsConfig.credentials?.accessKeyId),
        hasSecretKey: Boolean(awsConfig.credentials?.secretAccessKey),
        credentialSource: process.env.AUREA_AWS_ACCESS_KEY_ID
          ? "AUREA_AWS_*"
          : process.env.APP_AWS_ACCESS_KEY_ID
          ? "APP_AWS_*"
          : process.env.AWS_ACCESS_KEY_ID
          ? "AWS_*"
          : "none",
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
