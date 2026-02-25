import Image from "next/image";
import Hero from "../components/Hero.jsx"
import Features from "../components/Features.jsx";
import Howitworks from "../components/Howitworks.jsx"
import Testomonials from "../components/Testomonials.jsx"
import FinalCTA from "../components/FinalCTA.jsx";
import AppPreview from "../components/AppPreview.jsx"

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
