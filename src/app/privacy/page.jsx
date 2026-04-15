"use client";
import Hero from "../../components/Privacy/Hero";
import Testimonials from "../../components/Privacy/Testimonials";
import FinalCTA from "../../components/Privacy/FinalCTA";
import PrivacyHero from "../../components/Privacy/PrivacyHero";

export default function PrivacyPage() {
  return (
    <main className="content-shell-boxed">
      <Hero />
      <PrivacyHero />
      <Testimonials />
      <FinalCTA />
    </main>
  );
}
