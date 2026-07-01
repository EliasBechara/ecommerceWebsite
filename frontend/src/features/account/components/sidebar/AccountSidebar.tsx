import { Button } from "../../../../components/button/Button";

interface AccountSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const AccountSidebar = ({
    activeTab,
    setActiveTab,
}: AccountSidebarProps) => {
    const tabs = [
        { id: "profile", label: "Profile Details" },
        { id: "orders", label: "Order History" },
        { id: "addresses", label: "Addresses" },
        { id: "security", label: "Security" },
        { id: "logout", label: "Logout" },
    ];

    return (
        <>
            {/* Mobile Navigation */}
            <nav className="flex gap-3 overflow-x-auto pb-2 md:hidden">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    return (
                        <Button
                            key={tab.id}
                            variant="accountSidebarMobile"
                            onClick={() => setActiveTab(tab.id)}
                            className={
                                isActive
                                    ? "bg-greyOneAccent text-zinc-950"
                                    : "border border-zinc-400 text-zinc-700 hover:bg-greyOneAccent/50"
                            }
                        >
                            {tab.label}
                        </Button>
                    );
                })}
            </nav>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:flex-col md:gap-4 md:border-r md:border-zinc-400 md:pr-4">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    return (
                        <Button
                            key={tab.id}
                            variant="accountSidebar"
                            onClick={() => setActiveTab(tab.id)}
                            className={
                                isActive
                                    ? "border-l-4 border-zinc-950 bg-greyOneAccent/70 p-2 font-semibold text-zinc-950"
                                    : "border-b border-zinc-400 text-zinc-700 hover:text-zinc-950"
                            }
                        >
                            {tab.label}
                        </Button>
                    );
                })}
            </nav>
        </>
    );
};