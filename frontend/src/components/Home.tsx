import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import heroImage from "../assets/ex4.png";
import { ArrowRight, ShoppingCart, Tag  } from "lucide-react";

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleBuyClick = () => {
    console.log('Buy button clicked - Navigate to browse page');
    // TODO: Implement navigation when browse page is ready
    // navigate('/browse');
  };

  const handleSellClick = () => {
    console.log('Sell button clicked - Navigate to sell page');
    // TODO: Implement navigation when sell page is ready
    // navigate('/sell');
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden text-black">
      {/* bg */}
      <div className="absolute inset-0 -z-20 bg-blue-50 blur-3xl overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-800 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-32 w-96 h-96 bg-blue-800 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-800 rounded-full opacity-20 blur-2xl animate-blob animation-delay-4000"></div>

      </div>

      <div className="container relative z-10 mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left Content */}
    <div className="space-y-6 text-center lg:text-left">

  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-800 leading-tight tracking-tighter ml-2">
    UniLoot - Your<br />
    <span className="text-blue-800">Campus Marketplace,</span><br />
    Simplified!
  </h1>

  <p className="text-lg ml-2 md:text-xl text-black/80 max-w-2xl lg:max-w-full lg:mr-4">
    The official hub for students to buy, sell, and trade textbooks,
    electronics, notes, and more. Find what you need, right here on campus.
  </p>

          <div className="pt-2 flex flex-row sm:flex-row gap-4 justify-center lg:justify-start">
           <Button
  size="lg"
  onClick={handleBuyClick}
  className="relative overflow-hidden text-base text-white bg-blue-800 hover:text-blue-800 hover:border-4 border-blue-800 rounded-lg group px-6 py-3 font-semibold transition-all duration-300"
>
  <span className="absolute inset-0 bg-white scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 rounded-lg z-0"></span>
  <span className="relative flex items-center justify-center gap-2 z-10">
    Buy
    <ShoppingCart className="w-5 h-5 text-white group-hover:text-blue-800 transition-transform duration-500 group-hover:rotate-12" />
  </span>
  <span className="absolute inset-0 flex items-center justify-center text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg z-20"></span>
</Button>
            <Button
  size="lg"
  onClick={handleSellClick}
  className="relative overflow-hidden text-base text-blue-800 hover:text-white border-4 border-b-blue-800 hover:border-blue-800 rounded-lg group px-6 py-3 font-semibold transition-all duration-300"
>
  <span className="absolute inset-0 bg-blue-800 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 rounded-lg z-0"></span>
  <span className="relative flex items-center justify-center gap-2 z-10">
    Sell
    <Tag className="w-5 h-5 text-blue-800 group-hover:text-white transition-transform duration-500 group-hover:rotate-12" />
  </span>
  <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg z-20"></span>
</Button>

          </div>
        </div>

        {/* Right Image Block */}
        <div className="relative mb-8 lg:block group">
          <img
            src={heroImage}
            alt="Students collaborating and exchanging items on campus"
            className="relative w-full h-auto rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
