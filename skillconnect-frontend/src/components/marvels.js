import React from "react";
import { Link } from "react-router-dom";
import '../assets/styles/landing-page.css';
import mainPicture from '../assets/images/Provider2.jpeg';

function Marvel() {
  return (
    <div className="Marvel">
   
        {/* Left Content */}
          <div className="Image flex justify-center">
          <img
            src={mainPicture}
            alt="Sample Providers from SkillConnect"
            className="rounded-xl shadow-lg object-contain"
          />
        </div>

      

        {/* Right Image */}
        <div className="LeftContent md:w-1/2 md:text-left">

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Expand your reach. <br />
            Find more clients. 
            Grow your business.
          </h1>
          <p className="text-lg">
            Looking for a platform to connect with more clients and increase your income?
          </p>
          
            <Link to="/register-provider" className="land-button">
                    Find a Customer
            </Link>
        </div>

    </div>
  );
}

export default Marvel;;
