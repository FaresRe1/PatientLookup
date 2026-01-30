import { ClipboardCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  TextField,
  RadioGroup,
  CheckboxGroup,
  CheckboxGroupWithOther,
} from "./QuestionTemplates";

type MedicalDataV1 = {
  questionnaire: {
    pregnant: string;
    breastfeeding: string;
    allergies: string;
    allergyDetails: string;
    mainProblem: string;
    severity: string;
    previousEpisodes: string;
    otherSymptoms: string;

    takingMedicines: string;
    medicationOne: string;
    medicationOneDose: string;
    medicationOneHowOften: string;
    medicationOneStartDate: string;
    medicationOneReason: string;
    medicationTwo: string;
    medicationTwoDose: string;
    medicationTwoHowOften: string;
    medicationThree: string;
    medicationThreeDose: string;
    medicationThreeHowOften: string;
    otherMedication: string;

    antibioticsLast30Days: string;
    antibioticsName: string;
    antibioticsForWhat: string;

    medicationSideEffects: string;

    usesTraditionalMedicine: string;
    remedySource: string;
    remedySourceOther: string;
    remedyFrequency: string;
    remedyFrequencyOther: string;
    remedyEffectiveness: string;

    remedyPartsUsed: string;
    remedyPreparationSteps: string;
    remedyAmountAndFrequency: string;
    remedyRoute: string;
    remedyMixtures: string;
    remedyAdvisor: string;

    recentHospitalisation: string;
    actionTaken: string;
  };

  mainReasonOnset: string[];
  betterWith: { choices: string[]; other: string };
  worseWith: { choices: string[]; other: string };

  symptoms: {
    general: string[];
    pain: string[];
    breathing: string[];
    digestive: string[];
    urinary: string[];
    skin: string[];
    womens: string[];
    neurological: string[];
  };

  remediesUsed: { choices: string[]; other: string };
  badReactions: { choices: string[]; other: string };
  keyRemediesTicked: string[];

  longTermConditions: { choices: string[]; other: string };
  triageRedFlags: string[];
};

