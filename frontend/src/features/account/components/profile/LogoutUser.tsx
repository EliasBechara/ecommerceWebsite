import { useLogoutMutation } from "../../../auth/api/authApi";
import { AccountSection } from "../shared/AccountSection";

import { useNavigate } from "react-router-dom";

export const LogoutUser = () => {
    const [logout, { isLoading }] = useLogoutMutation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <AccountSection className="h-50" title="Logout">
            <div className="h-full flex items-center justify-center">
                <div className="w-full max-w-sm bg-greyOneAccent rounded-lg p-4 border border-zinc-200 hover:border-zinc-400 transition-colors shadow-sm flex flex-col items-center gap-5">
                    <p className="text-sm text-gray-600 text-center">
                        You're about to sign out of your account.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="flex-1 h-10 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Signing out..." : "Yes, logout"}
                        </button>
                    </div>
                </div>
            </div>
        </AccountSection>
    );
};