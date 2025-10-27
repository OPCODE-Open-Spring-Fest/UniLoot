import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { InputField } from "../components/InputField";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "../hooks/use-toast";
import { Upload, DollarSign } from "lucide-react";

interface SellFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
}

const Sell = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SellFormData>();

  const onSubmit = async (data: SellFormData) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API later
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const listingData = {
        ...data,
        category: selectedCategory,
        condition: selectedCondition,
      };
      
      console.log("Listing created:", listingData);
      
      toast({
        title: "Success!",
        description: "Your item has been listed successfully.",
      });
      
      reset();
      setSelectedCategory("");
      setSelectedCondition("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to list your item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12 dark:bg-gradient-to-br dark:from-slate-900 dark:via-black dark:to-slate-900 dark:text-gray-200">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-32 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-2xl animate-blob animation-delay-4000"></div>
      </div>

  <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-md border-2 border-blue-100 shadow-xl dark:bg-slate-800/90 dark:border-slate-700">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-extrabold text-blue-800 dark:text-blue-300">
            Sell Your Item
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            List your items and connect with buyers on campus
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <InputField
              label="Item Title"
              id="title"
              type="text"
              placeholder="e.g., Calculus Textbook - 10th Edition"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 5,
                  message: "Title must be at least 5 characters",
                },
              })}
              error={errors.title?.message}
            />

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your item's condition, features, and any other relevant details..."
                rows={4}
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 20,
                    message: "Description must be at least 20 characters",
                  },
                })}
                className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                Price ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("price", {
                    required: "Price is required",
                    min: {
                      value: 0.01,
                      message: "Price must be greater than 0",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-2 border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="books">Books & Textbooks</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="notes">Notes & Study Materials</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label htmlFor="condition" className="text-sm font-medium text-gray-700">
                Condition
              </Label>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger className="border-2 border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload Placeholder */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Images
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload images (Coming soon)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-6 text-lg font-semibold rounded-lg transition-all"
              size="lg"
              disabled={isLoading || !selectedCategory || !selectedCondition}
            >
              {isLoading ? "Listing..." : "List Item"}
            </Button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/'}
              className="border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sell;
