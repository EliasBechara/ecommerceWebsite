import { Link } from "react-router-dom";
import { Button } from "../button/Button";
import { CATEGORIES, ROUTES } from "../../router/routes";
import { SidePanel } from "../sidePanel/SidePanel";
import { useUIOverlay } from "../../features/ui/hooks/useUIOverlay";

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

export const NavSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: SidebarProps) => {

  const { open } = useUIOverlay();


  const handleOpenSearchBar = () => {
    setIsSidebarOpen(false)
    open("search")
  }


  return (
    <>
      <SidePanel
        isSidePanelOpen={isSidebarOpen}
        setIsSidePanelOpen={setIsSidebarOpen}
        position="left"
      >
        <div className="flex justify-between items-center mb-8"></div>

        <nav className="flex flex-col gap-6 text-black pt-10">
          <Button variant={"sidebar"}>
            <Link to={ROUTES.category(CATEGORIES.GPU)}>Home</Link>
          </Button>
          <Button variant={"sidebar"}>
            <Link to={ROUTES.category(CATEGORIES.GPU)}>GPU</Link>
          </Button>
          <Button variant={"sidebar"}>
            <Link to={ROUTES.category(CATEGORIES.CPU)}>CPU</Link>
          </Button>
          <Button variant={"sidebar"} onClick={handleOpenSearchBar}>Search</Button>
          <Button variant={"sidebar"}>
            <Link to={'/account'}>Account Settings</Link>
          </Button>
        </nav>
      </SidePanel>
    </>
  );
};
