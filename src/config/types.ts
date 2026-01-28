export type EnvName = "qa" | "test" | "prod";

export type EnvConfig = {
  name: EnvName;
  baseUrl: string;
  authBaseUrl: string;
  clientId: string;
  secret: string;
  secretName: string;
  directory: string;
  subscription: string;
  scope: string;
  dns: string;
  bankStatements: {
    bai2: { company: string; bankAccountId: string };    
    mt940: { company: string; bankAccountId: string };
    wellsFargo: { company: string; bankAccountId: string };
  };
};

export function loadEnvConfig(envName: EnvName): EnvConfig {
  // env.qa.json / env.test.json / env.prod.json
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cfg = require(`../../env.${envName}.json`);

  const resolveSecret = (envVarName: string): string => {
    const value = process.env[envVarName];
    if (!value) {
      throw new Error(`Missing required env var: ${envVarName}`);
    }
    if (!cfg.bankStatements?.bai2?.company)
       throw new Error("Missing bankStatements.bai2.company in env json");
    if (!cfg.bankStatements?.bai2?.bankAccountId) 
      throw new Error("Missing bankStatements.bai2.bankAccountId in env json");
    if (!cfg.bankStatements?.mt940?.company)
      throw new Error("Missing bankStatements.mt940.company in env json");
    if (!cfg.bankStatements?.mt940?.bankAccountId)
      throw new Error("Missing bankStatements.mt940.bankAccountId in env json");
    if (!cfg.bankStatements?.wellsFargo?.company)
      throw new Error("Missing bankStatements.wellsFargo.company in env json");
    if (!cfg.bankStatements?.wellsFargo?.bankAccountId)
      throw new Error("Missing bankStatements.wellsFargo.bankAccountId in env json");

    return value;
  };

  return {
    name: cfg.name,
    baseUrl: cfg.baseUrl,
    authBaseUrl: cfg.authBaseUrl,

    // cfg.auth.<x> should store the ENV VAR NAME, not the secret value
    clientId: resolveSecret(cfg.auth.clientId),
    secret: resolveSecret(cfg.auth.secret),
    secretName: resolveSecret(cfg.auth.secretName),
    directory: resolveSecret(cfg.auth.directoryId),
    subscription: resolveSecret(cfg.auth.subscriptionId),
    scope: resolveSecret(cfg.auth.scope),

    dns: cfg.dns,
    bankStatements: {
    bai2: {
      company: cfg.bankStatements?.bai2?.company ?? "",
      bankAccountId: cfg.bankStatements?.bai2?.bankAccountId ?? "",
    },
    mt940: {
      company: cfg.bankStatements?.mt940?.company ?? "",
      bankAccountId: cfg.bankStatements?.mt940?.bankAccountId ?? "",
    },
    wellsFargo: {
      company: cfg.bankStatements?.wellsFargo?.company ?? "",
      bankAccountId: cfg.bankStatements?.wellsFargo?.bankAccountId ?? "",
    },
    },
  };
}
