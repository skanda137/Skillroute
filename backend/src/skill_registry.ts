import axios, { AxiosError } from "axios";
import Skill from "./models/Skill";

export interface SkillRequest {
  input: string;
  context?: unknown;
}

export interface SkillResponse {
  text?: string;
  code?: string;
  results?: unknown;
  [key: string]: unknown;
}


export async function invokeSkill(
  skill: Skill,
  request: SkillRequest
): Promise<SkillResponse> {
  const { endpoint, timeoutMs, authConfig } = skill;

  if (!endpoint) {
    throw new Error(`Skill ${skill.name} has no endpoint configured`);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  // Authentication handling
  if (authConfig) {
    const config = authConfig as {
      type: "bearer" | "api_key";
      token_env?: string;
      key_env?: string;
    };

    if (config.type === "bearer" && config.token_env) {
      const token = process.env[config.token_env];
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.type === "api_key" && config.key_env) {
      const apiKey = process.env[config.key_env];
      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      }
    }
  }

  try {
    const response = await axios.post(
      endpoint,
      {
        skill: skill.name,
        version: skill.version,
        ...request
      },
      {
        headers,
        timeout: timeoutMs ?? 10_000
      }
    );

    return response.data as SkillResponse;
  } catch (err) {
    const error = err as AxiosError<any>;

    if (error.code === "ECONNABORTED") {
      throw new Error(
        `Skill ${skill.name} timed out after ${timeoutMs ?? 10_000}ms`
      );
    }

    if (error.response) {
      throw new Error(
        `Skill ${skill.name} returned error: ${error.response.status} - ${
          error.response.data?.message ?? "Unknown error"
        }`
      );
    }

    throw new Error(`Failed to invoke skill ${skill.name}: ${error.message}`);
  }
}

/* =======================
   Registry Operations
======================= */

export async function registerSkill(skillData: unknown): Promise<Skill> {
  try {
    return await Skill.create(skillData as any);
  } catch (error: any) {
    throw new Error(`Failed to register skill: ${error.message}`);
  }
}

export async function updateSkill(
  skillId: number,
  updates: unknown
): Promise<Skill> {
  const skill = await Skill.findByPk(skillId);

  if (!skill) {
    throw new Error("Skill not found");
  }

  await skill.update(updates as any);
  return skill;
}

export async function deactivateSkill(skillId: number): Promise<void> {
  const skill = await Skill.findByPk(skillId);

  if (!skill) {
    throw new Error("Skill not found");
  }

  await skill.update({ isActive: false });
}

export async function getAllSkills(
  includeInactive = false
): Promise<Skill[]> {
  const where = includeInactive ? {} : { isActive: true };
  return Skill.findAll({ where });
}

export async function getSkillById(
  skillId: number
): Promise<Skill | null> {
  return Skill.findByPk(skillId);
}

/* =======================
   Compatibility Export
   (for index.ts)
======================= */

/**
 * This keeps your backend index.ts happy.
 * Replace later with real role-based logic.
 */
export function getSkillPath(role: string): string[] {
  return [
    "fundamentals",
    "tools",
    "projects",
    "advanced-topics"
  ];
}
