"use client";
import Image from "next/image";
import Hero from "../../components/Privacy/Hero";
import Testomonials from "../../components/Privacy/Testomonials";
import FinalCTA from "../../components/Privacy/FinalCTA";
import PrivacyHero from "../../components/Privacy/PrivacyHero"

export default function Privacy() {
    return (
        <>
            <Hero />
            <PrivacyHero />
            <Testomonials />
            <FinalCTA />
        </>
    );
}
