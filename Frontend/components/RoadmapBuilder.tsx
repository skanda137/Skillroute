import React, { useState, useEffect, useMemo } from "react";
import { classifyIntent, getSkillPath } from "../services/api";
import { StudentProfile, Roadmap } from "../types";
import { useTranslation } from "./TranslationContext";

/* =======================
   Props
======================= */

interface RoadmapBuilderProps {
  profile: StudentProfile;
  cachedData: Roadmap | null;
  onUpdate: (data: Roadmap) => void;
  searchQuery?: string;
}

/* =======================
   Component
======================= */

export const RoadmapBuilder: React.FC<RoadmapBuilderProps> = ({
  profile,
  cachedData,
  onUpdate,
  searchQuery = ""
}) => {
  const { t } = useTranslation();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(cachedData);
  const [isLoading, setIsLoading] = useState(!cachedData);

  /* =======================
     Fetch from backend
  ======================= */

  const fetchRoadmap = async () => {
    setIsLoading(true);

    try {
      // 1️⃣ Classify intent
      const intentResult = await classifyIntent(profile.goal);
      const role = intentResult.intent;

      // 2️⃣ Get skills from backend
      const skillResult = await getSkillPath(role);

      const generatedRoadmap: Roadmap = {
  goal: profile.goal,
  durationWeeks: skillResult.skills.length,
  steps: skillResult.skills.map((skill: string, index: number) => ({
    week: index + 1,
    topic: skill,
    description: `Learn ${skill} fundamentals and practice with hands-on tasks.`,
    resourceType: "Online",
    tasks: [
      `Understand basics of ${skill}`,
      `Build a small project using ${skill}`,
      `Review best practices`
    ]
  }))
};


      setRoadmap(generatedRoadmap);
      onUpdate(generatedRoadmap);
    } catch (error) {
      console.error("Failed to generate roadmap", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     Lifecycle
  ======================= */

  useEffect(() => {
    if (!cachedData) {
      fetchRoadmap();
    }
  }, [profile, cachedData]);

  /* =======================
     Search filter
  ======================= */

  const filteredSteps = useMemo(() => {
    if (!roadmap) return [];
    if (!searchQuery) return roadmap.steps;

    const q = searchQuery.toLowerCase();
    return roadmap.steps.filter(
      s =>
        s.topic.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tasks.some(task => task.toLowerCase().includes(q))
    );
  }, [roadmap, searchQuery]);

  /* =======================
     UI States
  ======================= */

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div>
          <h3 className="text-xl font-bold">Designing Your Path...</h3>
          <p className="text-zinc-500 max-w-sm">
            SkillRoute AI is creating a personalized learning roadmap.
          </p>
        </div>
      </div>
    );
  }

  if (!roadmap) return null;

  /* =======================
     Render
  ======================= */

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">{t("roadmap")}</h2>
          <p className="text-zinc-400">
            {t("targetGoal")}:{" "}
            <span className="text-emerald-500 font-medium">
              {roadmap.goal}
            </span>
          </p>
        </div>

        <button
          onClick={fetchRoadmap}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-xl border border-zinc-700"
        >
          🔄 {t("regenerate")}
        </button>
      </div>

      {filteredSteps.length === 0 ? (
        <div className="py-20 text-center glass rounded-2xl border-dashed">
          <p className="text-zinc-500">
            No steps match your search "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSteps.map(step => (
            <div
              key={step.week}
              className="glass p-6 rounded-2xl border border-zinc-800"
            >
              <h4 className="font-bold text-lg mb-2">
                Week {step.week}: {step.topic}
              </h4>
              <p className="text-sm text-zinc-400 mb-4">
                {step.description}
              </p>
              <ul className="space-y-1">
                {step.tasks.map((task, i) => (
                  <li key={i} className="text-xs text-zinc-500">
                    • {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
