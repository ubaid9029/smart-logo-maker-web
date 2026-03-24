"use client";
import Image from "next/image";
import ContactForm from "../../components/Contact/ContactForm";
import HowIthelps from "../../components/Contact/HowItHelps";
import FAQSection from "../../components/Contact/FAQSection";

export default function Contact() {
  return (
    <>
      <ContactForm/>
      <HowIthelps/>
      <FAQSection/>
    </>
  );
}
