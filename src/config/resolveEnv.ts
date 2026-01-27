import type {EnvName } from "./types";

export function resolveEnvName(): EnvName {
    const arg = process.argv.find(a => a.startsWith("--env="));
    const fromArg = arg?.split("=")[1]?.toLowerCase();
    const env = (fromArg || process.env.ENV || "qa") as EnvName;

    if (!["qa", "test", "prod"].includes(env)) {
        throw new Error(`Invalid env '${env}'. Use --env=qa|test|prod`);
    }
    return env;
}