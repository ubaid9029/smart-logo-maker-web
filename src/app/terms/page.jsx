import Terms from "../../components/Terms/Terms";
import FinalCTA from "../../components/Terms/FinalCTA";

export const metadata = {
  title: "Terms of Service",
  description: "Read the terms of service for using Smart Logo Maker. Understand your rights and responsibilities when using our AI logo generator.",
  alternates: {
    canonical: "/terms",
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
      "name": "Terms of Service",
      "item": `${siteUrl}/terms`
    }
  ]
};

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="content-shell-boxed">
        <Terms />
        <FinalCTA />
      </main>
    </>
  );
}
