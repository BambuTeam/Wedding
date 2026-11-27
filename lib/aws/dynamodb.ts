import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getAwsConfig } from "./clients";

const { region, credentials } = getAwsConfig();

const clientConfig: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
  region,
};

if (credentials) {
  clientConfig.credentials = credentials;
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
