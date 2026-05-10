export type OfficialLink = { label: string; href: string };

/** Stable id maps to persisted checkbox keys in Postgres + local fallback. */
export type PermanentResidenceChecklistItem = {
  id: string;
  label: string;
  detail?: string;
  links?: OfficialLink[];
};

export type PermanentResidencePathway = {
  id: string;
  title: string;
  summary: string;
  officialLinks: OfficialLink[];
  checklist: PermanentResidenceChecklistItem[];
};

/** Official sources named in checklist items — verify URLs before production. */
const DRV_INFO_EN: OfficialLink = {
  label: "DRV — insurance account, contributions & pension information (English)",
  href: "https://www.deutsche-rentenversicherung.de/DRV/EN/Versicherung/versicherung_node.html",
};

const DRV_FORMS_EN: OfficialLink = {
  label: "DRV — service, forms & requesting your insurance record (English)",
  href: "https://www.deutsche-rentenversicherung.de/DRV/EN/Service/service_en.html",
};

const SV_FREQUENT_QUESTIONS_DE: OfficialLink = {
  label: "Government overview — statutory pension insurance (German)",
  href: "https://www.bmas.de/EN/Our-Topics/Pension/compulsoryinsured.html",
};

/** Orientation only — verify lists against your Service Berlin / Berlin.de PDF checklist before filing. */
export const permanentResidencePathways: PermanentResidencePathway[] = [
  {
    id: "blue_card",
    title: "EU Blue Card → settlement permit",
    summary:
      "For applicants who held an EU Blue Card and now seek a settlement permit under the Blue Card route. Requirements differ by months held, employment continuity, pensions, insurance, and language — always match the wording on Service Berlin.",
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
      {
        id: "blue_card_identity",
        label: "Valid passport(s) / travel document for everyone included in the application.",
        detail:
          "Check remaining validity versus your appointment slot; renew early if expiry is inside the adjudication horizon.",
      },
      {
        id: "blue_card_current_permit",
        label: "Current residence permit card (Aufenthaltstitel) and every prior permit in chronological order.",
        detail: "Officers often reconstruct your lawful residence chain.",
      },
      {
        id: "blue_card_meldebescheinigung",
        label: "Current registration certificate (Meldebescheinigung) proving your Berlin address.",
      },
      {
        id: "blue_card_photo_biometric",
        label: "Up-to-date biometric photos if your service page still lists them separately from the residence card format.",
      },
      {
        id: "blue_card_employment_contract",
        label: "Employment contracts (current and, if requested, historical) showing role, salary, and continuity.",
        detail: "If you switched employers, compile a chronological folder with termination / joining dates.",
      },
      {
        id: "blue_card_employer_letter",
        label: "Current employer statement / Arbeitgeberbestätigung (signed, on letterhead when possible).",
        detail: "Some forms ask for foreseeable continued employment — align wording with the official template.",
      },
      {
        id: "blue_card_payslips",
        label: "Recent pay slips / Gehaltsabrechnungen (usually the last 6–12 months unless the checklist states otherwise).",
      },
      {
        id: "blue_card_steuerklassennachweis",
        label: "Tax documents if required (e.g. income tax notices / summaries the service lists for salary verification).",
        detail: "Only submit what the checklist explicitly mentions for your pathway.",
      },
      {
        id: "blue_card_health_insurance",
        label: "Statutory OR private health insurance proof ( Mitgliedsbescheinigung / comparable certificate).",
        detail: "Show uninterrupted coverage overlapping the qualifying residence period.",
        links: [
          {
            label: "EURAXESS — orientation on German health coverage (scientific migrant hub)",
            href: "https://www.euraxess.de/en/germany/guide/health-care",
          },
        ],
      },
      {
        id: "blue_card_social_snapshots",
        label: "Social insurance snapshot from your payroll provider — rentenrechtliche Vorabinfo / Beitragsnachweis if offered.",
        detail:
          "This is separate from the DRV pension record: it evidences mandatory contributions withheld by your employer today.",
      },
      {
        id: "blue_card_drv_record",
        label: "German pension insurance history (Versicherungsverlauf / Renteninformation) from Deutsche Rentenversicherung.",
        detail:
          "Order digitally or by post. Keep PDFs chronological; translations only if explicitly asked for settlement (usually not needed for statutory German records presented in German).",
        links: [DRV_FORMS_EN, DRV_INFO_EN, SV_FREQUENT_QUESTIONS_DE],
      },
      {
        id: "blue_card_foreign_pension_proof",
        label: "If you accrued pension abroad: foreign pension statements or entitlement letters cited on the checklist.",
      },
      {
        id: "blue_card_language",
        label: "Language certificate at the grade your settlement route cites (often B1; confirm on Service Berlin).",
      },
      {
        id: "blue_card_integration",
        label: "Integration course certificates (orientation / language tests) if still mandatory end-to-end.",
      },
      {
        id: "blue_card_appointment_proof",
        label: "Printout of booked Service Berlin appointment or confirmation emails for postal submission bundles.",
      },
    ],
  },
  {
    id: "general_employment",
    title: "General employment → settlement permit",
    summary:
      "For skilled workers settling without (or beyond) EU Blue Card parameters. Officials split employment proofs, statutory insurance artefacts, pension ledgers, and livelihood evidence — mirror the wording on Service Berlin §121864 and linked PDFs.",
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
      {
        id: "gen_perm_chain",
        label: "Chronological list of residence titles issued in Germany (scan front/back of cards).",
      },
      {
        id: "gen_identity_registration",
        label: "Passports + current Berlin Meldebescheinigung.",
      },
      {
        id: "gen_current_job_contract",
        label: "Current employment contract with salary, weekly hours, and employer details.",
      },
      {
        id: "gen_prior_job_evidence",
        label: "Prior employment evidence for every role within the qualifying window (contracts + reference letters if needed).",
      },
      {
        id: "gen_employer_statements",
        label: "Employer confirmations / Arbeitsbescheinigungen for each relevant stretch of employment.",
      },
      {
        id: "gen_payroll_trail",
        label: "Pay slips covering the months the checklist names (keep PDFs grouped by employer).",
      },
      {
        id: "gen_social_insurance_statements",
        label: "Social insurance statements from employers (Beitragsnachweise / Sozialversicherungsmeldungen).",
        detail: "Shows health, pension, unemployment, and care contributions without bundling them into one payroll PDF.",
      },
      {
        id: "gen_health_insurance_membership",
        label: "Health insurance membership certificates proving continuous coverage.",
      },
      {
        id: "gen_pension_drv",
        label: "Deutsche Rentenversicherung insurance record + Renteninformation / contribution statement.",
        detail:
          "These documents prove mandatory pension payments; order them before your appointment so mail delays do not block you.",
        links: [DRV_FORMS_EN, DRV_INFO_EN],
      },
      {
        id: "gen_tax_docs",
        label: "Tax assessment notices or employer annual statements if the PDF asks for income verification beyond pay slips.",
      },
      {
        id: "gen_livelihood_housing",
        label: "Proof of adequate housing / rent contract + landlord confirmation if still requested for your category.",
      },
      {
        id: "gen_language_integration",
        label: "Language + integration evidence at the level listed for your exact permit track.",
      },
      {
        id: "gen_certified_translations",
        label: "Certified translations for any foreign documents explicitly requested on the official list.",
      },
      {
        id: "gen_fee_payment",
        label: "Proof of paid fees (if you must pay before the appointment, keep the receipt).",
      },
    ],
  },
  {
    id: "family",
    title: "Family reunification / spouse route",
    summary:
      "Settlement tied to family residence titles needs civil-status documents, joint livelihood proof, and often separate insurance / pension snapshots for both adults.",
    officialLinks: [
      {
        label: "Berlin immigration — residence for family reasons",
        href: "https://www.berlin.de/einwanderung/en/residence/family/",
      },
      {
        label: "Permanent residence overview (match the family variant stated on Service Berlin)",
        href: "https://www.berlin.de/einwanderung/en/residence/permanent/",
      },
    ],
    checklist: [
      {
        id: "family_relationship_docs",
        label: "Marriage / partnership certificates with apostille or legalisation if issued abroad + certified translations.",
      },
      {
        id: "family_partner_status",
        label: "Proof of sponsor’s entitlement (citizenship or permit) underpinning family residence.",
      },
      {
        id: "family_household_registry",
        label: "Registration certificates showing cohabitation and consistent addresses.",
      },
      {
        id: "family_employment_sponsor",
        label: "Sponsor employment bundle: contracts, employer letters, payslips, and statutory insurance confirmations.",
      },
      {
        id: "family_employment_applicant",
        label: "If you work: replicate the employment versus social-insurance split for yourself (contracts vs SV-nachweise).",
      },
      {
        id: "family_health_both",
        label: "Health insurance certificates for both partners (where applicable).",
      },
      {
        id: "family_pension_records",
        label: "Pension ledger from Deutsche Rentenversicherung for every adult accruing statutory pension.",
        links: [DRV_FORMS_EN, DRV_INFO_EN],
      },
      {
        id: "family_language",
        label: "Language evidence if the checklist still references B1-equivalent attainment for minors or adults.",
      },
      {
        id: "family_child_docs",
        label: "Birth certificates + custody documents where children lodge in the filing.",
      },
      {
        id: "family_appointment_bundle",
        label: "Service Berlin confirmation for the **family-settlement-specific** service number you were instructed to pick.",
      },
    ],
  },
  {
    id: "studies_qualification",
    title: "Studies / qualification in Germany",
    summary:
      "Graduates bridging from study permits into skilled employment often must show qualification recognition, bridging employment contracts, contribution histories, and sometimes accelerated residence logic.",
    officialLinks: [
      {
        label: "Berlin immigration — residence for study & research training",
        href: "https://www.berlin.de/einwanderung/en/residence/study-research-training/",
      },
      {
        label: "Permanent residence overview",
        href: "https://www.berlin.de/einwanderung/en/residence/permanent/",
      },
    ],
    checklist: [
      {
        id: "study_degree_cert",
        label: "Final degree certificates (transcripts + Diploma Supplement if available).",
      },
      {
        id: "study_recognition_zab",
        label: "Anabin / recognition letters if Berlin asked you to formalise foreign pre-study schooling.",
      },
      {
        id: "study_qualified_job_proof",
        label: "Employment tied to qualification: contracts, JD descriptions, payslips, and bridging letters from HR.",
      },
      {
        id: "study_social_vs_employment_split",
        label: "Separate folders for **employment continuity** versus **German social-insurance artefacts**.",
      },
      {
        id: "study_drv_proof",
        label: "Deutsche Rentenversicherung record covering student jobs + post-grad employment.",
        links: [DRV_FORMS_EN, DRV_INFO_EN],
      },
      {
        id: "study_health_cover",
        label: "Health insurance proofs across study + employed phases without gaps.",
      },
      {
        id: "study_language_integration",
        label: "Language / integration artefacts still referenced on Service Berlin.",
      },
      {
        id: "study_service_proof",
        label: "Printouts showing you booked the **qualified professional graduate** wording if Berlin splits appointment types.",
      },
    ],
  },
  {
    id: "other",
    title: "Other or not sure yet",
    summary:
      "If you cannot map to a pathway, assemble a neutral evidence pack and escalate through official counselling before paying for third-party services.",
    officialLinks: [
      {
        label: "Permanent residence overview (Berlin.de)",
        href: "https://www.berlin.de/einwanderung/en/residence/permanent/",
      },
      {
        label: "Service Berlin — service search",
        href: "https://service.berlin.de/",
      },
    ],
    checklist: [
      {
        id: "other_permit_timeline",
        label: "Write every Aufenthaltstitel you ever held in Germany with issue / expiry dates.",
      },
      {
        id: "other_identity_baseline",
        label: "Passport, registration, and biometrics package ready for copiable scans.",
      },
      {
        id: "other_employment_folder",
        label: "If any employment exists: split **contracts & references** from **SV + pension PDFs** even before you know the final route.",
        links: [DRV_INFO_EN],
      },
      {
        id: "other_language_insurance",
        label: "Health + language evidence at whatever minimum you can already prove today.",
      },
      {
        id: "other_counselling",
        label: "Book Willkommenszentrum / official hotline slot and bring the folder above for triage.",
        links: [
          {
            label: "Willkommenszentrum Berlin",
            href: "https://willkommenszentrum.berlin.de/",
          },
        ],
      },
    ],
  },
];

export function getPathwayById(id: string): PermanentResidencePathway | undefined {
  return permanentResidencePathways.find((p) => p.id === id);
}

export function getPathwayChecklistIds(pathwayId: string): Set<string> {
  const p = getPathwayById(pathwayId);
  return new Set(p?.checklist.map((c) => c.id) ?? []);
}
