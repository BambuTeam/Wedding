# AUREA — AWS Zero-Waste Architecture & Production Setup

Este documento contiene la especificación arquitectónica, comandos exactos de AWS CLI y políticas IAM para desplegar **AUREA** en una arquitectura Serverless de costo base cero ($0/mes en reposo) y escalado instantáneo para eventos de alto tráfico.

---

## 1. Topología Arquitectónica Serverless

```mermaid
flowchart TD
    Guest[Invitado / Mobile WhatsApp] -->|HTTPS / CDN Global| CF[Amazon CloudFront]
    Planner[Wedding Planner / Dashboard] -->|HTTPS / Web| CF
    TV[Modo TV / Pantalla Proyector] -->|SSE / Polling| CF
    
    CF -->|SSR & API Routes| Amplify[AWS Amplify Hosting / Next.js Serverless Engine]
    CF -->|Fotos & Media| S3[Amazon S3 Bucket: aurea-wedding-media]
    
    subgraph Compute & Logic [Next.js Route Handlers]
        Amplify --> CheckIn[/api/events/eventId/checkin]
        Amplify --> UploadUrl[/api/events/eventId/upload-url]
        Amplify --> GuestMgmt[/api/events/eventId/guests]
    end

    subgraph Data Tier [AWS Zero-Waste Storage]
        CheckIn -->|UpdateCommand con ConditionExpression| DDB[(Amazon DynamoDB Single-Table)]
        GuestMgmt -->|Query / Put / Transact| DDB
        UploadUrl -->|Genera Presigned PUT URL| S3
    end
```

### Principios "Zero-Waste"
1. **Amazon DynamoDB (On-Demand / Pay-Per-Request):**
   - Costo mensual en reposo: **$0.00 USD**.
   - Solo pagas por solicitudes de lectura (`RRU`) y escritura (`WRU`).
   - Soporte atómico anti-colisión en el check-in de recepción mediante `ConditionExpression`.
2. **Amazon S3 con Pre-signed URLs:**
   - La aplicación Next.js nunca procesa payloads binarios de fotos ni consume memoria de cómputo para uploads.
   - El cliente sube directamente a S3 en PUT firmado (TTL 5 minutos).
3. **Frontend & Backend Unificado:**
   - Despliegue nativo en **AWS Amplify Hosting** con Next.js App Router (o contenedor ECS Fargate / EC2 detrás de CloudFront).

---

## 2. Configuración en 30 Segundos vía AWS CLI

Ejecuta los siguientes comandos desde tu terminal con credenciales de AWS activas:

### Paso 2.1: Crear Tabla DynamoDB Single-Table (`EventosPlatform`)

```bash
aws dynamodb create-table \
    --table-name EventosPlatform \
    --attribute-definitions \
        AttributeName=PK,AttributeType=S \
        AttributeName=SK,AttributeType=S \
    --key-schema \
        AttributeName=PK,KeyType=HASH \
        AttributeName=SK,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --tags Key=Project,Value=Aurea Key=Environment,Value=Production
```

> **Verificación:** La tabla se creará en 10-15 segundos con partición `PK` y clave de ordenación `SK`.

---

### Paso 2.2: Crear Bucket S3 para Fotos del Álbum en Vivo

```bash
# Define tu nombre de bucket único
export BUCKET_NAME="aurea-wedding-media-$(date +%s)"

# Crear bucket (ejemplo en us-east-1)
aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region us-east-1

# Habilitar acceso público de lectura para fotos
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Política de lectura pública para el álbum de fotos
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
            {
                \"Sid\": \"PublicReadGetObject\",
                \"Effect\": \"Allow\",
                \"Principal\": \"*\",
                \"Action\": \"s3:GetObject\",
                \"Resource\": \"arn:aws:s3:::$BUCKET_NAME/*\"
            }
        ]
    }"
```

---

### Paso 2.3: Configurar CORS en S3 para Cargas Directas desde el Navegador

Crea un archivo temporal `cors.json`:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

Aplica el CORS al bucket:

```bash
aws s3api put-bucket-cors \
    --bucket $BUCKET_NAME \
    --cors-configuration file://cors.json
```

---

## 3. Modelo de Datos Single-Table en DynamoDB

Toda la plataforma reside en una única tabla `EventosPlatform`:

| Entidad | `PK` | `SK` | Atributos Clave |
| :--- | :--- | :--- | :--- |
| **Evento (Meta)** | `EVENT#<eventId>` | `META` | `title`, `couple`, `date`, `venueName`, `venueAddress`, `wifiSsid`, `wifiPassword`, `dressCode`, `palette`, `status` |
| **Invitado / Familia** | `EVENT#<eventId>` | `GUEST#<guestToken>` | `familyName`, `phone`, `maxSeats`, `confirmedSeats`, `status` (`UNOPENED`, `OPENED`, `CONFIRMED`, `DECLINED`), `openedAt`, `confirmedAt`, `checkedInAt`, `checkedInBy`, `tableId`, `dietaryNotes`, `guestMessage` |
| **Mesa** | `EVENT#<eventId>` | `TABLE#<tableId>` | `name`, `capacity`, `type` (`ROUND`, `IMPERIAL`), `coordinates` (`{x, y}`) |
| **Foto en Vivo** | `EVENT#<eventId>` | `PHOTO#<timestamp>#<id>` | `url`, `author`, `message`, `timestamp` |

### Control Anti-Fraude Atómico en Check-In (`UpdateCommand`)

Para evitar que un QR sea duplicado o escaneado simultáneamente en dos puertas de acceso:

```typescript
const command = new UpdateCommand({
  TableName: process.env.DYNAMODB_TABLE_NAME || "EventosPlatform",
  Key: {
    PK: `EVENT#${eventId}`,
    SK: `GUEST#${guestToken}`,
  },
  UpdateExpression: "SET checkedInAt = :now, checkedInBy = :operator",
  ConditionExpression: "attribute_not_exists(checkedInAt)",
  ExpressionAttributeValues: {
    ":now": new Date().toISOString(),
    ":operator": operatorName,
  },
  ReturnValues: "ALL_NEW",
});
```

- Si el pase nunca ha sido escaneado, la condición `attribute_not_exists(checkedInAt)` se cumple y la transacción se confirma de forma indivisible.
- Si dos tablets escanean el pase al mismo milisegundo, la segunda recibe un error de AWS `ConditionalCheckFailedException`, rechazando el acceso de inmediato y revelando la hora exacta del primer escaneo.

---

## 4. Política IAM de Menor Privilegio (Next.js Application Role)

Asigna esta política al usuario IAM o al rol de ejecución de AWS Amplify / ECS:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/EventosPlatform"
    },
    {
      "Sid": "S3UploadPresigned",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::aurea-wedding-media-*/*"
    }
  ]
}
```

---

## 5. Variables de Entorno (`.env.local`)

Copia tu archivo `.env.example` a `.env.local` y añade tus claves de AWS:

```bash
cp .env.example .env.local
```

Configura tus credenciales:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DYNAMODB_TABLE_NAME=EventosPlatform
S3_BUCKET_NAME=aurea-wedding-media-production
NEXT_PUBLIC_APP_URL=https://tuevento.aurea.lat
NEXT_PUBLIC_DEFAULT_EVENT_ID=camila-andres-2025
```

> **Fallback Local:** Si no defines `AWS_ACCESS_KEY_ID`, AUREA se ejecuta automáticamente en memoria con persistencia en tiempo de ejecución y todos los flujos 100% operativos para pruebas locales o demostraciones a clientes sin incurrir en costos.
