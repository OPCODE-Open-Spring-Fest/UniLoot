import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { InputField } from "../components/InputField";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "../hooks/use-toast";
import { Upload, X as XIcon, DollarSign } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";


interface SellFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const Sell = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [firebaseImageUrl, setFirebaseImageUrl] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SellFormData>();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file", description: "Only JPG, PNG, WEBP allowed.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast({ title: "Image too large", description: "Max size is 2MB.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview("");
    setFirebaseImageUrl("");
  }

  //Upload image to Firebase Storage
  async function uploadImageToFirebase(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  }

  const onSubmit = async (data: SellFormData) => {
    setIsLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImageToFirebase(imageFile);
        setFirebaseImageUrl(imageUrl);
      }
      //Now send product data to backend
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.title,
          description: data.description,
          price: data.price,
          category: selectedCategory,
          condition: selectedCondition,
          stock: 1,
          imageUrl 
        }),
      });

      if (!res.ok) throw new Error("Failed to create product");
      const product = await res.json();

      toast({
        title: "Success!",
        description: "Your item has been listed successfully.",
      });

      reset();
      setSelectedCategory("");
      setSelectedCondition("");
      setImageFile(null);
      setImagePreview("");
      setFirebaseImageUrl("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to list your item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12 dark:bg-gradient-to-br dark:from-slate-900 dark:via-black dark:to-slate-900 dark:text-gray-200">
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

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Images
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer flex flex-col items-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="preview" className="max-h-48 rounded-lg mb-2" />
                    <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100">
                      <XIcon className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload images (Max 2MB, JPG/PNG/WEBP)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  id="product-image"
                  onChange={handleImageChange}
                />
                <label htmlFor="product-image" className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                  {imagePreview ? "Change Image" : "Upload Image"}
                </label>
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