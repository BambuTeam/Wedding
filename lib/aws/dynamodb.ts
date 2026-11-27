import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.APP_AWS_REGION || process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const clientConfig: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
  region,
};

if (accessKeyId && secretAccessKey) {
  clientConfig.credentials = {
    accessKeyId,
    secretAccessKey,
  };
}

export const dynamoClient = new DynamoDBClient(clientConfig);

export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "EventosPlatform";

/**
 * Verifica la conectividad con DynamoDB y la existencia de la tabla
 */
export async function checkDynamoConnection(): Promise<{ connected: boolean; table: string; error?: string }> {
  try {
    const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");
    const cmd = new ScanCommand({ TableName: TABLE_NAME, Limit: 1 });
    await docClient.send(cmd);
    return { connected: true, table: TABLE_NAME };
  } catch (error: any) {
    return {
      connected: false,
      table: TABLE_NAME,
      error: error?.message || "No se pudo conectar a DynamoDB",
    };
  }
}
