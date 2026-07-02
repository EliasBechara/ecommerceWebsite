import { ProfileDetails } from "../components/profile-details/ProfileDetails";
import { UserAddresses } from "../../addresses/components/UserAddresses";
import { UserSecurityDetails } from "../components/security/UserSecurityDetails";
import { UserOrderHistory } from "../../order/components/UserOrderHistory";
import { LogoutUser } from "../components/session/LogoutUser";

export const ACCOUNT_TABS = [
    { id: "profile", label: "Profile Details", component: ProfileDetails },
    { id: "orders", label: "Order History", component: UserOrderHistory },
    { id: "addresses", label: "Addresses", component: UserAddresses },
    { id: "security", label: "Security", component: UserSecurityDetails },
    { id: "logout", label: "Logout", component: LogoutUser },
] as const;

export type AccountTabId = (typeof ACCOUNT_TABS)[number]["id"];