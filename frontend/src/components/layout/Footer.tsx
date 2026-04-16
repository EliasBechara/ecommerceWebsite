import { Button } from "./button/Button";

export const Footer = () => {
  return (
    <footer className="w-full max-w-6xl px-6 py-4 mt-20 pb-10">
      <div className="flex items-center justify-center gap-x-20 flex-wrap">
        <Button>copyright</Button>
        <Button>contact</Button>
        <Button>Privacy</Button>
        <Button>Terms</Button>
        <Button>Returns</Button>
      </div>
    </footer>
  );
};
