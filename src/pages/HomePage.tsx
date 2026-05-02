import BookNowSection from "../components/BookNowSection";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
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
        <BookNowSection />
      </div>
    </div>
  );
}
