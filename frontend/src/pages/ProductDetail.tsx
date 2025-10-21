import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

// Dummy product data
const allProducts = [
  { 
    id: 1, 
    title: "Calculus Textbook", 
    price: 45, 
    description: "A comprehensive calculus guide ideal for engineering and science students. Covers differential, integral, and multivariable calculus with step-by-step examples and university-level exercises. Perfect for semester preparation and concept building.", 
    images: ["/book1.jpg"], 
    seller: { name: "Shubham", Used:"1.2 year", email: "xyz@gmail.com" }, 
    auction: { isAuction: true, highestBid: 50, minIncrement: 5, timeLeft: "10h 45m" } 
  },
  { 
    id: 2, 
    title: "Laptop Stand", 
    price: 20, 
    description: "Ergonomic aluminum laptop stand that improves posture and cooling. Lightweight, foldable, and ideal for long study sessions in hostels or libraries. Adjustable height ensures comfort while typing or attending online classes.", 
    images: ["/laptop1.jpg"], 
    seller: { name: "Steve Rogers", Used:" 12 months", email: "xyz@gmail.com" }, 
    auction: { isAuction: false } 
  },

  { 
    id: 3, 
    title: "Study Notes - Physics", 
    price: 10, 
    description: "Handwritten physics notes neatly organized chapter-wise, covering Mechanics, Thermodynamics, Electromagnetism, and Modern Physics. Simplified concepts and formulas for quick revision and last-minute preparation.", 
    images: ["/notes1.jpg"], 
    seller: { name: "Bruce Banner", Used: "1 year", email: "xyz@gmail.com" }, 
    auction: { isAuction: false } 
  },

  { 
    id: 4, 
    title: "Scientific Calculator", 
    price: 30, 
    description: "Casio fx-991EX ClassWiz calculator with 552 functions. Ideal for engineering students — handles matrices, statistics, and complex equations with ease. Excellent condition with original case and battery included.", 
    images: ["/calc1.jpg"], 
    seller: { name: "Peter", Used: "6 months", email: "xyz@gmail.com" }, 
    auction: { isAuction: true, highestBid: 35, minIncrement: 5, timeLeft: "6h 15m" } 
  },

  { 
    id: 5, 
    title: "C++ Programming Book", 
    price: 499, 
    description: "‘Programming in C++’ by E. Balagurusamy. A complete guide to mastering Object-Oriented Programming. Covers basics to advanced topics like inheritance and polymorphism with solved examples and practice problems.", 
    images: ["/book2.jpg"], 
    seller: { name: "Thor", Used: "2 years", email: "xyz@gmail.com" }, 
    auction: { isAuction: true, highestBid: 550, minIncrement: 50, timeLeft: "12h 30m" } 
  },

  { 
    id: 6, 
    title: "Desk Lamp", 
    price: 15, 
    description: "Adjustable LED desk lamp with 3 brightness levels. Energy-efficient, flexible design suitable for night study sessions. USB rechargeable and portable — perfect for hostel or dorm desk setups.", 
    images: ["/lamp1.jpg"], 
    seller: { name: "Tony Stark", Used:"2 year", email: "xyz@gmail.com" }, 
    auction: { isAuction: true, highestBid: 18, minIncrement: 2, timeLeft: "5h 20m" } 
  },

  { 
    id: 7, 
    title: "Organic Chemistry Notes", 
    price: 25, 
    description: "Comprehensive handwritten organic chemistry notes with reaction mechanisms, named reactions, and visual memory aids. Perfect for college exams and quick conceptual revision.", 
    images: ["/notes2.jpg"], 
    seller: { name: "Wanda", Used:"1 year", email: "xyz@gmail.com" }, 
    auction: { isAuction: false } 
  },

  { 
    id: 8, 
    title: "Bluetooth Headphones", 
    price: 150, 
    description: "High-quality wireless headphones with deep bass, noise isolation, and 20-hour battery life. Ideal for music, online classes, or movies. Lightweight design with soft ear cushions for comfort.", 
    images: ["/headphones.jpg"], 
    seller: { name: "Natasha", Used: "8 months", email: "xyz@gmail.com" }, 
    auction: { isAuction: true, highestBid: 160, minIncrement: 10, timeLeft: "3h 45m" } 
  }
];

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find product by ID
  const product = allProducts.find((p) => p.id === parseInt(id));
  if (!product) return <div className="p-12 text-center">Product not found.</div>;

  const [mainImage, setMainImage] = useState(product.images[0]);

  // Local bid state
  const [bid, setBid] = useState(
    product.auction.isAuction ? product.auction.highestBid + product.auction.minIncrement : 0
  );

  const placeBid = () => {
    if (bid >= product.auction.highestBid + product.auction.minIncrement) {
      alert(`Bid of ₹${bid} placed successfully!`);
      product.auction.highestBid = bid; 
      setBid(bid + product.auction.minIncrement); 
    } else {
      alert(`Bid must be at least ₹${product.auction.highestBid + product.auction.minIncrement}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-2xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="flex items-center mb-6 border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {/* Product Content */}
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
          {/* Left- Image Section */}
          <div className="flex-1 p-6 flex flex-col items-center">
            <img
              src={mainImage}
              alt={product.title}
              className="rounded-xl w-full h-96 object-cover shadow-md border border-blue-100"
            />
            <div className="flex gap-3 mt-4">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                    mainImage === img ? "border-blue-600 scale-105" : "border-gray-200 hover:border-blue-400"
                  }`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          </div>

          {/* Right- Details Section */}
          <div className="flex-1 p-8 space-y-6 border-t md:border-t-0 md:border-l border-blue-100">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800">{product.title}</h1>
            <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>

            {product.auction.isAuction ? (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                <p className="text-lg font-semibold text-blue-800">
                  Highest Bid: <span className="text-blue-600 font-bold">₹{product.auction.highestBid}</span>
                </p>
                <p className="text-gray-600">⏰ Time left: {product.auction.timeLeft}</p>
                <input
                  type="number"
                  value={bid}
                  onChange={(e) => setBid(Number(e.target.value))}
                  className="border-2 border-blue-200 focus:border-blue-500 rounded-lg w-full p-2 mt-1"
                  min={product.auction.highestBid + product.auction.minIncrement}
                />
                <Button onClick={placeBid} className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                  Place Bid
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center space-y-3">
                <p className="text-2xl font-bold text-blue-800">₹{product.price}</p>
                <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white">Buy Now</Button>
              </div>
            )}

            <div className="p-5 bg-gray-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-lg text-blue-800 mb-2">Seller Info</h3>
              <p className="text-gray-700">👤 Name: {product.seller.name}</p>
              <p className="text-gray-700">⭐ Used: {product.seller.Used}</p>
              <p className="text-gray-700">📧 Email: {product.seller.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
