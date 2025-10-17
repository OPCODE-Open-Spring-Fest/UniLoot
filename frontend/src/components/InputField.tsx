import { forwardRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
        </Label>
        <Input
          ref={ref}
          {...props}
          className={error ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";