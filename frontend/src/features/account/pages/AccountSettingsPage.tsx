import { useState } from "react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { AccountSidebar } from "../components/sidebar/AccountSidebar";
import { ProfileDetails } from "../components/profile/ProfileDetails";
import { UserAddresses } from "../../addresses/components/UserAddresses";
import { UserSecurityDetails } from "../components/profile/UserSecurityDetails";
import { UserOrderHistory } from "../../order/components/UserOrderHistory";
import { LogoutUser } from "../components/profile/LogoutUser";

export const AccountSettingsPage = () => {
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile" },
        { id: "addresses", label: "Addresses" },
        { id: "security", label: "Security" },
        { id: "orders", label: "Orders" },
        { id: "logout", label: "Logout" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile":
                return <ProfileDetails />;

            case "addresses":
                return <UserAddresses />;

            case "security":
                return <UserSecurityDetails />;

            case "orders":
                return <UserOrderHistory />;

            case "logout":
                return <LogoutUser />;

            default:
                return null;
        }
    };

    return (
        <PageLayout>
            <div className="container mx-auto max-w-4xl px-4 py-10">
                <div className="flex flex-col gap-8 md:flex-row md:gap-12">
                    <aside className="w-full md:w-1/4">
                        <AccountSidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </aside>

                    <main className="w-full md:w-3/4">
                        {renderTabContent()}
                    </main>
                </div>
            </div>
        </PageLayout>
    );
};