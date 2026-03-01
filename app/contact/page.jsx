import Image from "next/image";
import ContactForm from "../../components/ContactForm";
import HowIthelps from "../../components/HowIthelps";
import FAQSection from "../../components/FAQSection";
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export default function Contact() {
  return (
    <>
        <Navbar/>
      <ContactForm/>
      <HowIthelps/>
      <FAQSection/>
            <Footer/>
    </>
  );
}
