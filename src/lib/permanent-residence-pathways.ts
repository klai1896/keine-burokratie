export type PermanentResidencePathway = {
  id: string;
  title: string;
  summary: string;
  officialLinks: { label: string; href: string }[];
  checklist: string[];
};

/** Orientation only — verify every link and requirement on Berlin.de / Service Berlin before acting. */
export const permanentResidencePathways: PermanentResidencePathway[] = [
  {
    id: "blue_card",
    title: "EU Blue Card → settlement permit",
    summary:
      "For people who hold (or held) an EU Blue Card and meet the residence and employment conditions for a settlement permit linked to that pathway.",
    officialLinks: [
      {
        label: "Permanent settlement permit for EU Blue Card holders (Service Berlin)",
        href: "https://service.berlin.de/dienstleistung/326556/standort/121885/en/",
      },
      {
        label: "Berlin immigration — permanent residence overview",
        href: "https://www.berlin.de/einwanderung/en/residence/permanent/",
      },
    ],
    checklist: [
      "Confirm you meet the minimum residence period for the Blue Card settlement route (rules change — use the official service page).",
      "Gather proof of continuous lawful employment and social insurance as required for your case.",
      "Prepare language evidence if your pathway still mandates it at application time.",
      "Check pension / retirement contribution evidence requirements on the official checklist.",
      "Book the correct Service Berlin appointment or use the offered online flow for your permit type.",
      "Renew your passport early if the appointment is months away.",
    ],
  },
  {
    id: "general_employment",
    title: "General employment → settlement permit",
    summary:
      "Skilled employment routes that are not (or not only) the EU Blue Card — requirements differ by prior permit and timeline.",
    officialLinks: [
      {
        label: "Permanent settlement permit — general (Service Berlin)",
        href: "https://service.berlin.de/dienstleistung/121864/en/",
      },
      {
        label: "Berlin immigration — permanent residence overview",
        href: "https://www.berlin.de/einwanderung/en/residence/permanent/",
      },
    ],
    checklist: [
      "Identify your current residence title and the exact settlement service that matches it.",
      "Collect employment history, contracts, and social insurance evidence as listed for your route.",
      "Prepare language and integration evidence if required (level depends on pathway).",
      "Confirm any ‘priority’ or salary thresholds that apply to your historical permits.",
      "Book or submit through the official channel for your permit type before documents expire.",
    ],
  },
  {
    id: "family",
    title: "Family reunification / spouse route",
    summary:
      "Settlement after family reunification depends on the joining family member’s status and time in Germany — follow the family residence section first.",
    officialLinks: [
      {
        label: "Berlin immigration — residence for family reasons",
        href: "https://www.berlin.de/einwanderung/en/residence/family/",
      },
      {
        label: "Permanent residence overview (find the family-related path that applies)",
        href: "https://www.berlin.de/einwanderung/en/residence/permanent/",
      },
    ],
    checklist: [
      "Confirm which family-based permit you hold and the years-of-residence rules that apply.",
      "Collect marriage / partnership documents and translations if authorities require them.",
      "Gather livelihood and housing suitability evidence where the checklist asks for it.",
      "Book through the Berlin service that matches **family settlement**, not only generic employment settlement.",
      "Renew passports for all applicants if expiry dates threaten the appointment window.",
    ],
  },
  {
    id: "studies_qualification",
    title: "Studies / qualification in Germany",
    summary:
      "Graduates and some qualification holders may have a distinct path to settlement — start from Berlin’s study‑related residence pages.",
    officialLinks: [
      {
        label: "Berlin immigration — residence for study purposes",
        href: "https://www.berlin.de/einwanderung/en/residence/study-research-training/",
      },
      {
        label: "Permanent residence overview",
        href: "https://www.berlin.de/einwanderung/en/residence/permanent/",
      },
    ],
    checklist: [
      "Confirm whether you moved from a study permit into skilled employment — the settlement checklist differs.",
      "Collect your degree certificates, APS or recognition outcomes if authorities requested them.",
      "Prepare employment evidence after your studies if you are now on a work-linked title.",
      "Check whether shorter residence periods apply for graduates in qualified jobs (verify on official pages).",
      "Choose the appointment type that mentions **qualified professional** / **studies-related** wording if split on Service Berlin.",
    ],
  },
  {
    id: "other",
    title: "Other or not sure yet",
    summary:
      "When you cannot map yourself to a single route, start from Berlin’s overview and the questionnaire-style flows on Service Berlin.",
    officialLinks: [
      {
        label: "Permanent residence overview (Berlin.de)",
        href: "https://www.berlin.de/einwanderung/en/residence/permanent/",
      },
      {
        label: "Service Berlin — search services (switch to English in header if available)",
        href: "https://service.berlin.de/",
      },
    ],
    checklist: [
      "Write down your current Aufenthaltstitel type and expiry date.",
      "List every permit you have held in Germany in order — settlement often depends on the chain.",
      "Use official questionnaires or hotlines before paying for third-party advice.",
      "Collect identity, registration (Anmeldung), and insurance proof as a baseline bundle.",
      "Book a general counseling slot (e.g. welcome centre / official migration desk) if you are uncertain which service applies.",
    ],
  },
];
