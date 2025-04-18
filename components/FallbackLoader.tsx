import { Loader } from "lucide-react";
import React from "react";

const FallbackLoader = () => {
  return (
    <div className="w-full flex justify-center gap-2 p-5">
      <Loader className="h-16 w-16 animate-spin mx-auto" />
    </div>
  );
};

export default FallbackLoader;
