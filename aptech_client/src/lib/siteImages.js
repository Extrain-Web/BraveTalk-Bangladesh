"use client";

import { useSettings } from "@/context/SettingsContext";

// Every photo on the public pages comes from one of these slots.
// Admin → Settings → "Site Images" can upload a replacement for any slot
// (stored in settings.siteImages[key]); until then the default photo is used.
// Defaults are free Unsplash photos (https://unsplash.com/license).
const u = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

export const SITE_IMAGE_SLOTS = [
    { key: "heroImage", page: "Home", label: "Home hero photo", hint: "Speaker / class photo next to the headline (landscape, ~1600×1100)", def: u("1556761175-5973dc0f32e7") },
    { key: "homeOnline", page: "Home", label: "Online class photo", hint: "Learning formats section", def: u("1588196749597-9ff075ee6b5b", 900) },
    { key: "homeInPerson", page: "Home", label: "In-person class photo", hint: "Learning formats section", def: u("1517048676732-d65bc937f952", 900) },
    { key: "homeRecorded", page: "Home", label: "Recorded course photo", hint: "Learning formats section", def: u("1491975474562-1f4e30bc9468", 900) },
    { key: "homeSpeaking", page: "Home", label: "Public speaking photo", hint: "Learning formats section", def: u("1475721027785-f74eccf877e2", 900) },
    { key: "whyImage", page: "Home", label: "Why BraveTalk photo", hint: "Next to the benefits list", def: u("1543269865-cbf427effbad", 1200) },
    { key: "ctaImage", page: "Home / About", label: "Call-to-action background", hint: "Wide photo behind the dark banner", def: u("1529070538774-1843cb3265df") },
    { key: "aboutHero", page: "About", label: "About page banner", hint: "Wide banner at the top of About", def: u("1515187029135-18ee286d815b") },
    { key: "aboutStory", page: "About", label: "Our story photo", hint: "Next to the story text", def: u("1523240795612-9a054b0db644", 1200) },
    { key: "aboutClass", page: "About", label: "Classroom photo", hint: "How learning works section", def: u("1524178232363-1fb2b075b655", 1200) },
    { key: "coursesBanner", page: "Courses", label: "Courses page banner", hint: "Wide banner at the top of Courses", def: u("1475721027785-f74eccf877e2") },
    { key: "booksBanner", page: "Books", label: "Books page banner", hint: "Wide banner at the top of Books", def: u("1427504494785-3a9ca7044f45") },
    { key: "mentorsBanner", page: "Mentors", label: "Mentors page banner", hint: "Wide banner at the top of Mentors", def: u("1552664730-d307ca884978") },
    { key: "blogBanner", page: "Blog", label: "Blog page banner", hint: "Wide banner at the top of Blog", def: u("1503428593586-e225b39bddfe") },
    { key: "contactBanner", page: "Contact", label: "Contact page banner", hint: "Wide banner at the top of Contact", def: u("1522202176988-66273c2fd55f") },
    { key: "pageBanner", page: "Other pages", label: "Default page banner", hint: "Success stories, notices, certificates, terms…", def: u("1531482615713-2afd69097998") },
];

const DEFAULTS = Object.fromEntries(SITE_IMAGE_SLOTS.map((s) => [s.key, s.def]));

/** Returns the admin-uploaded photo for a slot, or the default photo. */
export function useSiteImage(key) {
    const { settings } = useSettings() || {};
    const custom = settings?.siteImages?.[key];
    return custom || DEFAULTS[key] || DEFAULTS.pageBanner;
}

/** Same as useSiteImage but for several slots at once: const img = useSiteImages(); img.heroImage */
export function useSiteImages() {
    const { settings } = useSettings() || {};
    const custom = settings?.siteImages || {};
    return new Proxy(DEFAULTS, { get: (t, k) => custom[k] || t[k] || t.pageBanner });
}

export const getDefaultSiteImage = (key) => DEFAULTS[key] || DEFAULTS.pageBanner;
