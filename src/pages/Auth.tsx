import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { apiFetch, endpoints } from "@/lib/api";
import { loadGoogleAuth, requestGoogleCode } from "@/lib/googleAuth";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const busy = loading || googleLoading;

  const navigate = useNavigate();
  const { toast } = useToast();

  // If already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      // Load before the click so the Google popup can use the user's interaction.
      void loadGoogleAuth().catch(() => {});
    }
  }, []);

  const handleGoogleSignIn = async () => {
    if (busy) return;
    setGoogleLoading(true);

    try {
      const code = await requestGoogleCode();
      const res = await apiFetch<{ token: string }>(endpoints.auth.google, {
        method: "POST",
        body: JSON.stringify({ code, redirectUri: window.location.origin }),
      });

      if (typeof res.token !== "string" || !res.token.trim()) {
        throw new Error("Google sign-in could not be completed. Please try again.");
      }

      localStorage.setItem("token", res.token);
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
      navigate("/");
    } catch (error: unknown) {
      toast({
        title: "Google sign-in",
        description: error instanceof Error ? error.message : "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setLoading(true);

    try {
      if (isLogin) {
        /* ================= LOGIN ================= */
        const res = await apiFetch(endpoints.auth.login, {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        localStorage.setItem("token", res.token);

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        navigate("/");
      } else {
        /* ================= REGISTER ================= */
        await apiFetch(endpoints.auth.register, {
          method: "POST",
          body: JSON.stringify({
            name: fullName,
            email,
            password,
          }),
        });

        toast({
          title: "Account created!",
          description: "Now login with your credentials.",
        });

        setIsLogin(true);
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh min-h-dvh items-start justify-center overflow-x-clip bg-background px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] min-[360px]:px-4 sm:items-center sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-auto w-full min-w-0 max-w-md"
      >
        <div className="glass-card p-4 min-[360px]:p-6 sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-2xl font-bold min-[360px]:text-3xl">
              <span className="text-gradient-accent">The Design Hive</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Welcome back!" : "Create your account"}
            </p>
          </div>

          <GoogleSignInButton
            isLogin={isLogin}
            loading={googleLoading}
            disabled={busy}
            onClick={handleGoogleSignIn}
          />

          <div className="relative my-5 flex min-w-0 items-center gap-2 min-[360px]:my-6 min-[360px]:gap-4">
            <div className="h-px min-w-0 flex-1 bg-border" />
            <span className="shrink-0 text-[11px] text-muted-foreground min-[360px]:text-xs">or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label>Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 btn-luxury" disabled={busy}>
              {loading ? <Loader2 className="animate-spin" /> : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-1 text-center text-sm text-muted-foreground min-[360px]:mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              disabled={busy}
              className="min-h-11 px-2 font-medium text-accent disabled:opacity-50"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
