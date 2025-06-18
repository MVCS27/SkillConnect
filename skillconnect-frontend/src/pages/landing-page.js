import Hero from "../components/hero";
import Marvel from "../components/marvels";
import Footer from "../components/footer";
import Navbar from "../components/navbar";

import '../assets/styles/landing-page.css';

function LandingPage() {
  return (
    <div>
      <Navbar />  {/* Navbar will always appear */}
      <Hero />
      <Marvel />
      <Footer />
    </div>
  );
}

export default LandingPage;
