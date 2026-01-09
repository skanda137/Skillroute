import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { classifyIntent } from "./intent_classifier";
import { getSkillPath } from "./skill_registry";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("SkillRoute backend is running");
});

app.post("/api/opportunities", (req: Request, res: Response) => {
  const { skills } = req.body as { skills?: string[] };

  if (!skills || !skills.length) {
    return res.status(400).json({ error: "skills required" });
  }

  const opportunities = skills.map(skill => ({
    title: `${skill} Intern / Entry Role`,
    description: `Apply ${skill} skills in real-world projects.`,
    location: "Local / Remote",
    type: "Opportunity"
  }));

  res.json({ opportunities });
});

app.post("/api/intent", async (req: Request, res: Response) => {
  const { text } = req.body as { text?: string };

  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const result = await classifyIntent(text);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/skills", (req: Request, res: Response) => {
  const { role } = req.body as { role?: string };

  if (!role) {
    return res.status(400).json({ error: "role is required" });
  }

  try {
    const skills = getSkillPath(role);
    res.json({ skills });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
