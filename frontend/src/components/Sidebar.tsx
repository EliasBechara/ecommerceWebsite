import { Link } from "react-router-dom";
import { Button } from "./button/Button";
import { CATEGORIES, ROUTES } from "../routes";

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

export const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-100 bg-greyOne text-white z-50 p-6 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-black">Menu</h2>
          <Button
            onClick={() => setIsSidebarOpen(false)}
            underline={false}
            className="  cursor-pointer text-xl text-black"
          >
            ✕
          </Button>
        </div>

        <nav className="flex flex-col gap-6 text-black pt-10">
          <Button variant={"sidebar"}>Home</Button>
          <Button variant={"sidebar"}>
            <Link to={ROUTES.category(CATEGORIES.GPU)}>GPU</Link>
          </Button>
          <Button variant={"sidebar"}>
            <Link to={ROUTES.category(CATEGORIES.CPU)}>CPU</Link>
          </Button>
          <Button variant={"sidebar"}>Search</Button>
          <Button variant={"sidebar"}>Settings</Button>
        </nav>
      </aside>
    </>
  );
};
