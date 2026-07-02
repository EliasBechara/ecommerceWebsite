import { useState } from "react";
import { PageLayout } from "../../../components/layout/PageLayout";
import { AccountSidebar } from "../components/sidebar/AccountSidebar";
import { ACCOUNT_TABS, type AccountTabId } from "../utils/tabs";


export const AccountSettingsPage = () => {
    const [activeTab, setActiveTab] = useState<AccountTabId>("profile");

    const ActiveComponent =
        ACCOUNT_TABS.find((tab) => tab.id === activeTab)?.component ?? null;

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
                        {ActiveComponent && <ActiveComponent />}
                    </main>
                </div>
            </div>
        </PageLayout>
    );
};