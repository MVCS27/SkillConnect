import React from "react";
import { Link } from "react-router-dom";
import '../assets/styles/landing-page.css';
import mainPicture from '../assets/images/FourPartImage.jpg';

function Footer() {
  return (
    <div className="Footer">
   
        {/* Left Content */}
        <div className="md:w-1/2 md:text-left">

           <h3 className="text-lg">
            For inquiries contact us from:
          </h3>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            skillconnect2468@gmail.com
          </h2>
          
        </div>

    </div>
  );
}

export default Footer;
