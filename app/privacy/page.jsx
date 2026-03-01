import Image from "next/image";
import Hero from "../../components/Hero"
import Testomonials from "../../components/Testomonials"
import FinalCTA from "../../components/FinalCTA";
import PrivacyHero from "../../components/PrivacyHero"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export default function Contact() {
    return (
        <>
            <Navbar/>
            <Hero />
            <PrivacyHero />
            <Testomonials />
            <FinalCTA />
                  <Footer/>

        </>
    );
}
