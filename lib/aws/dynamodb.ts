import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "us-east-1";

const clientConfig: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string } } = {
  region,
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
    const { DescribeTableCommand } = await import("@aws-sdk/client-dynamodb");
    const cmd = new DescribeTableCommand({ TableName: TABLE_NAME });
    await dynamoClient.send(cmd);
    return { connected: true, table: TABLE_NAME };
  } catch (error: any) {
    // Si la tabla no existe o las credenciales no están configuradas
    return {
      connected: false,
      table: TABLE_NAME,
      error: error?.message || "No se pudo conectar a DynamoDB",
    };
  }
}
