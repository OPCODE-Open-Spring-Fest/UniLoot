import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCart } from "../components/CartContext";
import { useNotification } from "../components/NotificationContext";
import { toast } from "sonner";

type AuctionInfo = {
  isAuction: boolean;
  highestBid?: number;
  minIncrement?: number;
  timeLeft?: string;
  isExpired?: boolean;
};
type SellerInfo = { name: string; Used?: string; email?: string };

type Product = {
  id: number | string;
  title: string;
  name?: string; 
  price: number;
  description: string;
  images: string[];
  seller: SellerInfo;
  auction: AuctionInfo;
  imageUrl?: string;
  [key: string]: any; 
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
const demoProducts: Product[] = [
  { id: 1, title: "Calculus Textbook", price: 45, description: "A comprehensive calculus guide ideal for engineering and science students. Covers differential, integral, and multivariable calculus with step-by-step examples and university-level exercises. Perfect for semester preparation and concept building.", images: ["/book1.jpg"], seller: { name: "Shubham", Used: "1.2 year", email: "xyz@gmail.com" }, auction: { isAuction: true, highestBid: 50, minIncrement: 5, timeLeft: "10h 45m" } },
  { id: 2, title: "Laptop Stand", price: 20, description: "Ergonomic aluminum laptop stand that improves posture and cooling. Lightweight, foldable, and ideal for long study sessions in hostels or libraries. Adjustable height ensures comfort while typing or attending online classes.", images: ["/laptop1.jpg"], seller: { name: "Steve Rogers", Used: "12 months", email: "xyz@gmail.com" }, auction: { isAuction: false } },
  { id: 3, title: "Study Notes - Physics", price: 10, description: "Handwritten physics notes neatly organized chapter-wise, covering Mechanics, Thermodynamics, Electromagnetism, and Modern Physics. Simplified concepts and formulas for quick revision and last-minute preparation.", images: ["/notes1.jpg"], seller: { name: "Bruce Banner", Used: "1 year", email: "xyz@gmail.com" }, auction: { isAuction: false } },
  { id: 4, title: "Scientific Calculator", price: 30, description: "Casio fx-991EX ClassWiz calculator with 552 functions. Ideal for engineering students — handles matrices, statistics, and complex equations with ease. Excellent condition with original case and battery included.", images: ["/calc1.jpg"], seller: { name: "Peter", Used: "6 months", email: "xyz@gmail.com" }, auction: { isAuction: true, highestBid: 35, minIncrement: 5, timeLeft: "6h 15m" } },
  { id: 5, title: "C++ Programming Book", price: 499, description: "'Programming in C++' by E. Balagurusamy. A complete guide to mastering Object-Oriented Programming. Covers basics to advanced topics like inheritance and polymorphism with solved examples and practice problems.", images: ["/book2.jpg"], seller: { name: "Thor", Used: "2 years", email: "xyz@gmail.com" }, auction: { isAuction: true, highestBid: 550, minIncrement: 50, timeLeft: "12h 30m" } },
  { id: 6, title: "Desk Lamp", price: 15, description: "Adjustable LED desk lamp with 3 brightness levels. Energy-efficient, flexible design suitable for night study sessions. USB rechargeable and portable — perfect for hostel or dorm desk setups.", images: ["/lamp1.jpg"], seller: { name: "Tony Stark", Used: "2 year", email: "xyz@gmail.com" }, auction: { isAuction: true, highestBid: 18, minIncrement: 2, timeLeft: "5h 20m" } },
  { id: 7, title: "Organic Chemistry Notes", price: 25, description: "Comprehensive handwritten organic chemistry notes with reaction mechanisms, named reactions, and visual memory aids. Perfect for college exams and quick conceptual revision.", images: ["/notes2.jpg"], seller: { name: "Wanda", Used: "1 year", email: "xyz@gmail.com" }, auction: { isAuction: false } },
  { id: 8, title: "Bluetooth Headphones", price: 150, description: "High-quality wireless headphones with deep bass, noise isolation, and 20-hour battery life. Ideal for music, online classes, or movies. Lightweight design with soft ear cushions for comfort.", images: ["/headphones.jpg"], seller: { name: "Natasha", Used: "8 months", email: "xyz@gmail.com" }, auction: { isAuction: true, highestBid: 160, minIncrement: 10, timeLeft: "3h 45m" } }
];

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { notifyBidPlaced, notifyBuyItem } = useNotification();

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>("/placeholder.png");
  const [bid, setBid] = useState<number>(0);
  const [isBidding, setIsBidding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load product and auction data from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      setIsLoading(true);
      try {
        // Fetch product
        const productRes = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!productRes.ok) throw new Error("Product not found");
        const prod = await productRes.json();

        let auctionData = null;
        try {
          const auctionRes = await fetch(`${API_BASE_URL}/api/auctions/product/${id}`);
          if (auctionRes.ok) {
            auctionData = await auctionRes.json();
          }
        } catch (err) {
          // No auction 
        }

        const prodNorm: Product = {
          id: prod._id ?? prod.id,
          title: prod.name ?? prod.title ?? "",
          price: prod.price,
          description: prod.description ?? "",
          images: prod.imageUrl ? [prod.imageUrl] : [],
          seller: { name: "User", Used: "-", email: prod.sellerEmail || "" },
          auction: auctionData ? {
            isAuction: true,
            highestBid: auctionData.currentHighestBid || auctionData.startPrice,
            minIncrement: auctionData.minIncrement || 100,
            timeLeft: auctionData.timeLeft || "",
            isExpired: auctionData.isExpired || false,
          } : { isAuction: false },
          imageUrl: prod.imageUrl,
          ...prod
        };
        if (isMounted) {
          setProduct(prodNorm);
          setMainImage(prodNorm.images?.[0] ?? prodNorm.imageUrl ?? "/placeholder.png");
          if (prodNorm.auction?.isAuction && !prodNorm.auction.isExpired) {
            const minBid = (prodNorm.auction.highestBid || 0) + (prodNorm.auction.minIncrement || 100);
            setBid(minBid);
          }
        }
      } catch (err) {
        console.error("Error fetching product from backend:", err);
        // Fallback to demo products
        const local = demoProducts.find((p) => String(p.id) === String(id));
        if (isMounted && local) {
          setProduct(local);
          setMainImage(local.images?.[0] ?? "/placeholder.png");
          if (local.auction?.isAuction && !local.auction.isExpired) {
            const minBid = (local.auction.highestBid || 0) + (local.auction.minIncrement || 100);
            setBid(minBid);
          }
        } else if (isMounted) {
          setProduct(null);
          toast.error("Product not found", {
            description: "The product you're looking for doesn't exist.",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchProduct();
    return () => { isMounted = false; };
  }, [id]);

  const placeBid = async () => {
    if (!product || !product.auction.isAuction) {
      toast.error("This item is not in auction.");
      return;
    }

    if (product.auction.isExpired) {
      toast.error("This auction has expired.");
      return;
    }

    const min = (product.auction.highestBid || 0) + (product.auction.minIncrement || 100);
    if (bid < min) {
      toast.error(`Bid must be at least ₹${min}`);
      return;
    }
    const isDemoProduct = demoProducts.some(p => String(p.id) === String(product?.id));

    setIsBidding(true);
    try {
      if (isDemoProduct) {
        notifyBidPlaced(product.title ?? product.name ?? "Item", bid);
        setProduct((prod) => prod ? ({
          ...prod,
          auction: { 
            ...prod.auction, 
            highestBid: bid,
          },
        }) : null);
        const newMinBid = bid + (product.auction.minIncrement || 100);
        setBid(newMinBid);
        return;
      }
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please sign in to place a bid", {
          description: "You need to be logged in to bid on items.",
        });
        navigate("/signin");
        return;
      }

      const headers: any = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch(`${API_BASE_URL}/api/auctions/${product.id}/bid`, {
        method: "POST",
        headers,
        body: JSON.stringify({ amount: bid }),
      });

      if (res.ok) {
        const data = await res.json();
        notifyBidPlaced(product.title ?? product.name ?? "Item", bid);
        setProduct((prod) => prod ? ({
          ...prod,
          auction: { 
            ...prod.auction, 
            highestBid: data.auction?.currentHighestBid || bid,
          },
        }) : null);
        const newMinBid = (data.auction?.currentHighestBid || bid) + (product.auction.minIncrement || 100);
        setBid(newMinBid);
      } else {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        toast.error("Failed to place bid", {
          description: errorData.message || "Please try again.",
        });
      }
    } catch (err: any) {
      console.error("Bid error:", err);

      if (isDemoProduct) {
        notifyBidPlaced(product.title ?? product.name ?? "Item", bid);
        setProduct((prod) => prod ? ({
          ...prod,
          auction: { 
            ...prod.auction, 
            highestBid: bid,
          },
        }) : null);
        const newMinBid = bid + (product.auction.minIncrement || 100);
        setBid(newMinBid);
      } else {
        toast.error("Could not reach server", {
          description: "Please check your connection and try again.",
        });
      }
    } finally {
      setIsBidding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      await addItem({
        productId: String(product.id),
        name: product.title ?? product.name ?? "",
        price: product.price,
        quantity: 1,
        image: product.images?.[0] || product.imageUrl || "/placeholder.png",
      });
      notifyBuyItem(product.title ?? product.name ?? "Item", product.price);
      navigate("/cart");
    } catch (err) {
      toast.error("Failed to add item to cart", {
        description: "Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <Button onClick={() => navigate("/browse")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  // Render UI
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-10 dark:from-slate-900 dark:via-black dark:to-slate-900 dark:text-gray-200">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-2xl animate-blob animation-delay-4000"></div>
      </div>
      <div className="max-w-6xl mx-auto">
        <Button onClick={() => navigate(-1)} variant="outline" className="flex items-center mb-6 border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white dark:text-blue-300">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 dark:from-slate-900 dark:via-black dark:to-slate-900 dark:text-gray-200">
          <div className="flex-1 p-6 flex flex-col items-center">
            <img src={mainImage || "/Placeholder.png"} alt={product.title ?? product.name} className="rounded-xl w-full h-96 object-cover shadow-md border border-blue-100" />
            <div className="flex gap-3 mt-4">
              {(product.images || []).map((img, idx) => (
                <img key={idx} src={img} alt={`thumb-${idx}`} className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${mainImage === img ? "border-blue-600 scale-105" : "border-gray-200 hover:border-blue-400"}`} onClick={() => setMainImage(img)} />
              ))}
            </div>
          </div>
          <div className="flex-1 p-8 space-y-6 border-t md:border-t-0 md:border-l border-blue-100">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800">{product.title ?? product.name}</h1>
            <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
            {product.auction?.isAuction && !product.auction.isExpired ? (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                <p className="text-lg font-semibold text-blue-800">Highest Bid: <span className="text-blue-600 font-bold">₹{product.auction.highestBid}</span></p>
                <p className="text-gray-600">⏰ {product.auction.timeLeft ? `Time left: ${product.auction.timeLeft}` : ""}</p>
                <input type="number" value={bid} onChange={e => setBid(Number(e.target.value))} className="border-2 border-blue-200 focus:border-blue-500 rounded-lg w-full p-2 mt-1" min={(product.auction.highestBid || 0) + (product.auction.minIncrement || 1)} />
                <div className="flex gap-3">
                  <Button onClick={placeBid} className="flex-1 w-full bg-blue-700 hover:bg-blue-800 text-white" disabled={isBidding}>
                    {isBidding ? "Placing bid..." : "Place Bid"}
                  </Button>
                  <Button onClick={handleBuyNow} className="bg-green-600 hover:bg-green-700 text-white">Buy Now (₹{product.price.toLocaleString()})</Button>
                </div>
              </div>
            ) : product.auction?.isAuction && product.auction.isExpired ? (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <p className="text-lg font-semibold text-gray-800">Auction Ended</p>
                <p className="text-gray-600">Final Bid: ₹{product.auction.highestBid?.toLocaleString()}</p>
                <Button onClick={handleBuyNow} className="w-full bg-blue-700 hover:bg-blue-800 text-white">Buy Now (₹{product.price.toLocaleString()})</Button>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center space-y-3">
                <p className="text-2xl font-bold text-blue-800">₹{product.price.toLocaleString()}</p>
                <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white" onClick={handleBuyNow}>Buy Now</Button>
              </div>
            )}
            <div className="p-5 bg-gray-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-lg text-blue-800 mb-2">Seller Info</h3>
              <p className="text-gray-700">👤 Name: {product.seller?.name ?? "Unknown"}</p>
              <p className="text-gray-700">⭐ Used: {product.seller?.Used ?? "-"}</p>
              <p className="text-gray-700">📧 Email: {product.seller?.email ?? "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}