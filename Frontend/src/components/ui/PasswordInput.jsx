import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import Input from "./Input";

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <Input
      icon={Lock}
      type={show ? "text" : "password"}
      rightSlot={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="flex text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  );
}
