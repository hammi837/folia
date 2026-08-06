# FOLIA Frontend — React (Vite)

## Layout

```
frontend/
├── public/
└── src/
    ├── assets/
    │   ├── icons/
    │   └── images/
    ├── components/
    │   ├── ui/           # Button, Input, Modal, Badge...
    │   ├── layout/       # Navbar, Footer, Container
    │   ├── home/         # Hero, BentoGrid, TrustBar...
    │   ├── product/      # ProductCard, Filters, Gallery...
    │   └── cart/         # CartDrawer, CartItem...
    ├── pages/            # Route-level screens
    ├── hooks/            # useCart, useAuth, useProducts...
    ├── services/         # API client (axios/fetch)
    ├── store/            # Zustand / context stores
    ├── context/          # AuthProvider etc.
    ├── styles/           # global CSS / Tailwind
    └── utils/            # formatPrice, cn, validators
```

## Pages (planned)

| Route | Page | Purpose |
|---|---|---|
| `/` | `Home.jsx` | Hero, bento, bestsellers |
| `/shop` | `Shop.jsx` | Product grid + filters |
| `/product/:slug` | `ProductDetail.jsx` | PDP |
| `/cart` | `Cart.jsx` | Cart page |
| `/checkout` | `Checkout.jsx` | Checkout flow |
| `/quiz` | `SkinQuiz.jsx` | Skin quiz |
| `/wishlist` | `Wishlist.jsx` | Saved items |
| `/account` | `Account.jsx` | Profile |
| `/orders` | `Orders.jsx` | Order history |
| `/login` | `Login.jsx` | Auth |
| `/register` | `Register.jsx` | Auth |
