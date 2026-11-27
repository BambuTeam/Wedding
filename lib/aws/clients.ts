/**
 * Centralized AWS Credentials & Configuration Resolver
 * Compatible with AWS Amplify SSR, Vercel, ECS and Local Dev.
 *
 * AWS Amplify restricts variables starting with `AWS_`, so we check:
 * 1. AUREA_AWS_* (Amplify Custom Environment Variables)
 * 2. APP_AWS_* (Alternative prefix)
 * 3. AWS_* (Standard AWS SDK Environment Variables)
 */

export function getAwsConfig() {
  const region =
    process.env.AUREA_AWS_REGION ||
    process.env.APP_AWS_REGION ||
    process.env.AWS_REGION ||
    "us-east-1";

  const accessKeyId =
    process.env.AUREA_AWS_ACCESS_KEY_ID ||
    process.env.APP_AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID;

  const secretAccessKey =
    process.env.AUREA_AWS_SECRET_ACCESS_KEY ||
    process.env.APP_AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY;

  const credentials =
    accessKeyId && secretAccessKey
      ? {
          accessKeyId: accessKeyId.trim(),
          secretAccessKey: secretAccessKey.trim(),
        }
      : undefined;

  return {
    region: region.trim(),
    credentials,
    hasCredentials: Boolean(credentials),
  };
}
