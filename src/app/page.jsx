import Image from "next/image";
import Hero from "../components/Home/Hero.jsx"
import Features from "../components/Home/Features.jsx";
import Howitworks from "../components/Home/HowItWorks.jsx";
import Testomonials from "../components/Home/Testomonials.jsx";
import FinalCTA from "../components/Home/FinalCTA.jsx";
import AppPreview from "../components/Home/AppPreview.jsx";
export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Howitworks />
      <AppPreview/>
      <Testomonials />
      <FinalCTA/>
    </>
  );
}
