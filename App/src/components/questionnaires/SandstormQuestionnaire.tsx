"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TextField, RadioGroup, CheckboxGroup } from "./QuestionTemplates";

export type SandstormDataV1 = {
  questionnaire: {
    stormFrequency: string;
    past30DaysCount: string;
    typicalDuration: string;
    typicalSeverity: string;
    symptomPattern: string;
    mostAffected: string;
    mostHelpful: string;
    description: string;
  };

  symptoms: string[];
  dailyLifeActions: string[];
  everImpacts: string[];
  protection: string[];
};

export default function SandstormQuestionnaire({
  questionnaire: questionnaireProp,
  setQ: setQProp,

  symptoms: symptomsProp,
  setSymptoms: setSymptomsProp,

  dailyLifeActions: dailyLifeActionsProp,
  setDailyLifeActions: setDailyLifeActionsProp,

  everImpacts: everImpactsProp,
  setEverImpacts: setEverImpactsProp,

  protection: protectionProp,
  setProtection: setProtectionProp,

  onUpdate,
}: {
  questionnaire?: any;
  setQ?: (key: string, value: string) => void;

  symptoms?: string[];
  setSymptoms?: (v: string[]) => void;

  dailyLifeActions?: string[];
  setDailyLifeActions?: (v: string[]) => void;

  everImpacts?: string[];
  setEverImpacts?: (v: string[]) => void;

  protection?: string[];
  setProtection?: (v: string[]) => void;

  onUpdate?: (payload: SandstormDataV1) => void;
} = {}) {
  const [questionnaireLocal, setQuestionnaireLocal] = useState({
    stormFrequency: "",
    past30DaysCount: "",
    typicalDuration: "",
    typicalSeverity: "",
    symptomPattern: "",
    mostAffected: "",
    mostHelpful: "",
    description: "",
  });

  const [symptomsLocal, setSymptomsLocal] = useState<string[]>([]);
  const [dailyLifeActionsLocal, setDailyLifeActionsLocal] = useState<string[]>(
    [],
  );
  const [everImpactsLocal, setEverImpactsLocal] = useState<string[]>([]);
  const [protectionLocal, setProtectionLocal] = useState<string[]>([]);

  const questionnaire = questionnaireProp ?? questionnaireLocal;
  const symptoms = symptomsProp ?? symptomsLocal;
  const dailyLifeActions = dailyLifeActionsProp ?? dailyLifeActionsLocal;
  const everImpacts = everImpactsProp ?? everImpactsLocal;
  const protection = protectionProp ?? protectionLocal;

  const setQ =
    setQProp ??
    ((key: string, value: string) =>
      setQuestionnaireLocal((prev) => ({ ...prev, [key]: value })));

  const setSymptoms = setSymptomsProp ?? setSymptomsLocal;
  const setDailyLifeActions =
    setDailyLifeActionsProp ?? setDailyLifeActionsLocal;
  const setEverImpacts = setEverImpactsProp ?? setEverImpactsLocal;
  const setProtection = setProtectionProp ?? setProtectionLocal;

  const payload: SandstormDataV1 = useMemo(() => {
    return {
      questionnaire: {
        stormFrequency: questionnaire.stormFrequency ?? "",
        past30DaysCount: questionnaire.past30DaysCount ?? "",
        typicalDuration: questionnaire.typicalDuration ?? "",
        typicalSeverity: questionnaire.typicalSeverity ?? "",
        symptomPattern: questionnaire.symptomPattern ?? "",
        mostAffected: questionnaire.mostAffected ?? "",
        mostHelpful: questionnaire.mostHelpful ?? "",
        description: questionnaire.description ?? "",
      },
      symptoms: symptoms ?? [],
      dailyLifeActions: dailyLifeActions ?? [],
      everImpacts: everImpacts ?? [],
      protection: protection ?? [],
    };
  }, [questionnaire, symptoms, dailyLifeActions, everImpacts, protection]);

  useEffect(() => {
    onUpdate?.(payload);
  }, [payload, onUpdate]);

  return (
    <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-8 space-y-10">
      <h2 className="text-xl font-black text-gray-800">
        Sand and Dust Storm (SDS) Community Questionnaire
      </h2>

      {/* Section A */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          Section A – Exposure to Sand and Dust Storms
        </h3>

        <RadioGroup
          label="How often do sand or dust storms occur in your area?"
          options={["Daily", "Weekly", "Monthly", "A few times per year"]}
          value={questionnaire.stormFrequency}
          setter={(v: string) => setQ("stormFrequency", v)}
        />

        <RadioGroup
          label="In the past 30 days, how many sandstorms did you experience?"
          options={["None", "1–2", "3–5", "More than 5"]}
          value={questionnaire.past30DaysCount}
          setter={(v: string) => setQ("past30DaysCount", v)}
        />

        <RadioGroup
          label="During a sandstorm, how long does it usually last?"
          options={[
            "Less than 1 hour",
            "1–3 hours",
            "Half a day",
            "All day or longer",
          ]}
          value={questionnaire.typicalDuration}
          setter={(v: string) => setQ("typicalDuration", v)}
        />

        <RadioGroup
          label="How severe are most sandstorms?"
          options={[
            "Mild (dust in air, little disruption)",
            "Moderate (reduced visibility, discomfort)",
            "Severe (hard to breathe, stay indoors)",
          ]}
          value={questionnaire.typicalSeverity}
          setter={(v: string) => setQ("typicalSeverity", v)}
        />
      </section>

      {/* Section B */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          Section B – Health Symptoms During or After Sandstorms
        </h3>

        <CheckboxGroup
          label="During or within 3 days after a sandstorm, do you experience:"
          options={[
            "Cough",
            "Shortness of breath",
            "Chest tightness",
            "Wheezing or asthma symptoms",
            "Headache",
            "Fatigue or weakness",
            "Eye irritation / redness / pain",
            "Runny or blocked nose",
            "Fever or flu-like symptoms",
            "None of the above",
          ]}
          values={symptoms}
          setter={setSymptoms}
        />

        <RadioGroup
          label="Do these symptoms:"
          options={[
            "Appear only during sandstorms",
            "Worsen during sandstorms",
            "Stay the same",
          ]}
          value={questionnaire.symptomPattern}
          setter={(v: string) => setQ("symptomPattern", v)}
        />
      </section>

      {/* Section C */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          Section C – Impact on Daily Life
        </h3>

        <CheckboxGroup
          label="During sandstorms, do you:"
          options={[
            "Stay indoors",
            "Miss work or school",
            "Reduce outdoor activities",
            "Have trouble travelling",
            "Seek medical help",
            "Do nothing different",
          ]}
          values={dailyLifeActions}
          setter={setDailyLifeActions}
        />

        <CheckboxGroup
          label="Have sandstorms ever:"
          options={[
            "Worsened a known health problem",
            "Affected pregnancy or a child’s health",
            "Caused an accident or injury",
          ]}
          values={everImpacts}
          setter={setEverImpacts}
        />
      </section>

      {/* Section D */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          Section D – Vulnerability and Protection
        </h3>

        <RadioGroup
          label="Who in your household is most affected?"
          options={[
            "Children under 5",
            "Pregnant women",
            "Elderly (60+)",
            "People with breathing problems",
            "Outdoor workers",
          ]}
          value={questionnaire.mostAffected}
          setter={(v: string) => setQ("mostAffected", v)}
        />

        <CheckboxGroup
          label="What do you do to protect yourself during sandstorms?"
          options={[
            "Stay indoors",
            "Cover mouth/nose with cloth",
            "Close windows/doors",
            "Use traditional remedies",
            "Nothing",
          ]}
          values={protection}
          setter={setProtection}
        />

        <RadioGroup
          label="What would help you most during sandstorms?"
          options={[
            "Better information / warnings",
            "Masks or protective cloths",
            "Health advice",
            "Cleaner indoor air",
            "Access to healthcare",
          ]}
          value={questionnaire.mostHelpful}
          setter={(v: string) => setQ("mostHelpful", v)}
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-black text-gray-700">Optional</h3>

        <TextField
          label="Can you describe how sandstorms affect your health or daily life?"
          value={questionnaire.description}
          setter={(v: string) => setQ("description", v)}
          placeholder="Write any details here..."
        />
      </section>
    </div>
  );
}
