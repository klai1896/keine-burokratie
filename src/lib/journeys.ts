export type JourneyStep = {
  title: string;
  detail?: string;
};

export type OfficialLink = { label: string; href: string };

export type JourneySlug = "registration" | "residence" | "citizenship";

export type Journey = {
  slug: JourneySlug;
  title: string;
  tagline: string;
  intro: string;
  estimatedTime: string;
  documents: string[];
  officialLinks: OfficialLink[];
  steps: JourneyStep[];
  accent: "coral" | "mint" | "lavender";
  emoji: string;
};

export const journeys: Journey[] = [
  {
    slug: "registration",
    title: "Registration (Anmeldung)",
    tagline: "Get your address on the map",
    intro:
      "After you move in, German residence law normally requires you to register your address promptly — often within two weeks. This is the gateway to almost everything else: tax ID, bank account, health insurance.",
    estimatedTime: "1–4 weeks (incl. appointment wait)",
    documents: [
      "Passport / ID",
      "Wohnungsgeberbestätigung",
      "Rental contract",
      "Marriage / birth certs (if applicable)",
    ],
    officialLinks: [
      {
        label: "Berlin.de — Moving to Berlin (registration offices)",
        href: "https://www.berlin.de/en/life/new-in-berlin/744279-8206946-moving-to-berlin-registration-offices.en.html",
      },
      {
        label: "Willkommenszentrum — registration & residence",
        href: "https://willkommenszentrum.berlin.de/en/housing/registration-residence",
      },
      {
        label: "115 — Berlin telephone service",
        href: "https://www.berlin.de/life/telephone-services-and-emergency-services/115/",
      },
    ],
    steps: [
      {
        title: "Bring valid ID or passport for everyone registering",
        detail: "Each household member who's registering needs their own document.",
      },
      {
        title: "Get your Wohnungsgeberbestätigung",
        detail: "Landlord's confirmation of move-in. Required in nearly all cases.",
      },
      {
        title: "Sign your rental or sublet documentation",
        detail: "Confirm what your specific Bürgeramt accepts as proof.",
      },
      {
        title: "Book a Bürgeramt appointment (or eligible online process)",
        detail: "Slots vanish fast — refresh often or use a watcher service.",
      },
      {
        title: "Bring extra civil-status documents if relevant",
        detail: "Marriage / birth certificates with certified translations — confirm with the office.",
      },
      {
        title: "Attend appointment, collect Anmeldebestätigung",
        detail: "You'll receive the registration certificate — keep it safe and digital.",
      },
      {
        title: "Wait for your tax ID by post",
        detail: "Your Steuer-ID arrives within 2–3 weeks at your registered address.",
      },
    ],
    accent: "coral",
    emoji: "🏠",
  },
  {
    slug: "residence",
    title: "Permanent residence",
    tagline: "Settle down for the long run",
    intro:
      "Settlement permits depend on which residence title you currently hold and how long you've held it. Pick the pathway that matches your history to see only the official links that apply to you.",
    estimatedTime: "Varies by pathway (usually after 21–60 months)",
    documents: [
      "Current Aufenthaltstitel",
      "Employment history",
      "Pension contributions",
      "Language certificate",
      "Proof of livelihood",
    ],
    officialLinks: [
      {
        label: "Berlin immigration — permanent residence overview",
        href: "https://www.berlin.de/einwanderung/en/residence/permanent/",
      },
      {
        label: "Service Berlin — service search",
        href: "https://service.berlin.de/",
      },
    ],
    steps: [
      {
        title: "Identify your current residence title",
        detail: "Blue Card, general employment, family, study — each has its own settlement route.",
      },
      {
        title: "List every permit you've held in Germany in order",
        detail: "Settlement often depends on the chain, not just the latest permit.",
      },
      {
        title: "Confirm the minimum residence period for your pathway",
        detail: "Rules change — always verify against the official Service Berlin page.",
      },
      {
        title: "Gather employment and social-insurance evidence",
        detail: "Continuous lawful employment is a common requirement.",
      },
      {
        title: "Prepare language and integration evidence",
        detail: "Level depends on the pathway — confirm what your route requires.",
      },
      {
        title: "Renew your passport early if expiry is near",
        detail: "Appointments can be months out; you don't want to lose a slot.",
      },
      {
        title: "Book the correct Service Berlin appointment",
        detail: "Match the wording on Service Berlin to your specific permit type.",
      },
    ],
    accent: "mint",
    emoji: "🌱",
  },
  {
    slug: "citizenship",
    title: "Citizenship (Naturalisation)",
    tagline: "Become German",
    intro:
      "Citizenship depends on residence history, income, language, integration course completion, and other statutory tests. Berlin routes most applications through Service Berlin plus LEA tooling.",
    estimatedTime: "12–36 months end-to-end",
    documents: [
      "Lawful-residence proof",
      "Language certificate (often B1+)",
      "Income / insurance proof",
      "Criminal record certificate",
      "Passport & renunciation docs",
    ],
    officialLinks: [
      {
        label: "Service Berlin — Citizenship application",
        href: "https://service.berlin.de/dienstleistung/318998",
      },
      {
        label: "Federal questionnaire (orientation)",
        href: "https://www.einbuergerung.de/fragebogen.php",
      },
      {
        label: "Service Berlin — Einbürgerungstest registration",
        href: "https://service.berlin.de/dienstleistung/351180/",
      },
    ],
    steps: [
      {
        title: "Run the federal orientation questionnaire",
        detail: "It checks the basic eligibility surface so you don't book the wrong service.",
      },
      {
        title: "Confirm lawful habitual residence for the required period",
        detail: "The minimum period varies by personal circumstances.",
      },
      {
        title: "Gather stable livelihood and insurance evidence",
        detail: "Employment, freelance, or family-supported — all need proof.",
      },
      {
        title: "Get your language certificate (often B1+)",
        detail: "telc Deutsch B1 or Goethe B1 are widely accepted.",
      },
      {
        title: "Book the Einbürgerungstest at a Berlin VHS",
        detail: "Slots are scarce — use the watcher tool to get notified.",
      },
      {
        title: "Pull your criminal-record certificates",
        detail: "Both Berlin Meldeamt and federal where applicable.",
      },
      {
        title: "Prepare passport / renunciation paperwork",
        detail: "Steps depend on whether your origin allows dual citizenship.",
      },
      {
        title: "Submit through Service Berlin / LEA",
        detail: "Then expect months of waiting — track your case via the issued reference.",
      },
    ],
    accent: "lavender",
    emoji: "🇩🇪",
  },
];

export const journeyPath: Record<JourneySlug, string> = {
  registration: "/registration",
  residence: "/permanent-residence",
  citizenship: "/citizenship",
};

export function getJourney(slug: string): Journey | undefined {
  return journeys.find((j) => j.slug === slug);
}
