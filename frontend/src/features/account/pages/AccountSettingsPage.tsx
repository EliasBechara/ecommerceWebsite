import { useState } from "react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { AccountSidebar } from "../components/AccountSidebar";
import { ProfileDetails } from "../components/ProfileDetails";
import { UserAddresses } from "../components/UserAddresses";
import { UserSecurityDetails } from "../components/UserSecurityDetails";
import { UserOrderHistory } from "../components/UserOrderHistory";

export const AccountSettingsPage = () => {
    const [activeTab, setActiveTab] = useState<string>("profile");

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile":
                return <ProfileDetails />

            case "addresses":
                return <UserAddresses />

            case "security":
                return <UserSecurityDetails />

            case "orders":
                return <UserOrderHistory />

            default:
                return null;
        }
    };

    return (
        <PageLayout>
            <div className="container mx-auto max-w-6xl px-4 flex flex-row gap-12 pt-10 min-h-screen">
                <div className="w-1/4">
                    <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                <div className="w-3/4">
                    {renderTabContent()}
                </div>

            </div>
        </PageLayout>
    );
};