"use client";
import Image from "next/image";
import AboutHero from "../../components/About/AboutHero";
import OurStory from "../../components/About/NumberSection.jsx";
import ProblemSolution from "../../components/About/ProblemSolution.jsx";
import WhyChoose from "../../components/About/WhyChoose.jsx";
import NumbersSection from "../../components/About/NumberSection.jsx";

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
