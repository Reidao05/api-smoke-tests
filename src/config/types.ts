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
    camt053: { company: string; bankAccountId: string; accountNumber: string };
  };

  cashApplication: { delimited: { company: string; bankAccountId: string } 
    bai2: { company: string; bankAccountId: string };
  };
};

type RawEnvJson = {
  name?: EnvName;
  baseUrl?: string;
  authBaseUrl?: string;
  dns?: string;
  auth?: {
    clientId?: string;       // env var NAME
    secret?: string;         // env var NAME
    secretName?: string;     // env var NAME
    directoryId?: string;    // env var NAME
    subscriptionId?: string; // env var NAME
    scope?: string;          // env var NAME
  };
  bankStatements?: {
    bai2?: { company?: string; bankAccountId?: string };
    mt940?: { company?: string; bankAccountId?: string };
    wellsFargo?: { company?: string; bankAccountId?: string };
    camt053?: { company?: string; bankAccountId?: string; accountNumber?: string };
  };
  cashApplication?: { delimited?: { company?: string; bankAccountId?: string } 
    bai2?: { company?: string; bankAccountId?: string };
  };
};

function requireString(value: unknown, path: string): string {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) throw new Error(`Missing or empty '${path}'`);
  return v;
}

function resolveEnvVar(envVarName: string, path: string): string {
  const key = (envVarName ?? "").trim();
  if (!key) throw new Error(`Missing env var name at '${path}'`);
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable '${key}' (from ${path})`);
  return value;
}

export function loadEnvConfig(envName: EnvName): EnvConfig {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cfg = require(`../../env.${envName}.json`) as RawEnvJson;

  // Validate JSON (once)
  const baseUrl = requireString(cfg.baseUrl, "baseUrl");
  const authBaseUrl = requireString(cfg.authBaseUrl, "authBaseUrl");
  const dns = requireString(cfg.dns, "dns");

  // Validate required endpoint config (once)
  const bai2Company = requireString(cfg.bankStatements?.bai2?.company, "bankStatements.bai2.company");
  const bai2BankAccountId = requireString(cfg.bankStatements?.bai2?.bankAccountId, "bankStatements.bai2.bankAccountId");

  const mt940Company = requireString(cfg.bankStatements?.mt940?.company, "bankStatements.mt940.company");
  const mt940BankAccountId = requireString(cfg.bankStatements?.mt940?.bankAccountId, "bankStatements.mt940.bankAccountId");

  const wfCompany = requireString(cfg.bankStatements?.wellsFargo?.company, "bankStatements.wellsFargo.company");
  const wfBankAccountId = requireString(cfg.bankStatements?.wellsFargo?.bankAccountId, "bankStatements.wellsFargo.bankAccountId");

  const camtCompany = requireString(cfg.bankStatements?.camt053?.company, "bankStatements.camt053.company");
  const camtBankAccountId = requireString(cfg.bankStatements?.camt053?.bankAccountId, "bankStatements.camt053.bankAccountId");
  const camtAccountNumber = requireString(cfg.bankStatements?.camt053?.accountNumber, "bankStatements.camt053.accountNumber");

  const cashCompany = requireString(cfg.cashApplication?.delimited?.company, "cashApplication.company");
  const cashBankAccountId = requireString(cfg.cashApplication?.delimited?.bankAccountId, "cashApplication.bankAccountId");

  const cashBai2Company = requireString(cfg.cashApplication?.bai2?.company, "cashApplication.bai2.company");
  const cashBai2BankId  = requireString(cfg.cashApplication?.bai2?.bankAccountId, "cashApplication.bai2.bankAccountId");


  // Resolve secrets (cfg.auth.* stores ENV VAR NAMES)
  const auth = cfg.auth ?? {};
  const clientId = resolveEnvVar(requireString(auth.clientId, "auth.clientId"), "auth.clientId");
  const secret = resolveEnvVar(requireString(auth.secret, "auth.secret"), "auth.secret");
  const secretName = resolveEnvVar(requireString(auth.secretName, "auth.secretName"), "auth.secretName");
  const directory = resolveEnvVar(requireString(auth.directoryId, "auth.directoryId"), "auth.directoryId");
  const subscription = resolveEnvVar(requireString(auth.subscriptionId, "auth.subscriptionId"), "auth.subscriptionId");
  const scope = resolveEnvVar(requireString(auth.scope, "auth.scope"), "auth.scope");

  return {
    name: envName, // safer than trusting cfg.name
    baseUrl,
    authBaseUrl,

    clientId,
    secret,
    secretName,
    directory,
    subscription,
    scope,

    dns,

    bankStatements: {
      bai2: { company: bai2Company, bankAccountId: bai2BankAccountId },
      mt940: { company: mt940Company, bankAccountId: mt940BankAccountId },
      wellsFargo: { company: wfCompany, bankAccountId: wfBankAccountId },
      camt053: { company: camtCompany, bankAccountId: camtBankAccountId, accountNumber: camtAccountNumber },
    },

    cashApplication: { delimited: { company: cashCompany, bankAccountId: cashBankAccountId },  
      bai2: { company: cashBai2Company, bankAccountId: cashBai2BankId },
    },
}};
