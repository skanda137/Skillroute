import Skill from "./models/Skill";

export async function classifyIntent(input: string): Promise<{ intent: string }> {
  const skills: Skill[] = await Skill.findAll({ where: { isActive: true } });

  if (!skills.length) {
    return { intent: "general" };
  }

  const normalizedInput = input.toLowerCase();

  const matchedSkill = skills.find((s: Skill) =>
    normalizedInput.includes(s.name.toLowerCase())
  );

  if (matchedSkill) {
    return { intent: matchedSkill.name };
  }

  const generalSkill =
    skills.find((s: Skill) => s.name.toLowerCase().includes("general")) ||
    skills[0];

  return { intent: generalSkill.name };
}
