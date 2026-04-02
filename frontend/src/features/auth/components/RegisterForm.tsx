import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthCard from "./AuthCard";
import { useRegisterMutation } from "../api/authApi";

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(40),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Fields config ────────────────────────────────────────────────────────────

const REGISTER_FIELDS = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      await registerUser(values).unwrap();
      navigate("/login");
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Registration failed. Please try again.";
      form.setError("root", { message });
    }
  };

  return (
    <AuthCard
      title="Create an account"
      subtitle="Get started for free"
      fields={REGISTER_FIELDS}
      form={form}
      isLoading={isLoading}
      submitLabel="Create account"
      footerText="Already have an account?"
      footerActionLabel="Sign in"
      onSubmit={handleRegister}
      onFooterAction={() => navigate("/login")}
    />
  );
};
