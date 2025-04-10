"use client";

import { SignIn } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSignInModal } from "@/hooks/use-signin-modal";

export const SignInModal = () => {
  const { isOpen, close } = useSignInModal();

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-fit px-0 !bg-transparent !border-0 !shadow-none">
        <DialogTitle className="sr-only">Sign In</DialogTitle>
        <SignIn routing="hash" fallbackRedirectUrl={"/"} />
      </DialogContent>
    </Dialog>
  );
};
