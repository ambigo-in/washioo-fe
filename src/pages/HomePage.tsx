import BookNowSection from "../components/BookNowSection";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import VehicleServicesShowcase from "../components/VehicleServiceShowcase";
import WhyChooseUs from "../components/WhyChooseUs";

export default function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <VehicleServicesShowcase/>
      <WhyChooseUs />
      <BookNowSection />
    </>
  );
}
