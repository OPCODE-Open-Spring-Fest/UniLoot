import React from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Tag, Clock } from "lucide-react";
import {  useNavigate } from 'react-router-dom';


const Dashboard: React.FC = () => {
    const navigate = useNavigate();

  // Dummy static data
  const boughtItems = [
    { id: 1, name: "Physics Textbook", price: "Rs 30" },
    { id: 2, name: "Laptop Stand", price: "Rs 25" },
    { id: 3, name: "Stationery Kit", price: "Rs 10" },
  ];

  const soldItems = [
    { id: 1, name: "Old Notes Set", price: "Rs 15" },
    { id: 2, name: "Used Calculator", price: "Rs 20" },
  ];

  const currentBids = [
    { id: 1, name: "Vintage Laptop", bid: "Rs 50" },
    { id: 2, name: "Art Supplies", bid: "Rs 12" },
  ];

  
const handleBuyClick = () => {
    console.log('Buy button clicked - Navigate to browse page');
    navigate('/browse');
  };

  const handleSellClick = () => {
    console.log('Sell button clicked - Navigate to sell page');
    navigate('/sell');
  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] bg-blue-50 py-12 px-6 text-black">
      <div className="container mx-auto space-y-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
          Welcome Back, Student!
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-6 h-6 text-blue-800" />
            <h2 className="text-2xl font-semibold text-gray-800">Bought Items</h2>
          </div>
          <ul className="space-y-2">
            {boughtItems.map(item => (
              <li key={item.id} className="flex justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
                <span>{item.name}</span>
                <span className="font-semibold">{item.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="w-6 h-6 text-blue-800" />
            <h2 className="text-2xl font-semibold text-gray-800">Sold Items</h2>
          </div>
          <ul className="space-y-2">
            {soldItems.map(item => (
              <li key={item.id} className="flex justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
                <span>{item.name}</span>
                <span className="font-semibold">{item.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-800" />
            <h2 className="text-2xl font-semibold text-gray-800">Current Bids</h2>
          </div>
          <ul className="space-y-2">
            {currentBids.map(item => (
              <li key={item.id} className="flex justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
                <span>{item.name}</span>
                <span className="font-semibold">{item.bid}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 justify-center lg:justify-start">
          <Button className="bg-blue-800 text-white hover:bg-blue-700 px-6 py-3 rounded-lg"
          onClick={handleBuyClick}
          >Browse Marketplace</Button>
          <Button className="border-4 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white px-6 py-3 rounded-lg"
          onClick={handleSellClick}
          >Sell an Item</Button>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
