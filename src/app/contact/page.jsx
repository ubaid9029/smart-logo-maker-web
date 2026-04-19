import ContactForm from "../../components/Contact/ContactForm";
import HowIthelps from "../../components/Contact/HowItHelps";
import FAQSection from "../../components/Contact/FAQSection";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Smart Logo Maker. We're here to help you with your branding and logo design needs.",
  alternates: {
    canonical: "/contact",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smart-logomaker.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What's a sheet of on smart logo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our smart logo sheets are comprehensive design guides that ensure brand consistency across all digital and print mediums. They include color palettes, typography rules, and spacing guidelines tailored for your specific business needs."
      }
    },
    {
      "@type": "Question",
      "name": "How do I improve your questions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can improve questions by providing clear context and specific details. Our system uses advanced algorithms to refine user queries, ensuring you get the most accurate and helpful responses possible."
      }
    },
    {
      "@type": "Question",
      "name": "What is the environment of your smart logo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The environment refers to the ecosystem where your logo lives—from mobile apps to large-scale billboards. We optimize every logo to be responsive, meaning it looks perfect regardless of the screen size or background color."
      }
    }
  ]
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="content-shell-boxed">
        <ContactForm />
        <HowIthelps />
        <FAQSection />
      </main>
    </>
  );
}
