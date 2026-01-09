import React, { useEffect, useState } from "react";
import { fetchOpportunities } from "../services/api";
import { useTranslation } from "./TranslationContext";

/* =======================
   Types
======================= */

interface Opportunity {
  title: string;
  description: string;
  location: string;
  type: string;
}

interface LocalOpportunitiesFeedProps {
  skills: string[];
}

/* =======================
   Component
======================= */

export const LocalOpportunitiesFeed: React.FC<
  LocalOpportunitiesFeedProps
> = ({ skills }) => {
  const { t } = useTranslation();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* =======================
     Fetch opportunities
  ======================= */

  useEffect(() => {
    if (!skills || skills.length === 0) return;

    const loadOpportunities = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchOpportunities(skills);
        setOpportunities(result.opportunities);
      } catch (err) {
        console.error(err);
        setError("Failed to load opportunities");
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, [skills]);

  /* =======================
     UI States
  ======================= */

  if (loading) {
    return (
      <div className="py-10 text-center text-zinc-500">
        {t("loading")}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="py-10 text-center text-zinc-500">
        {t("noOpportunities")}
      </div>
    );
  }

  /* =======================
     Render
  ======================= */

  return (
    <div className="space-y-4">
      {opportunities.map((opp, idx) => (
        <div
          key={idx}
          className="glass p-5 rounded-xl border border-zinc-800"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{opp.title}</h4>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {opp.type}
            </span>
          </div>

          <p className="text-sm text-zinc-400 mb-2">
            {opp.description}
          </p>

          <p className="text-xs text-zinc-500">
            📍 {opp.location}
          </p>
        </div>
      ))}
    </div>
  );
};
