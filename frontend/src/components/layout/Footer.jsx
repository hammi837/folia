import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-folia-sand bg-folia-mist">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-display text-2xl tracking-[0.08em]">FOLIA</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-folia-ink/65">
            Botanical formulas distilled into calm daily rituals. Honest ingredients, quiet
            packaging, skin that feels like itself.
          </p>
          <Link
            to="/about"
            className="mt-4 inline-block text-sm text-folia-moss underline-offset-4 hover:underline"
          >
            About us →
          </Link>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-folia-moss">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-folia-ink/75">
            <li>
              <Link to="/" className="hover:text-folia-moss">
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-folia-moss">
                Shop all
              </Link>
            </li>
            <li>
              <Link to="/quiz" className="hover:text-folia-moss">
                Skin quiz
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-folia-moss">
                Wishlist
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-folia-moss">
                About us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-folia-moss">Help</p>
          <ul className="mt-4 space-y-2 text-sm text-folia-ink/75">
            <li>
              <Link to="/about#shipping" className="hover:text-folia-moss">
                Shipping & returns
              </Link>
            </li>
            <li>
              <Link to="/about#contact" className="hover:text-folia-moss">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-folia-moss">
                Track orders
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-folia-moss">
                My account
              </Link>
            </li>
            <li>
              <Link to="/quiz" className="hover:text-folia-moss">
                Ritual finder
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-folia-moss">Care</p>
          <ul className="mt-4 space-y-2 text-sm text-folia-ink/75">
            <li>Free shipping over $65</li>
            <li>30-day calm guarantee</li>
            <li>Clean formulas only</li>
            <li>Cruelty-free</li>
            <li>
              <a href="mailto:hello@folia.beauty" className="hover:text-folia-moss">
                hello@folia.beauty
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-folia-sand/60">
        <div className="mx-auto flex max-w-site flex-col gap-2 px-4 py-5 text-xs text-folia-ink/50 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <span>© {new Date().getFullYear()} FOLIA · Clean beauty, distilled.</span>
          <div className="flex flex-wrap gap-4">
            <Link to="/about" className="hover:text-folia-moss">
              About
            </Link>
            <Link to="/about#shipping" className="hover:text-folia-moss">
              Shipping
            </Link>
            <Link to="/about#contact" className="hover:text-folia-moss">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
