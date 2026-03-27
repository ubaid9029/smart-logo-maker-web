"use client";
import AboutHero from "../../components/About/AboutHero";
import OurStory from "../../components/About/OurStory.jsx";
import ProblemSolution from "../../components/About/ProblemSolution.jsx";
import WhyChoose from "../../components/About/WhyChoose.jsx";
import NumbersSection from "../../components/About/NumberSection.jsx";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <OurStory />
      <ProblemSolution />
      <WhyChoose />
      <NumbersSection />
    </>
  );
}