export default function MedicalQuestionnaire({
  onUpdate,
}: {
  onUpdate?: (payload: MedicalDataV1) => void;
}) {
  // Questionnaire checkbox state
  const [mainReasonOnset, setMainReasonOnset] = useState<string[]>([]);
  const [betterWithChecklist, setBetterWithChecklist] = useState<string[]>([]);
  const [betterWithOther, setBetterWithOther] = useState("");
  const [worseWithChecklist, setWorseWithChecklist] = useState<string[]>([]);
  const [worseWithOther, setWorseWithOther] = useState("");

  const [symptomsGeneral, setSymptomsGeneral] = useState<string[]>([]);
  const [symptomsPain, setSymptomsPain] = useState<string[]>([]);
  const [symptomsBreathing, setSymptomsBreathing] = useState<string[]>([]);
  const [symptomsDigestive, setSymptomsDigestive] = useState<string[]>([]);
  const [symptomsUrinary, setSymptomsUrinary] = useState<string[]>([]);
  const [symptomsSkin, setSymptomsSkin] = useState<string[]>([]);
  const [symptomsWomens, setSymptomsWomens] = useState<string[]>([]);
  const [symptomsNeurological, setSymptomsNeurological] = useState<string[]>(
    [],
  );

  const [remediesUsedChecklist, setRemediesUsedChecklist] = useState<string[]>(
    [],
  );
  const [remediesUsedOther, setRemediesUsedOther] = useState("");

  const [badReactionsChecklist, setBadReactionsChecklist] = useState<string[]>(
    [],
  );
  const [badReactionsOther, setBadReactionsOther] = useState("");

  const [keyRemediesTicked, setKeyRemediesTicked] = useState<string[]>([]);

  const [longTermConditionsChecklist, setLongTermConditionsChecklist] =
    useState<string[]>([]);
  const [longTermConditionsOther, setLongTermConditionsOther] = useState("");

  const [triageRedFlagsChecklist, setTriageRedFlagsChecklist] = useState<
    string[]
  >([]);

  const [questionnaire, setQuestionnaire] = useState({
    pregnant: "",
    breastfeeding: "",
    allergies: "",
    allergyDetails: "",
    mainProblem: "",
    severity: "",
    previousEpisodes: "",
    otherSymptoms: "",
    takingMedicines: "",
    medicationOne: "",
    medicationOneDose: "",
    medicationOneHowOften: "",
    medicationOneStartDate: "",
    medicationOneReason: "",
    medicationTwo: "",
    medicationTwoDose: "",
    medicationTwoHowOften: "",
    medicationThree: "",
    medicationThreeDose: "",
    medicationThreeHowOften: "",
    otherMedication: "",
    antibioticsLast30Days: "",
    antibioticsName: "",
    antibioticsForWhat: "",
    medicationSideEffects: "",
    usesTraditionalMedicine: "",
    remedySource: "",
    remedySourceOther: "",
    remedyFrequency: "",
    remedyFrequencyOther: "",
    remedyEffectiveness: "",
    remedyPartsUsed: "",
    remedyPreparationSteps: "",
    remedyAmountAndFrequency: "",
    remedyRoute: "",
    remedyMixtures: "",
    remedyAdvisor: "",
    recentHospitalisation: "",
    actionTaken: "",
  });

  function setQ<K extends keyof typeof questionnaire>(key: K, value: string) {
    setQuestionnaire((prev) => ({ ...prev, [key]: value }));
  }

  const payload: MedicalDataV1 = useMemo(() => {
    return {
      questionnaire,

      mainReasonOnset,
      betterWith: { choices: betterWithChecklist, other: betterWithOther },
      worseWith: { choices: worseWithChecklist, other: worseWithOther },

      symptoms: {
        general: symptomsGeneral,
        pain: symptomsPain,
        breathing: symptomsBreathing,
        digestive: symptomsDigestive,
        urinary: symptomsUrinary,
        skin: symptomsSkin,
        womens: symptomsWomens,
        neurological: symptomsNeurological,
      },

      remediesUsed: {
        choices: remediesUsedChecklist,
        other: remediesUsedOther,
      },
      badReactions: {
        choices: badReactionsChecklist,
        other: badReactionsOther,
      },
      keyRemediesTicked,

      longTermConditions: {
        choices: longTermConditionsChecklist,
        other: longTermConditionsOther,
      },
      triageRedFlags: triageRedFlagsChecklist,
    };
  }, [
    questionnaire,
    mainReasonOnset,
    betterWithChecklist,
    betterWithOther,
    worseWithChecklist,
    worseWithOther,
    symptomsGeneral,
    symptomsPain,
    symptomsBreathing,
    symptomsDigestive,
    symptomsUrinary,
    symptomsSkin,
    symptomsWomens,
    symptomsNeurological,
    remediesUsedChecklist,
    remediesUsedOther,
    badReactionsChecklist,
    badReactionsOther,
    keyRemediesTicked,
    longTermConditionsChecklist,
    longTermConditionsOther,
    triageRedFlagsChecklist,
  ]);

  useEffect(() => {
    onUpdate?.(payload);
  }, [payload, onUpdate]);

  return (
    <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-8 space-y-10">
      <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
        <ClipboardCheck className="text-brand-orange" />
        Medical Focus Questionnaire
      </h2>

      <section className="space-y-4">
        <h3 className="font-black text-gray-700">A) Consent & basic details</h3>

        <RadioGroup
          label="Pregnant or possibly pregnant?"
          options={["Yes", "No", "Not applicable", "Unsure"]}
          value={questionnaire.pregnant}
          setter={(v) => setQ("pregnant", v)}
        />

        <RadioGroup
          label="Breastfeeding?"
          options={["Yes", "No", "Not applicable"]}
          value={questionnaire.breastfeeding}
          setter={(v) => setQ("breastfeeding", v)}
        />

        <RadioGroup
          label="Any known allergies?"
          options={["No", "Yes"]}
          value={questionnaire.allergies}
          setter={(v) => setQ("allergies", v)}
        />

        {questionnaire.allergies === "Yes" && (
          <TextField
            label="If yes → specify:"
            value={questionnaire.allergyDetails}
            setter={(v) => setQ("allergyDetails", v)}
          />
        )}
      </section>

      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          B) Main reason for visit (what you’re experiencing)
        </h3>

        <TextField
          label="What is your main problem today? (in your own words)"
          placeholder="In your own words"
          value={questionnaire.mainProblem}
          setter={(v) => setQ("mainProblem", v)}
        />

        <CheckboxGroup
          label="When did it start?"
          options={[
            "Today",
            "1–3 days",
            "4–7 days",
            "1–4 weeks",
            ">1 month",
            "On/off for months",
          ]}
          values={mainReasonOnset}
          setter={setMainReasonOnset}
        />

        <TextField
          label="How severe is it right now on a scale of 1-10?"
          placeholder="1 - 10"
          value={questionnaire.severity}
          setter={(v) => setQ("severity", v)}
        />

        <TextField
          label="Has this happened before? No/Yes → how often?"
          placeholder="No / Yes → how often?"
          value={questionnaire.previousEpisodes}
          setter={(v) => setQ("previousEpisodes", v)}
        />

        <CheckboxGroupWithOther
          label="What makes it better?"
          options={[
            "Rest",
            "Food",
            "Drinking water",
            "Heat",
            "Cold",
            "Medication",
            "Natural remedies",
            "Nothing",
          ]}
          values={betterWithChecklist}
          setter={setBetterWithChecklist}
          otherLabel="Other"
          otherValue={betterWithOther}
          setOtherValue={setBetterWithOther}
          otherPlaceholder="Other: ____"
        />

        <CheckboxGroupWithOther
          label="What makes it worse?"
          options={[
            "Movement",
            "Eating",
            "Drinking",
            "Night-time",
            "Stress",
            "Heat",
            "Cold",
          ]}
          values={worseWithChecklist}
          setter={setWorseWithChecklist}
          otherLabel="Other"
          otherValue={worseWithOther}
          setOtherValue={setWorseWithOther}
          otherPlaceholder="Other: ____"
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          C) Symptom checklist (tick all that apply)
        </h3>

        <CheckboxGroup
          label="General:"
          options={[
            "Fever",
            "Chills",
            "Fatigue",
            "Weight loss",
            "Night sweats",
          ]}
          values={symptomsGeneral}
          setter={setSymptomsGeneral}
        />

        <CheckboxGroup
          label="Pain:"
          options={[
            "Headache",
            "Chest pain",
            "Back pain",
            "Joint pain",
            "Abdominal pain",
          ]}
          values={symptomsPain}
          setter={setSymptomsPain}
        />

        <CheckboxGroup
          label="Breathing:"
          options={[
            "Cough",
            "Wheeze/asthma",
            "Shortness of breath",
            "Sore throat",
          ]}
          values={symptomsBreathing}
          setter={setSymptomsBreathing}
        />

        <CheckboxGroup
          label="Digestive:"
          options={[
            "Nausea",
            "Vomiting",
            "Diarrhoea",
            "Constipation",
            "Blood in stool",
          ]}
          values={symptomsDigestive}
          setter={setSymptomsDigestive}
        />

        <CheckboxGroup
          label="Urinary/kidney:"
          options={[
            "Burning urine",
            "Blood in urine",
            "Flank pain",
            "Urinary retention",
            "Kidney stones history",
          ]}
          values={symptomsUrinary}
          setter={setSymptomsUrinary}
        />

        <CheckboxGroup
          label="Skin:"
          options={[
            "Rash/itching",
            "Infected sores",
            "Scabies",
            "Hair loss",
            "Bruising/oedema",
          ]}
          values={symptomsSkin}
          setter={setSymptomsSkin}
        />

        <CheckboxGroup
          label="Women’s health:"
          options={[
            "Period pain",
            "Heavy bleeding",
            "Missed period",
            "Unusual discharge",
          ]}
          values={symptomsWomens}
          setter={setSymptomsWomens}
        />

        <CheckboxGroup
          label="Neurological:"
          options={[
            "Dizziness",
            "Confusion",
            "Hallucinations",
            "Seizures/fainting",
          ]}
          values={symptomsNeurological}
          setter={setSymptomsNeurological}
        />

        <TextField
          label="Other symptoms:"
          value={questionnaire.otherSymptoms}
          setter={(v) => setQ("otherSymptoms", v)}
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          D) Current medications (modern/clinical)
        </h3>

        <RadioGroup
          label="Are you currently taking any medicines from a clinic/pharmacy?"
          options={["No", "Yes"]}
          value={questionnaire.takingMedicines}
          setter={(v) => setQ("takingMedicines", v)}
        />

        <TextField
          label="Medication 1:"
          value={questionnaire.medicationOne}
          setter={(v) => setQ("medicationOne", v)}
        />
        <TextField
          label="Dose/How much:"
          value={questionnaire.medicationOneDose}
          setter={(v) => setQ("medicationOneDose", v)}
        />
        <TextField
          label="How often: (e.g., Daily / 2–3x/day / Weekly / When needed)"
          value={questionnaire.medicationOneHowOften}
          setter={(v) => setQ("medicationOneHowOften", v)}
        />
        <TextField
          label="Start date:"
          value={questionnaire.medicationOneStartDate}
          setter={(v) => setQ("medicationOneStartDate", v)}
        />
        <TextField
          label="Reason:"
          value={questionnaire.medicationOneReason}
          setter={(v) => setQ("medicationOneReason", v)}
        />

        <TextField
          label="Medication 2:"
          value={questionnaire.medicationTwo}
          setter={(v) => setQ("medicationTwo", v)}
        />
        <TextField
          label="Dose:"
          value={questionnaire.medicationTwoDose}
          setter={(v) => setQ("medicationTwoDose", v)}
        />
        <TextField
          label="How often:"
          value={questionnaire.medicationTwoHowOften}
          setter={(v) => setQ("medicationTwoHowOften", v)}
        />

        <TextField
          label="Medication 3:"
          value={questionnaire.medicationThree}
          setter={(v) => setQ("medicationThree", v)}
        />
        <TextField
          label="Dose:"
          value={questionnaire.medicationThreeDose}
          setter={(v) => setQ("medicationThreeDose", v)}
        />
        <TextField
          label="How often:"
          value={questionnaire.medicationThreeHowOften}
          setter={(v) => setQ("medicationThreeHowOften", v)}
        />

        <TextField
          label="Any injections, drops, creams, or inhalers? No/Yes → list:"
          value={questionnaire.otherMedication}
          setter={(v) => setQ("otherMedication", v)}
        />

        <RadioGroup
          label="Have you taken antibiotics in the last 30 days?"
          options={["No", "Yes", "Unsure"]}
          value={questionnaire.antibioticsLast30Days}
          setter={(v) => setQ("antibioticsLast30Days", v)}
        />

        {questionnaire.antibioticsLast30Days === "Yes" && (
          <>
            <TextField
              label="If yes: name (if known)"
              value={questionnaire.antibioticsName}
              setter={(v) => setQ("antibioticsName", v)}
            />
            <TextField
              label="and for what?"
              value={questionnaire.antibioticsForWhat}
              setter={(v) => setQ("antibioticsForWhat", v)}
            />
          </>
        )}

        <TextField
          label="Any side effects or problems from medications? No/Yes → describe:"
          value={questionnaire.medicationSideEffects}
          setter={(v) => setQ("medicationSideEffects", v)}
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          E) Natural remedies and traditional medicine use
        </h3>

        <RadioGroup
          label="Do you use natural remedies/traditional medicine for this issue or in general?"
          options={[
            "No",
            "Yes (for this problem)",
            "Yes (sometimes, other problems)",
          ]}
          value={questionnaire.usesTraditionalMedicine}
          setter={(v) => setQ("usesTraditionalMedicine", v)}
        />

        <CheckboxGroupWithOther
          label="For your current problem, what remedies have you used?"
          options={[
            "Herbal drink/tea/infusion",
            "Decoction (boiled strongly)",
            "Maceration (soaked in water)",
            "Smoke/inhalation",
            "Oil/ointment/cream",
            "Poultice/compress (applied on skin)",
            "Chewed plant/food remedy",
          ]}
          values={remediesUsedChecklist}
          setter={setRemediesUsedChecklist}
          otherLabel="Other"
          otherValue={remediesUsedOther}
          setOtherValue={setRemediesUsedOther}
          otherPlaceholder="Other: ___________________________"
        />

        <RadioGroup
          label="Where did you get the remedy?"
          options={[
            "Own preparation",
            "Family/friend",
            "Traditional healer",
            "Market",
            "Other",
          ]}
          value={questionnaire.remedySource}
          setter={(v) => setQ("remedySource", v)}
        />
        {questionnaire.remedySource === "Other" && (
          <TextField
            label="Other (source):"
            value={questionnaire.remedySourceOther}
            setter={(v) => setQ("remedySourceOther", v)}
          />
        )}

        <RadioGroup
          label="How often did you take/use it?"
          options={[
            "Once",
            "Daily",
            "2–3x/day",
            "Weekly",
            "When needed",
            "Other",
          ]}
          value={questionnaire.remedyFrequency}
          setter={(v) => setQ("remedyFrequency", v)}
        />
        {questionnaire.remedyFrequency === "Other" && (
          <TextField
            label="Other (frequency):"
            value={questionnaire.remedyFrequencyOther}
            setter={(v) => setQ("remedyFrequencyOther", v)}
          />
        )}

        <RadioGroup
          label="Did it help?"
          options={[
            "Yes, a lot",
            "Yes, a little",
            "No change",
            "Made it worse",
            "Unsure",
          ]}
          value={questionnaire.remedyEffectiveness}
          setter={(v) => setQ("remedyEffectiveness", v)}
        />

        <CheckboxGroupWithOther
          label="Any bad reactions after using it?"
          options={[
            "Severe stomach pain",
            "Vomiting",
            "Diarrhoea",
            "Bloody diarrhoea",
            "Rash/burning skin",
            "Eye irritation/injury",
            "Fast heartbeat/palpitations",
            "Dizziness/confusion",
            "Hallucinations",
            "Seizure/fainting",
          ]}
          values={badReactionsChecklist}
          setter={setBadReactionsChecklist}
          otherLabel="Other"
          otherValue={badReactionsOther}
          setOtherValue={setBadReactionsOther}
          otherPlaceholder="Other: ___________________________"
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          F) Key traditional remedies (Central Sahara) – identification +
          preparation
        </h3>

        <TextField
          label="Part used:"
          placeholder="Leaf, Root, Bark, Flower, Seed, Fruit/pulp, Aerial parts, Latex, Oil, Smoke, Other"
          value={questionnaire.remedyPartsUsed}
          setter={(v) => setQ("remedyPartsUsed", v)}
        />
        <TextField
          label="How prepared? (describe step-by-step):"
          value={questionnaire.remedyPreparationSteps}
          setter={(v) => setQ("remedyPreparationSteps", v)}
        />
        <TextField
          label="Amount used / How often:"
          value={questionnaire.remedyAmountAndFrequency}
          setter={(v) => setQ("remedyAmountAndFrequency", v)}
        />
        <TextField
          label="Route:"
          placeholder="Drunk, Eaten/chewed, Applied to skin, Inhaled/smoke, Eye/ear/nose, Other"
          value={questionnaire.remedyRoute}
          setter={(v) => setQ("remedyRoute", v)}
        />
        <TextField
          label="Mixed with anything else? No/Yes → what?"
          value={questionnaire.remedyMixtures}
          setter={(v) => setQ("remedyMixtures", v)}
        />
        <TextField
          label="Who advised you? Self/Family/Healer/Other"
          value={questionnaire.remedyAdvisor}
          setter={(v) => setQ("remedyAdvisor", v)}
        />

        <CheckboxGroup
          label="Tick any used"
          options={[
            "Tadjalt / al-kad / lahdedj (Bitter apple; Citrullus colocynthis)",
            "Tourha / kranka (Sodom apple; Calotropis procera)",
            "Elel / defla (Oleander; Nerium oleander)",
            "Afalahlah / bettima (Egyptian henbane; Hyoscyamus muticus subsp. falezlez)",
            "Amateltel / abassi (Ephedra; Ephedra altissima)",
            "Tibérimt / lemmad (Camel grass; Cymbopogon schoenanthus)",
            "Telheret / meriout (Desert horehound; Marrubium deserti)",
            "Aynasnis / ouazouaza (Saharan chamomile; Matricaria pubescens)",
            "Tehenok (Saharan lavender; Lavandula antineae)",
            "Tide n’ tnet / tasselgha (Globularia; Globularia alypum)",
            "Tafellest / rihan (Saharan myrtle; Myrtus nivellei)",
            "Ahiyouf souifa / mkhalkhal (Paronychia; Paronychia arabica)",
            "Enag / assabay (Leptadenia; Leptadenia pyrotechnica)",
            "Ahlewan / danoun (Desert hyacinth; Cistanche tinctoria)",
            "Tadjart / atil (Jujube-tree maerua; Maerua crassifolia)",
            "Tadjalt (Senna/Italian senna; Senna italica)",
            "White wormwood (Artemisia herba-alba) (local name varies)",
            "Other local remedy not listed",
          ]}
          values={keyRemediesTicked}
          setter={setKeyRemediesTicked}
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          G) Medical history (quick safety context)
        </h3>

        <CheckboxGroupWithOther
          label="Do you have any long-term conditions?"
          options={[
            "Diabetes",
            "High blood pressure",
            "Heart disease",
            "Kidney disease",
            "Liver disease",
            "Asthma/COPD",
            "Thyroid disease",
            "Epilepsy/seizures",
            "Stomach ulcer/IBD",
            "None known",
          ]}
          values={longTermConditionsChecklist}
          setter={setLongTermConditionsChecklist}
          otherLabel="Other"
          otherValue={longTermConditionsOther}
          setOtherValue={setLongTermConditionsOther}
          otherPlaceholder="Other: ______________________"
        />

        <TextField
          label="Any recent hospitalisation or serious illness in the last 3 months? No/Yes:"
          value={questionnaire.recentHospitalisation}
          setter={(v) => setQ("recentHospitalisation", v)}
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          H) Clinician/triage notes (optional)
        </h3>

        <CheckboxGroup
          label="Red flags today? (tick)"
          options={[
            "Severe dehydration",
            "Altered mental state",
            "Severe abdominal pain",
            "Blood in stool/urine",
            "Chest pain",
            "Trouble breathing",
            "Seizure/fainting",
            "Pregnancy complications",
          ]}
          values={triageRedFlagsChecklist}
          setter={setTriageRedFlagsChecklist}
        />

        <TextField
          label="Action taken/referral:"
          value={questionnaire.actionTaken}
          setter={(v) => setQ("actionTaken", v)}
        />
      </section>
    </div>
  );
}
