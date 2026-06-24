interface AccountSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const AccountSidebar = ({ activeTab, setActiveTab }: AccountSidebarProps) => {
    const tabs = [
        { id: "profile", label: "Profile Details" },
        { id: "orders", label: "Order History" },
        { id: "addresses", label: "Addresses" },
        { id: "security", label: "Security" },
        { id: "logout", label: "Logout" }
    ];

    return (
        <nav className="flex flex-col gap-4 border-r border-zinc-400 pr-4">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-left cursor-pointer pb-2  pl-4 transition-all ${isActive
                            ? "border-l-4 border-zinc-950 font-semibold text-zinc-950 bg-greyOneAccent/70 p-2"
                            : "border-b border-zinc-400 text-zinc-700 hover:text-zinc-950"
                            }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </nav>
    );
};