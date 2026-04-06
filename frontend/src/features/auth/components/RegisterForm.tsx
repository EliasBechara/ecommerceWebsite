import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthCard from "./AuthCard";
import { useRegisterMutation } from "../api/authApi";
import { handleApiError } from "../utils/handleApiError";

// ─── Schema ───────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(40, "Password must be at most 40 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const REGISTER_FIELDS = [
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
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "new-password",
  },
];

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onChange",
    delayError: 600,
  });

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = values;
      await registerUser(payload).unwrap();
      navigate("/login");
    } catch (err) {
      handleApiError(
        err,
        form.setError,
        "Registration failed. Please try again.",
      );
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
