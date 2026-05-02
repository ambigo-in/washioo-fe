import BookNowSection from "../components/BookNowSection";
import Header from "../components/Header";
import HomeLegalFooter from "../components/HomeLegalFooter";
import HeroSection from "../components/HeroSection";
import JoinCleanerSection from "../components/JoinCleanerSection";
import VehicleServicesShowcase from "../components/VehicleServiceShowcase";
import WhyChooseUs from "../components/WhyChooseUs";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <div className="home-page__content">
        <HeroSection />
        <VehicleServicesShowcase />
        <WhyChooseUs />
        <JoinCleanerSection />
        <BookNowSection />
        <HomeLegalFooter />
      </div>
    </div>
  );
}
