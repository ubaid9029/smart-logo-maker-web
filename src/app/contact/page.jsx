"use client";
import ContactForm from "../../components/Contact/ContactForm";
import HowIthelps from "../../components/Contact/HowItHelps";
import FAQSection from "../../components/Contact/FAQSection";

export default function ContactPage() {
  return (
    <main className="content-shell-boxed">
      <ContactForm />
      <HowIthelps />
      <FAQSection />
    </main>
  );
}
