import React from "react";
import { Link } from "react-router-dom";
import '../assets/styles/landing-page.css';
import mainPicture from '../assets/images/FourPartImage.jpg';

function Hero() {
  return (
    <div className="Hero">
   
        {/* Left Content */}
        <div className="LeftContent md:w-1/2 md:text-left">

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Save time, find the perfect professional,<br /> and get the job done right.
          </h1>
          <p className="text-lg">
            Need a reliable service provider? We connect you to top-rated pros in your area.
          </p>

           <Link to="/sign-up" className="land-button">
            Find a Professional
          </Link>
          
        </div>

        {/* Right Image */}
        <div className="Image flex justify-center">
          <img
            src={mainPicture}
            alt="Sample Providers from SkillConnect"
            className="rounded-xl shadow-lg object-contain"
          />
        </div>

    </div>
  );
}

export default Hero;
