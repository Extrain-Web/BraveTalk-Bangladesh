export interface ISiteSettings {
    // Brand / Identity
    brandName: string;
    brandNameBn: string;
    websiteUrl: string;
    logo?: string;

    // Hero Section - English
    heroBadge: string;
    heroHeading1: string;
    heroHeading2: string;
    heroHeadingWith: string;
    heroAcademyName: string;
    heroDescription: string;

    // Hero Section - Bengali
    heroBadgeBn: string;
    heroHeading1Bn: string;
    heroHeading2Bn: string;
    heroHeadingWithBn: string;
    heroAcademyNameBn: string;
    heroDescriptionBn: string;

    // Contact Information
    phoneNumber: string;
    whatsappNumber: string;
    email: string;
    address: string;
    addressBn: string;

    // Social Links
    facebookUrl: string;
    youtubeUrl: string;
    linkedinUrl: string;
    instagramUrl?: string;

    // Admin-uploaded photos used across the public pages (key → image URL).
    // Keys: heroImage, aboutHero, aboutStory, aboutClass, coursesBanner, booksBanner,
    // mentorsBanner, contactBanner, ctaImage, galleryN …  Empty/missing = page default.
    siteImages?: Record<string, string>;

    // Manual payment accounts for checkout (see settings.model.ts)
    paymentInfo?: {
        mobile?: Record<string, { number?: string; accountType?: string; enabled?: boolean }>;
        banks?: { bankName?: string; accountName?: string; accountNumber?: string; branch?: string; routingNumber?: string; enabled?: boolean }[];
        note?: string;
    };

    createdAt?: Date;
    updatedAt?: Date;
}
