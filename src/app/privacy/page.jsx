import Hero from "../../components/Privacy/Hero";
import Testimonials from "../../components/Privacy/Testimonials";
import FinalCTA from "../../components/Privacy/FinalCTA";
import PrivacyHero from "../../components/Privacy/PrivacyHero";

export const metadata = {
  title: "Privacy Policy",
  description: "Read our privacy policy to understand how Smart Logo Maker handles your data and ensures your privacy.",
  alternates: {
    canonical: "/privacy",
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
      "name": "Privacy Policy",
      "item": `${siteUrl}/privacy`
    }
  ]
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="content-shell-boxed">
        <Hero />
        <PrivacyHero />
        <Testimonials />
        <FinalCTA />
      </main>
    </>
  );
}
