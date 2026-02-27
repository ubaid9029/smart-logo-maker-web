import Image from "next/image";
import ContactForm from "../../components/ContactForm";
import HowIthelps from "../../components/HowIthelps";
import FAQSection from "../../components/FAQSection";

export default function Contact() {
  return (
    <>
      <ContactForm/>
      <HowIthelps/>
      <FAQSection/>
    </>
  );
}
