import { useState } from "react";
import { SignupScreen } from "./SignupScreen";
import { LoginScreen } from "./LoginScreen";

type Mode = "login" | "signup";

export function AuthScreen({ initial = "login" }: { initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);

  return mode === "login" ? (
    <LoginScreen onSwitchToSignup={() => setMode("signup")} />
  ) : (
    <SignupScreen onSwitchToLogin={() => setMode("login")} />
  );
}
