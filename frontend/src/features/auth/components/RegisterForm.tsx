import { useNavigate } from "react-router-dom";
import AuthCard from "../../../components/AuthCard";

export const RegisterForm = () => {
  const navigate = useNavigate();

  return (
    <AuthCard
      title="Create an account"
      subtitle="Get started for free"
      fields={[
        { name: "name", label: "Name", placeholder: "Jane Doe" },
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
      submitLabel="Create account"
      footerText="Already have an account?"
      footerActionLabel="Sign in"
      onSubmit={(values) => console.log(values)}
      onFooterAction={() => navigate("/login")}
    />
  );
};
