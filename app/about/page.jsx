import Image from "next/image";
import AboutHero from "../../components/AboutHero";
import OurStory from "../../components/OurStory";
import ProblemSolution from "../../components/ProblemSolution";
import WhyChoose from "../../components/WhyChoose";
import NumbersSection from "../../components/NumberSection";

export default function Contact() {
  return (
    <>
      <AboutHero/>
      <OurStory/>
      <ProblemSolution/>
      <WhyChoose/>
      <NumbersSection/>
    </>
  );
}
