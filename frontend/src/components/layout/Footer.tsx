import { Link } from "react-router-dom";
import { Button } from "../button/Button";

export const Footer = () => {
  return (
    <footer className="w-full max-w-6xl px-6 py-4 mt-20 pb-10">
      <div className="flex items-center justify-center gap-x-20 flex-wrap">
        <Button><Link to='/contact'>Contact</Link></Button>
        <Button><Link to='/privacy-policy'>Privacy</Link></Button>
        <Button><Link to='/terms-and-conditions'>Terms</Link></Button>
        <Button><Link to='/returns-and-refunds'>Returns</Link></Button>
      </div>
    </footer>
  );
};
