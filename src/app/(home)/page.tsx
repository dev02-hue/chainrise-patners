import AboutUs from "../component/home/AboutUs";
import CryptoCurrencyTicker from "../component/home/CryptoCurrencyTicker";
import CryptoMarket from "../component/home/CryptoMarket";
import FAQSection from "../component/home/FAQSection";
import HeroSection from "../component/home/HeroSection";
import InvestmentCalculator from "../component/home/InvestmentCalculator";
import LetsDoGreat from "../component/home/LetsDoGreat";
import Newsletter from "../component/home/Newsletter";
import OurAdvantage from "../component/home/OurAdvantage";
import OurBusinesses from "../component/home/OurBusinesses";
 import PricingSection from "../component/home/PricingSection";
import { TestimonialSection } from "../component/home/TestimonialSection";
import { WorkProcess } from "../component/home/WorkProcess";
// import YouTubeVideo from "../component/home/YouTubeVideo";
import { advantagess } from '@/data/advantages'

// import TeamSection from "../component/plan/TeamSection";
 
 
export default function Home() {
  return (
     <div>
  <CryptoCurrencyTicker />
  <HeroSection /> 
  <OurAdvantage advantages={advantagess} />
  
  <LetsDoGreat />
  <AboutUs />
  <PricingSection />
  <InvestmentCalculator />
  <WorkProcess />
  <CryptoMarket />
  <TestimonialSection />
  
  <FAQSection />
  <OurBusinesses />
  <Newsletter />
     </div>
  );
}
