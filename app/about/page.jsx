import Image from "next/image";
import AboutHero from "../../components/AboutHero";
import OurStory from "../../components/OurStory";
import ProblemSolution from "../../components/ProblemSolution";
import WhyChoose from "../../components/WhyChoose";
import NumbersSection from "../../components/NumberSection";
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
export default function Contact() {
  return (
    <>
    <Navbar/>
      <AboutHero/>
      <OurStory/>
      <ProblemSolution/>
      <WhyChoose/>
      <NumbersSection/>
      <Footer/>
    </>
  );
}
