import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.APP_AWS_REGION || process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const isConfigured = Boolean(
  (accessKeyId && secretAccessKey) || process.env.AWS_EXECUTION_ENV
);

let docClient: DynamoDBDocumentClient | null = null;

if (isConfigured) {
  try {
    const rawClient = new DynamoDBClient({
      region,
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });

    docClient = DynamoDBDocumentClient.from(rawClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: false,
      },
    });
  } catch (error) {
    console.warn("[AUREA AWS] Error initializing DynamoDB client, falling back to in-memory mode.", error);
    docClient = null;
  }
}

export function isDynamoConfigured(): boolean {
  return isConfigured && docClient !== null;
}

export function getDynamoClient(): DynamoDBDocumentClient | null {
  return docClient;
}

export const DYNAMO_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "EventosPlatform";
