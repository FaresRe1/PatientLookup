"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  TextField,
  RadioGroup,
  CheckboxGroup,
  CheckboxGroupWithOther,
} from "./QuestionTemplates";

export type RadiationDataV1 = {
  questionnaire: {
    lifestyle: string;
    winterStay: string;
    summerStay: string;

    wellStatus: string;
    wellsClosed: string;

    sandstormsFrequency: string;
    washAfterStorms: string;

    scrapStoredInside: string;
    scrapSource: string;

    illnessAge: string;
    repeatedIllnesses: string;

    toldAvoidPlaces: string;
    areasClosed: string;

    waterDrinkMost: string[];
    waterDrinkMostOther: string;
    wellsNear: string[];
  };

  movementPlaces: string[];
  afterStormFeels: string[];
  scrapUses: string[];
  seenSigns: string[];
  familyHealth: string[];
  animalIssues: string[];
  animalGrazeNear: string[];
  eldersRemember: string[];
  dangerousFor: string[];
  wouldAgreeTo: string[];
};

export default function RadiationQuestionnaire({
  questionnaire: questionnaireProp,
  setQ: setQProp,

  movementPlaces: movementPlacesProp,
  setMovementPlaces: setMovementPlacesProp,

  afterStormFeels: afterStormFeelsProp,
  setAfterStormFeels: setAfterStormFeelsProp,

  scrapUses: scrapUsesProp,
  setScrapUses: setScrapUsesProp,

  seenSigns: seenSignsProp,
  setSeenSigns: setSeenSignsProp,

  familyHealth: familyHealthProp,
  setFamilyHealth: setFamilyHealthProp,

  animalIssues: animalIssuesProp,
  setAnimalIssues: setAnimalIssuesProp,

  animalGrazeNear: animalGrazeNearProp,
  setAnimalGrazeNear: setAnimalGrazeNearProp,

  eldersRemember: eldersRememberProp,
  setEldersRemember: setEldersRememberProp,

  dangerousFor: dangerousForProp,
  setDangerousFor: setDangerousForProp,

  wouldAgreeTo: wouldAgreeToProp,
  setWouldAgreeTo: setWouldAgreeToProp,

  onUpdate,
}: {
  questionnaire?: any;
  setQ?: (key: string, value: any) => void;

  movementPlaces?: string[];
  setMovementPlaces?: (v: string[]) => void;

  afterStormFeels?: string[];
  setAfterStormFeels?: (v: string[]) => void;

  scrapUses?: string[];
  setScrapUses?: (v: string[]) => void;

  seenSigns?: string[];
  setSeenSigns?: (v: string[]) => void;

  familyHealth?: string[];
  setFamilyHealth?: (v: string[]) => void;

  animalIssues?: string[];
  setAnimalIssues?: (v: string[]) => void;

  animalGrazeNear?: string[];
  setAnimalGrazeNear?: (v: string[]) => void;

  eldersRemember?: string[];
  setEldersRemember?: (v: string[]) => void;

  dangerousFor?: string[];
  setDangerousFor?: (v: string[]) => void;

  wouldAgreeTo?: string[];
  setWouldAgreeTo?: (v: string[]) => void;

  onUpdate?: (payload: RadiationDataV1) => void;
} = {}) {
  const [questionnaireLocal, setQuestionnaireLocal] = useState({
    lifestyle: "",
    winterStay: "",
    summerStay: "",

    waterDrinkMost: [] as string[],
    waterDrinkMostOther: "",
    wellStatus: "",
    wellsNear: [] as string[],
    wellsClosed: "",

    sandstormsFrequency: "",
    washAfterStorms: "",

    scrapStoredInside: "",
    scrapSource: "",

    illnessAge: "",
    repeatedIllnesses: "",

    toldAvoidPlaces: "",
    areasClosed: "",
  });

  const [movementPlacesLocal, setMovementPlacesLocal] = useState<string[]>([]);
  const [afterStormFeelsLocal, setAfterStormFeelsLocal] = useState<string[]>(
    [],
  );
  const [scrapUsesLocal, setScrapUsesLocal] = useState<string[]>([]);
  const [seenSignsLocal, setSeenSignsLocal] = useState<string[]>([]);
  const [familyHealthLocal, setFamilyHealthLocal] = useState<string[]>([]);
  const [animalIssuesLocal, setAnimalIssuesLocal] = useState<string[]>([]);
  const [animalGrazeNearLocal, setAnimalGrazeNearLocal] = useState<string[]>(
    [],
  );
  const [eldersRememberLocal, setEldersRememberLocal] = useState<string[]>([]);
  const [dangerousForLocal, setDangerousForLocal] = useState<string[]>([]);
  const [wouldAgreeToLocal, setWouldAgreeToLocal] = useState<string[]>([]);

  const questionnaire = questionnaireProp ?? questionnaireLocal;

  const setQ =
    setQProp ??
    ((key: string, value: any) =>
      setQuestionnaireLocal((prev) => ({ ...prev, [key]: value })));

  const movementPlaces = movementPlacesProp ?? movementPlacesLocal;
  const setMovementPlaces = setMovementPlacesProp ?? setMovementPlacesLocal;

  const afterStormFeels = afterStormFeelsProp ?? afterStormFeelsLocal;
  const setAfterStormFeels = setAfterStormFeelsProp ?? setAfterStormFeelsLocal;

  const scrapUses = scrapUsesProp ?? scrapUsesLocal;
  const setScrapUses = setScrapUsesProp ?? setScrapUsesLocal;

  const seenSigns = seenSignsProp ?? seenSignsLocal;
  const setSeenSigns = setSeenSignsProp ?? setSeenSignsLocal;

  const familyHealth = familyHealthProp ?? familyHealthLocal;
  const setFamilyHealth = setFamilyHealthProp ?? setFamilyHealthLocal;

  const animalIssues = animalIssuesProp ?? animalIssuesLocal;
  const setAnimalIssues = setAnimalIssuesProp ?? setAnimalIssuesLocal;

  const animalGrazeNear = animalGrazeNearProp ?? animalGrazeNearLocal;
  const setAnimalGrazeNear = setAnimalGrazeNearProp ?? setAnimalGrazeNearLocal;

  const eldersRemember = eldersRememberProp ?? eldersRememberLocal;
  const setEldersRemember = setEldersRememberProp ?? setEldersRememberLocal;

  const dangerousFor = dangerousForProp ?? dangerousForLocal;
  const setDangerousFor = setDangerousForProp ?? setDangerousForLocal;

  const wouldAgreeTo = wouldAgreeToProp ?? wouldAgreeToLocal;
  const setWouldAgreeTo = setWouldAgreeToProp ?? setWouldAgreeToLocal;

  const waterDrinkMost: string[] =
    questionnaireProp?.waterDrinkMost ?? questionnaireLocal.waterDrinkMost;
  const setWaterDrinkMost = (v: string[]) => setQ("waterDrinkMost", v);

  const waterDrinkMostOther: string =
    questionnaireProp?.waterDrinkMostOther ??
    questionnaireLocal.waterDrinkMostOther;
  const setWaterDrinkMostOther = (v: string) => setQ("waterDrinkMostOther", v);

  const wellsNear: string[] =
    questionnaireProp?.wellsNear ?? questionnaireLocal.wellsNear;
  const setWellsNear = (v: string[]) => setQ("wellsNear", v);

  const payload: RadiationDataV1 = useMemo(() => {
    return {
      questionnaire: {
        lifestyle: questionnaire.lifestyle ?? "",
        winterStay: questionnaire.winterStay ?? "",
        summerStay: questionnaire.summerStay ?? "",

        wellStatus: questionnaire.wellStatus ?? "",
        wellsClosed: questionnaire.wellsClosed ?? "",

        sandstormsFrequency: questionnaire.sandstormsFrequency ?? "",
        washAfterStorms: questionnaire.washAfterStorms ?? "",

        scrapStoredInside: questionnaire.scrapStoredInside ?? "",
        scrapSource: questionnaire.scrapSource ?? "",

        illnessAge: questionnaire.illnessAge ?? "",
        repeatedIllnesses: questionnaire.repeatedIllnesses ?? "",

        toldAvoidPlaces: questionnaire.toldAvoidPlaces ?? "",
        areasClosed: questionnaire.areasClosed ?? "",

        waterDrinkMost: waterDrinkMost ?? [],
        waterDrinkMostOther: waterDrinkMostOther ?? "",
        wellsNear: wellsNear ?? [],
      },

      movementPlaces: movementPlaces ?? [],
      afterStormFeels: afterStormFeels ?? [],
      scrapUses: scrapUses ?? [],
      seenSigns: seenSigns ?? [],
      familyHealth: familyHealth ?? [],
      animalIssues: animalIssues ?? [],
      animalGrazeNear: animalGrazeNear ?? [],
      eldersRemember: eldersRemember ?? [],
      dangerousFor: dangerousFor ?? [],
      wouldAgreeTo: wouldAgreeTo ?? [],
    };
  }, [
    questionnaire,
    waterDrinkMost,
    waterDrinkMostOther,
    wellsNear,
    movementPlaces,
    afterStormFeels,
    scrapUses,
    seenSigns,
    familyHealth,
    animalIssues,
    animalGrazeNear,
    eldersRemember,
    dangerousFor,
    wouldAgreeTo,
  ]);

  useEffect(() => {
    onUpdate?.(payload);
  }, [payload, onUpdate]);

  return (
    <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-8 space-y-10">
      <h2 className="text-xl font-black text-gray-800">
        Radiation Questionnaire
      </h2>

      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          Section 1 – Identity and Movement
        </h3>

        <RadioGroup
          label="Are you:"
          options={["Nomadic", "Semi-nomadic", "Settled"]}
          value={questionnaire.lifestyle}
          setter={(v: string) => setQ("lifestyle", v)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="Where do you usually stay: Winter:"
            value={questionnaire.winterStay}
            setter={(v: string) => setQ("winterStay", v)}
            placeholder="__________________"
          />
          <TextField
            label="Where do you usually stay: Summer:"
            value={questionnaire.summerStay}
            setter={(v: string) => setQ("summerStay", v)}
            placeholder="__________________"
          />
        </div>

        <CheckboxGroup
          label="Do you pass near these places in your yearly movement?"
          options={[
            "In Ekker / Hoggar tunnels",
            "Old French military sites",
            "Abandoned camps or sealed mountains",
            "Reggane area",
            "Not sure",
          ]}
          values={movementPlaces}
          setter={setMovementPlaces}
        />
      </section>

      {/* Section 2 – Water */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">Section 2 – Water</h3>

        <CheckboxGroupWithOther
          label="What water do you drink most?"
          options={["Well", "Spring", "Stored water"]}
          values={waterDrinkMost}
          setter={setWaterDrinkMost}
          otherLabel="Other"
          otherValue={waterDrinkMostOther}
          setOtherValue={setWaterDrinkMostOther}
          otherPlaceholder="__________"
        />

        <RadioGroup
          label="Is the well:"
          options={["Covered", "Open", "Sometimes covered"]}
          value={questionnaire.wellStatus}
          setter={(v: string) => setQ("wellStatus", v)}
        />

        <CheckboxGroup
          label="Do you or your animals drink from wells near:"
          options={[
            "Mountains with tunnels",
            "Old military areas",
            "Places with abandoned metal",
            "I don’t know",
          ]}
          values={wellsNear}
          setter={setWellsNear}
        />

        <RadioGroup
          label="Have any wells in your area ever been closed or avoided?"
          options={["Yes", "No", "Not sure"]}
          value={questionnaire.wellsClosed}
          setter={(v: string) => setQ("wellsClosed", v)}
        />
      </section>

      {/* Section 3 – Sand, Wind, and Dust */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          Section 3 – Sand, Wind, and Dust
        </h3>

        <RadioGroup
          label="Do strong sandstorms pass through your living areas?"
          options={["Often", "Sometimes", "Rarely"]}
          value={questionnaire.sandstormsFrequency}
          setter={(v: string) => setQ("sandstormsFrequency", v)}
        />

        <CheckboxGroup
          label="After sandstorms, do people feel:"
          options={[
            "Eye pain",
            "Skin irritation",
            "Breathing difficulty",
            "Metallic taste",
            "Nothing special",
          ]}
          values={afterStormFeels}
          setter={setAfterStormFeels}
        />

        <RadioGroup
          label="Do you wash face and hands after storms?"
          options={["Always", "Sometimes", "Never"]}
          value={questionnaire.washAfterStorms}
          setter={(v: string) => setQ("washAfterStorms", v)}
        />
      </section>

      {/* Section 4 – Scrap Metal & Rocks */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          Section 4 – Scrap Metal & Rocks
        </h3>

        <CheckboxGroup
          label="Do people in your family use scrap metal for:"
          options={[
            "Fences",
            "Tents",
            "Roofs",
            "Water containers",
            "Cooking",
            "None",
          ]}
          values={scrapUses}
          setter={setScrapUses}
        />

        <RadioGroup
          label="Is scrap stored inside living tents?"
          options={["Yes", "No"]}
          value={questionnaire.scrapStoredInside}
          setter={(v: string) => setQ("scrapStoredInside", v)}
        />

        <RadioGroup
          label="Do you know where the scrap comes from?"
          options={["Old military places", "Market", "Desert", "Not sure"]}
          value={questionnaire.scrapSource}
          setter={(v: string) => setQ("scrapSource", v)}
        />

        <CheckboxGroup
          label="Have you seen:"
          options={[
            "Strange melted rocks",
            "Sealed tunnel doors",
            "Warning signs",
            "Burned metal",
            "None",
          ]}
          values={seenSigns}
          setter={setSeenSigns}
        />
      </section>

      {/* Section 5 – Health (Family) */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          Section 5 – Health (Family)
        </h3>

        <CheckboxGroup
          label="In your family, has anyone had:"
          options={[
            "Cancer",
            "Repeated miscarriages",
            "Children born with deformities",
            "Infertility",
            "Blindness or cataracts",
            "Skin diseases that don’t heal",
            "None known",
          ]}
          values={familyHealth}
          setter={setFamilyHealth}
        />

        <RadioGroup
          label="At what age do serious illnesses usually appear?"
          options={["Child", "Young adult", "Middle age", "Old age"]}
          value={questionnaire.illnessAge}
          setter={(v: string) => setQ("illnessAge", v)}
        />

        <RadioGroup
          label="Are some illnesses repeated in the same families?"
          options={["Yes", "No", "Not sure"]}
          value={questionnaire.repeatedIllnesses}
          setter={(v: string) => setQ("repeatedIllnesses", v)}
        />
      </section>

      {/* Section 6 – Animals */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">Section 6 – Animals</h3>

        <CheckboxGroup
          label="Have your animals ever had:"
          options={[
            "Blindness",
            "Deformed newborns",
            "Many miscarriages",
            "Sudden deaths",
            "Tumors",
            "None",
          ]}
          values={animalIssues}
          setter={setAnimalIssues}
        />

        <CheckboxGroup
          label="Do animals graze near:"
          options={[
            "Tunnel mountains",
            "Military ruins",
            "Scrap areas",
            "Wells near these sites",
          ]}
          values={animalGrazeNear}
          setter={setAnimalGrazeNear}
        />
      </section>

      {/* Section 7 – Memory of the Tests */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          Section 7 – Memory of the Tests
        </h3>

        <CheckboxGroup
          label="Do elders remember:"
          options={[
            "A very bright light",
            "A loud explosion",
            "The ground shaking",
            "Sudden sickness after",
            "Temporary blindness",
            "Nothing",
          ]}
          values={eldersRemember}
          setter={setEldersRemember}
        />

        <RadioGroup
          label="Were people ever told to avoid certain places?"
          options={["Yes", "No", "Not sure"]}
          value={questionnaire.toldAvoidPlaces}
          setter={(v: string) => setQ("toldAvoidPlaces", v)}
        />

        <RadioGroup
          label="Were any areas closed by soldiers without explanation?"
          options={["Yes", "No", "Not sure"]}
          value={questionnaire.areasClosed}
          setter={(v: string) => setQ("areasClosed", v)}
        />
      </section>

      {/* Section 8 – Protection & Needs */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-700">
          Section 8 – Protection & Needs
        </h3>

        <CheckboxGroup
          label="Do you think some places are dangerous for:"
          options={["Children", "Pregnant women", "Animals", "Everyone", "No"]}
          values={dangerousFor}
          setter={setDangerousFor}
        />

        <CheckboxGroup
          label="Would you agree to:"
          options={[
            "Testing water",
            "Testing soil",
            "Marking dangerous zones",
            "Health check programs",
            "Sharing family health history",
          ]}
          values={wouldAgreeTo}
          setter={setWouldAgreeTo}
        />
      </section>
    </div>
  );
}
