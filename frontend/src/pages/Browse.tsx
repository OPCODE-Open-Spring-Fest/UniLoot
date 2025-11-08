import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "../components/ui/drawer";
import { useCart } from "../components/CartContext";
import { useNotification } from "../components/NotificationContext";

const Browse = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { addItem } = useCart();
  const { notifyAddToCart } = useNotification();
  const demoProducts = [
    { id: "6", name: "Desk Lamp", price: "₹15", category: "Electronics", seller: "Thor", images: ["/lamp1.jpg"] },
    { id: "7", name: "Organic Chemistry Notes", price: "₹25", category: "Notes", seller: "Wanda", images: ["/notes2.jpg"] },
    { id: "8", name: "Bluetooth Headphones", price: "₹150", category: "Electronics", seller: "Natasha", images: ["/headphones.jpg"] },
    { id: "4", name: "Scientific Calculator", price: "₹30", category: "Electronics", seller: "Peter", images: ["/calc1.jpg"] },
    { id: "1", name: "Calculus Textbook", price: "₹45", category: "Books", seller: "Shubham", images: ["/book1.jpg"] },
    { id: "2", name: "Laptop Stand", price: "₹20", category: "Electronics", seller: "Steve Rogers", images: ["/laptop1.jpg"] },
    { id: "3", name: "Study Notes - Physics", price: "₹10", category: "Notes", seller: "Bruce Banner", images: ["/notes1.jpg"] },
    { id: "5", name: "C++ Programming Book", price: "₹499", category: "Books", seller: "Tony Stark", images: ["/book2.jpg"] },
  ];
  const [products, setProducts] = useState<any[]>(demoProducts);

  // Fetching products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id || p.id));
          const newOnes = data.filter((p: any) => !existingIds.has(p._id));
          return [...prev, ...newOnes];
        });
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const applyFilters = () => {
    alert(`Applied Filters:
  Category: ${selectedCategory || "All"}
  Price Range: ₹${minPrice || 0} - ₹${maxPrice || "∞"}`);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortOrder("");
  };

  // Normalize product price (for robust filtering and sorting)
  const getPrice = (product: any): number => {
    // Accepts backend number or demo string with ₹
    if (typeof product.price === "number") return product.price;
    if (typeof product.price === "string") {
      const v = product.price.replace(/[^\d.]/g, "");
      return v ? parseFloat(v) : 0;
    }
    return 0;
  };

  const filteredProducts = products
    .filter(product => {
      const price = getPrice(product);
      const matchesCategory = selectedCategory ? product.category?.toLowerCase() === selectedCategory.toLowerCase() : true;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = (!minPrice || price >= parseFloat(minPrice)) && (!maxPrice || price <= parseFloat(maxPrice));
      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = getPrice(a);
      const priceB = getPrice(b);
      if (sortOrder === "lowToHigh") return priceA - priceB;
      if (sortOrder === "highToLow") return priceB - priceA;
      return 0;
    });

  const handleAddToCart = async (product: any) => {
    const price = getPrice(product);
    await addItem({
      productId: String(product.id || product._id),
      name: product.name,
      price,
      quantity: 1,
      image: product.imageUrl || (product.images?.[0]),
    });
    // 3. Replace the alert with the toast notification
    notifyAddToCart(product.name);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-8 dark:bg-gradient-to-br dark:from-slate-900 dark:via-black dark:to-slate-900 dark:text-gray-200">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-2xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 dark:text-blue-300">Browse Products</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Find what you need from fellow students</p>
        </div>

        <div className="mb-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input type="text" placeholder="Search for textbooks, electronics, notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 py-6 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-lg" />
          </div>

          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button className="px-6 py-6 bg-blue-700 hover:bg-blue-800 text-white text-lg rounded-lg w-full sm:w-auto" onClick={() => setIsDrawerOpen(true)}>Filter</Button>
            </DrawerTrigger>
            <DrawerContent className="p-6 bg-white rounded-t-2xl border-t-4 border-blue-500">
              <DrawerHeader><DrawerTitle className="text-2xl font-semibold text-blue-800">Filter Products</DrawerTitle></DrawerHeader>
              <div className="mt-4">
                <label htmlFor="category" className="block text-gray-700 mb-2 font-medium">Category</label>
                <select id="category" className="w-full border-2 border-blue-200 rounded-lg p-3 focus:outline-none focus:border-blue-500" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  <option value="books">Books & Textbooks</option>
                  <option value="electronics">Electronics</option>
                  <option value="notes">Notes & Study Materials</option>
                  <option value="furniture">Furniture</option>
                  <option value="clothing">Clothing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Min Price (₹)</label>
                  <Input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="border-2 border-blue-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Max Price (₹)</label>
                  <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="border-2 border-blue-200 rounded-lg" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 mb-2 font-medium">Sort by Price</label>
                <select className="w-full border-2 border-blue-200 rounded-lg p-3 focus:outline-none focus:border-blue-500" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="">Default</option>
                  <option value="lowToHigh">Price: Low → High</option>
                  <option value="highToLow">Price: High → Low</option>
                </select>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button onClick={() => { applyFilters(); setIsDrawerOpen(false); }} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-lg rounded-lg">Apply Filters</Button>
                <Button onClick={clearFilters} variant="outline" className="flex-1 border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white text-lg rounded-lg">Clear</Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? filteredProducts.map((product: any) => (
            <Card key={product.id || product._id} onClick={() => navigate(`/product/${product.id || product._id}`)} className="hover:shadow-xl transition-shadow duration-300 border-2 border-blue-100 cursor-pointer">
              <img src={product.imageUrl || (product.images?.[0]) || "/Placeholder.png"} alt={product.name} className="rounded-t-lg w-full h-60 object-cover" />
              <CardHeader>
                <CardTitle className="text-xl text-blue-800">{product.name}</CardTitle>
                <CardDescription className="text-sm">Category: {product.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{getPrice(product)}
                </p>
                <p className="text-sm text-gray-500 mt-2">Seller: {product.seller}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
              </CardFooter>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-gray-500">No products found matching your search.</p>
            </div>
          )}
        </div>
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" onClick={() => (window.location.href = "/")} className="border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white">Back to Home</Button>
        </div>
      </div>
    </div>
  );
};
export default Browse;