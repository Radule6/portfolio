# radule.dev

Personal developer portfolio for Marko Radulovic -- full-stack engineer building AI-powered data products for fintech.

**Live:** [radule.dev](https://radule.dev)

## Tech Stack

- **Framework:** React 19 + TypeScript 5.8
- **Build:** Vite 6 with static site generation via `vite-react-ssg`
- **Styling:** Tailwind CSS v4 (integrated through `@tailwindcss/vite` plugin)
- **Fonts:** Syne (display) + Outfit (body) loaded via Google Fonts
- **Deployment:** GitHub Actions -> Hostinger via FTPS

## Project Structure

```
src/
  App.tsx                  # Root component with preloader gate
  main.tsx                 # SSG entry point
  index.css                # Theme tokens, animations, utility classes
  components/
    Navigation/            # Sticky nav with mobile menu + theme toggle
    Hero/                  # Animated hero with magnetic cursor orb
    About/                 # Bio and skills bento grid
    Projects/              # Project showcase cards
    Contact/               # Contact form section
    Footer/                # Site footer
    Preloader/             # Staggered letter-reveal loading screen
    ThemeToggle/           # Dark/light mode switch
    MagneticWrap/          # Magnetic hover effect wrapper
```

## Design System

- **Dark theme** by default with a full light theme override
- **Brand gradient:** `#59FFCE -> #B7FF03 -> #FFFF00` (green to lime to yellow)
- **Custom animations:** staggered reveals, kinetic hero entrance, floating orb, marquee, bento card hovers
- Responsive and mobile-first using Tailwind breakpoints up to 3xl

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server                |
| `npm run build`   | TypeScript check + SSG production build |
| `npm run lint`    | Run ESLint                           |
| `npm run preview` | Preview production build locally     |

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that builds the site and deploys the `dist/` output to Hostinger via FTPS. Requires the following GitHub secrets:

- `FTP_HOST`
- `FTP_USERNAME`
- `FTP_PASSWORD`
