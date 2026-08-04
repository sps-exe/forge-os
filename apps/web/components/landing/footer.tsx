import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-border/20 py-12 bg-black">
      <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
        <Logo />
        <p className="text-muted-foreground text-sm">Built for developers who ship every day.</p>
      </div>
    </footer>
  );
}
