import { useEffect } from "react"; // Import useEffect
import AOS from "aos";
import "aos/dist/aos.css";

import Banner from "../../components/home/Banner";
import FAQ from "../../components/home/FAQ";
import Features from "../../components/home/features/Features";

import Newsletter from "../../components/home/Newsletter";
import NavBar from "../layouts/NavBar";
import Footer from "../layouts/Footer";

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 2000,
    });
  }, []);
  return (
    <>
      <NavBar />
      <Banner />
      <Features />
      <Newsletter />

      <FAQ />
      <Footer />
    </>
  );
};

export default Home;
