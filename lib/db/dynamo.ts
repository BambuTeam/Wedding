import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getAwsConfig } from "../aws/clients";

const { region, credentials } = getAwsConfig();

const isConfigured = Boolean(
  credentials || process.env.AWS_EXECUTION_ENV
);

let docClient: DynamoDBDocumentClient | null = null;

if (isConfigured) {
  try {
    const rawClient = new DynamoDBClient({
      region,
      ...(credentials ? { credentials } : {}),
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
