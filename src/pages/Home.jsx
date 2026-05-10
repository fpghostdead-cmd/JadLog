import React from "react";
import Navbar from "../components/public/Navbar";
import HeroSearch from "../components/public/HeroSearch";
import ServicesSection from "../components/public/ServicesSection";
import AboutSection from "../components/public/AboutSection";
import Footer from "../components/public/Footer";
import WelcomePopup from "../components/public/WelcomePopup";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <WelcomePopup />
      <Navbar />
      <HeroSearch />
      <AboutSection />
      <ServicesSection />
      <Footer />
    </div>
  );
}