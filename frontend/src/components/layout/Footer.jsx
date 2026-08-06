import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-folia-sand/80 bg-folia-mist/40">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-2xl tracking-[0.08em]">FOLIA</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-folia-ink/65">
            Botanical formulas distilled into calm daily rituals. Honest ingredients,
            quiet packaging, skin that feels like itself.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-folia-moss">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-folia-ink/75">
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
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-folia-moss">Care</p>
          <ul className="mt-4 space-y-2 text-sm text-folia-ink/75">
            <li>Free shipping over $65</li>
            <li>30-day calm guarantee</li>
            <li>hello@folia.beauty</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-folia-sand/60">
        <div className="mx-auto flex max-w-site items-center justify-between px-4 py-5 text-xs text-folia-ink/50 md:px-6">
          <span>© {new Date().getFullYear()} FOLIA</span>
          <span>Clean beauty, distilled.</span>
        </div>
      </div>
    </footer>
  );
}
