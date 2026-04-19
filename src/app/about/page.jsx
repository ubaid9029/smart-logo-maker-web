import AboutHero from "../../components/About/AboutHero";
import OurStory from "../../components/About/OurStory.jsx";
import ProblemSolution from "../../components/About/ProblemSolution.jsx";
import WhyChoose from "../../components/About/WhyChoose.jsx";
import NumbersSection from "../../components/About/NumberSection.jsx";

export const metadata = {
  title: "About Us",
  description: "Learn about the mission and vision of Smart Logo Maker. We aim to democratize professional branding for everyone.",
  alternates: {
    canonical: "/about",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smart-logomaker.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": siteUrl
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "About Us",
      "item": `${siteUrl}/about`
    }
  ]
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="content-shell-boxed">
        <AboutHero />
        <OurStory />
        <ProblemSolution />
        <WhyChoose />
        <NumbersSection />
      </main>
    </>
  );
}
