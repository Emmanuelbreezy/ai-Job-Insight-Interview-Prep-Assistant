"use client";
import { useState } from "react";

export const useUpgradeModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // const openModal = () => setIsOpen(true);
  // const closeModal = () => setIsOpen(false);

  const openModal = () => {
    console.log("Opening modal"); // Debug log
    setIsOpen(true);
  };

  const closeModal = () => {
    console.log("Closing modal"); // Debug log
    setIsOpen(false);
  };

  return {
    isOpen,
    openModal,
    closeModal,
    setIsOpen,
  };
};
