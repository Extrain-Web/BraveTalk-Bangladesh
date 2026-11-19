import AboutHero from "@/components/Aboutpage/AboutHero";
import Mission from "@/components/Aboutpage/Mission";
import AboutPrograms from "@/components/Aboutpage/AboutPrograms";
import AboutJourney from "@/components/Aboutpage/AboutJourney";
import Value from "@/components/Aboutpage/Value";
import AboutMentors from "@/components/Aboutpage/AboutMentors";
import AboutCta from "@/components/Aboutpage/AboutCta";

export const metadata = {
  title: "About Us | BraveTalk Bangladesh",
  description:
    "BraveTalk Bangladesh — empowering students through public speaking, leadership & social advocacy. Be a Speaker, Be a Leader!",
};

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <AboutHero />
      <Mission />
      <AboutPrograms />
      <AboutJourney />
      <Value />
      <AboutMentors />
      <AboutCta />
    </div>
  );
};

export default AboutPage;
