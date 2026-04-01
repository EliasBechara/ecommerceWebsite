import { useNavigate } from "react-router-dom";
import AuthCard from "../../../components/AuthCard";

export const LoginForm = () => {
  const navigate = useNavigate();

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account"
      fields={[
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
      ]}
      submitLabel="Sign in"
      footerText="Don't have an account?"
      footerActionLabel="Register one right now!"
      onSubmit={(values) => console.log(values)}
      onFooterAction={() => navigate("/register")}
    />
  );
};
