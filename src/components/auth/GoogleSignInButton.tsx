import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  isLogin: boolean;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const GoogleSignInButton = ({ isLogin, loading, disabled, onClick }: GoogleSignInButtonProps) => (
  <Button
    type="button"
    variant="outline"
    className="w-full h-12 gap-3 border-[#747775] bg-white font-medium text-[#1f1f1f] hover:bg-[#f8fafd] hover:text-[#1f1f1f]"
    disabled={disabled}
    onClick={onClick}
    aria-busy={loading}
  >
    {loading ? (
      <Loader2 className="animate-spin" aria-hidden="true" />
    ) : (
      <svg viewBox="0 0 48 48" className="!size-5" aria-hidden="true" focusable="false">
        <path fill="#4285F4" d="M43.61 24.46c0-1.36-.12-2.66-.35-3.92H24v7.42h11a9.4 9.4 0 0 1-4.08 6.18v5.13h6.6c3.86-3.56 6.09-8.8 6.09-14.81Z" />
        <path fill="#34A853" d="M24 44c5.5 0 10.1-1.82 13.52-4.73l-6.6-5.13c-1.82 1.22-4.15 1.94-6.92 1.94-5.32 0-9.83-3.59-11.44-8.42H5.75v5.29A20 20 0 0 0 24 44Z" />
        <path fill="#FBBC05" d="M12.56 27.66a12.02 12.02 0 0 1 0-7.32v-5.29H5.75a20 20 0 0 0 0 17.9l6.81-5.29Z" />
        <path fill="#EA4335" d="M24 11.92c3 0 5.7 1.03 7.82 3.05l5.86-5.86A19.66 19.66 0 0 0 24 4 20 20 0 0 0 5.75 15.05l6.81 5.29C14.17 15.51 18.68 11.92 24 11.92Z" />
      </svg>
    )}
    {loading ? "Connecting to Google..." : isLogin ? "Sign in with Google" : "Sign up with Google"}
  </Button>
);
