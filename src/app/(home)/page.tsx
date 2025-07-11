import AboutUs from "../component/home/AboutUs";
import CryptoCurrencyTicker from "../component/home/CryptoCurrencyTicker";
import HeroSection from "../component/home/HeroSection";
import LetsDoGreat from "../component/home/LetsDoGreat";
import OurAdvantage from "../component/home/OurAdvantage";
import PricingSection from "../component/home/PricingSection";
import YouTubeVideo from "../component/home/YouTubeVideo";
import Footer from "../component/layout/Footer";
import Nav from "../component/layout/Nav";

 
export default function Home() {
  return (
     <div>
  <Nav />
  <CryptoCurrencyTicker />
  <HeroSection /> 
  <OurAdvantage />
  <YouTubeVideo />
  <LetsDoGreat />
  <AboutUs />
  <PricingSection />
  <Footer />
     </div>
  );
}
