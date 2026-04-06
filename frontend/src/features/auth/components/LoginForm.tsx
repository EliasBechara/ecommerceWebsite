import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthCard from "./AuthCard";
import { useLoginMutation } from "../api/authApi";
import { handleApiError } from "../utils/handleApiError";

// ─── Schema ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(40),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Fields config ────────────────────────────────────────────────────────────
const LOGIN_FIELDS = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "current-password",
  },
];

// ─── Main ────────────────────────────────────────────────────────────────
export const LoginForm = () => {
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginMutation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const handleLogin = async (values: LoginFormValues) => {
    try {
      await loginUser(values).unwrap();
    } catch (err) {
      handleApiError(
        err,
        form.setError,
        "Login failed. Please check your credentials.",
      );
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account"
      fields={LOGIN_FIELDS}
      form={form}
      isLoading={isLoading}
      submitLabel="Sign in"
      footerText="Don't have an account?"
      footerActionLabel="Register"
      onSubmit={handleLogin}
      onFooterAction={() => navigate("/register")}
    />
  );
};
