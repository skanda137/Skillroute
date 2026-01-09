import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getMentorAdvice } from "../services/api";
import { useTranslation } from "./TranslationContext";

interface MentorshipProps {
  skills: string[];
  cachedData?: string | null;
  onUpdate?: (data: string) => void;
  searchQuery?: string;
}

export const Mentorship: React.FC<MentorshipProps> = ({
  skills,
  cachedData = null,
  onUpdate,
  searchQuery = ""
}) => {
  const { t } = useTranslation();

  const [advice, setAdvice] = useState<string | null>(cachedData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!skills || skills.length === 0) return;

    const loadAdvice = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getMentorAdvice(skills);
        setAdvice(result.advice);
        onUpdate?.(result.advice);
      } catch (err) {
        console.error(err);
        setError("Failed to load mentor advice");
      } finally {
        setLoading(false);
      }
    };

    if (!cachedData) {
      loadAdvice();
    }
  }, [skills, cachedData]);


  const filteredAdvice = useMemo(() => {
    if (!advice) return "";
    if (!searchQuery) return advice;
    return advice.toLowerCase().includes(searchQuery.toLowerCase())
      ? advice
      : "";
  }, [advice, searchQuery]);

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

  if (!filteredAdvice) {
    return (
      <div className="py-10 text-center text-zinc-500">
        {t("noMentorAdvice")}
      </div>
    );
  }

  /* =======================
     Render
  ======================= */

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="glass p-6 rounded-2xl border border-zinc-800"
      >
        <h3 className="text-lg font-bold mb-3">
          {t("mentorAdvice")}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {filteredAdvice}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};
