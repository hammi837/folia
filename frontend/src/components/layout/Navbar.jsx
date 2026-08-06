import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-folia-sand/80 bg-folia-cream/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-display text-2xl tracking-wide">
          FOLIA
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/shop">Shop</Link>
          <Link to="/quiz">Skin Quiz</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}
