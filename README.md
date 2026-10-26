# BizzyQCU

Made by Students. Loved on Campus. QCU student marketplace frontend.

**Stack:** React 18 · Vite · React Router 6 · Tailwind CSS 3 (+ forms, container-queries)

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to /dist
npm run preview  # serve the production build
```

## Structure

```
index.html              Vite entry (fonts, root div)
tailwind.config.js      Brand colors + Plus Jakarta Sans
src/
  main.jsx              React + BrowserRouter bootstrap
  App.jsx               Route table
  index.css             Tailwind layers + hero/shadow/text-glow styles
  components/
    Layout.jsx          Navbar + <Outlet/> + Footer, hash scrolling
    Navbar.jsx, Footer.jsx, Logo.jsx, HeroBackground.jsx
  pages/
    Home.jsx            /
    Login.jsx           /login (credentials + face ID tabs)
    SellerRegister.jsx  /seller-register
    SellerAuth.jsx      /seller-auth?type=entrepreneur|individual|organization
    Placeholder.jsx     /signup, /seller-signup, /dashboard, 404
```

## Notes

- Login and Face ID are simulated with timeouts. Swap in real API / WebAuthn calls in `Login.jsx`.
- `/signup`, `/seller-signup`, `/dashboard` and `/seller-auth` are placeholder pages ready to be built out.
- Tailwind is compiled through PostCSS, so the CDN warning from the old version is gone.
- Old `/pages/...` URLs are now clean routes (`/login`, `/seller-register`), and no server routes are needed in dev. For production hosting, configure SPA fallback to `index.html`.
