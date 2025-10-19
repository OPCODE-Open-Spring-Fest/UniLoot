import React from "react";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  type: "buy" | "bid";
}

interface Props {
  product: Product;
  onSelect: (product: Product) => void;
}

const ProductCard: React.FC<Props> = ({ product, onSelect }) => {
  return (
    <div
      className="border rounded-2xl shadow p-4 cursor-pointer hover:shadow-lg transition"
      onClick={() => onSelect(product)}
    >
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-40 object-cover rounded-xl mb-2"
      />
      <h3 className="text-lg font-semibold">{product.title}</h3>
      <p className="text-gray-600">₹{product.price}</p>
      <div className="flex gap-2 mt-2">
        {product.type === "buy" ? (
          <Button>Buy Now</Button>
        ) : (
          <Button variant="secondary">Bid</Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
