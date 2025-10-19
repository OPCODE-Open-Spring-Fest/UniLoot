import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Browse = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  //dummy product data
  const products = [
    { id: 6, name: "Desk Lamp", price: "₹15", category: "Electronics", seller: "Thor", images: ["/lamp1.jpg"] },
    { id: 7, name: "Organic Chemistry Notes", price: "₹25", category: "Notes", seller: "Wanda", images: ["/notes2.jpg"] },
    { id: 8, name: "Bluetooth Headphones", price: "₹150", category: "Electronics", seller: "Natasha", images: ["/headphones.jpg"] },
    { id: 4, name: "Scientific Calculator", price: "₹30", category: "Electronics", seller: "Peter", images: ["/calc1.jpg"] },
    { id: 1, name: "Calculus Textbook", price: "₹45", category: "Books", seller: "Shubham", images: ["/book1.jpg"] },
    { id: 2, name: "Laptop Stand", price: "₹20", category: "Electronics", seller: "Steve Rogers", images: ["/laptop1.jpg"] },
    { id: 3, name: "Study Notes - Physics", price: "₹10", category: "Notes", seller: "Bruce Banner", images: ["/notes1.jpg"] },
    { id: 5, name: "C++ Programming Book", price: "₹499", category: "Books", seller: "Tony Stark", images: ["/book2.jpg"] },
    
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-2xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4">
            Browse Products
          </h1>
          <p className="text-lg text-gray-600">
            Find what you need from fellow students
          </p>
        </div>

  {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for textbooks, electronics, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-lg"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="hover:shadow-xl transition-shadow duration-300 border-2 border-blue-100 cursor-pointer"
              >
                <img src={product.images[0]} alt={product.name} className="rounded-t-lg w-full h-60 object-cover" />
                <CardHeader>
                  <CardTitle className="text-xl text-blue-800">{product.name}</CardTitle>
                  <CardDescription className="text-sm">
                    Category: {product.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">{product.price}</p>
                  <p className="text-sm text-gray-500 mt-2">Seller: {product.seller}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`${product.name} added to cart!`);
                    }}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-gray-500">No products found matching your search.</p>
            </div>
          )}
        </div>

        {/* Back to Home Button */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/'}
            className="border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Browse;
