# Scraper

A web-scraping application built with **Next.js**, **React**, and **TypeScript**, with **Playwright**, **Axios**, and **Firebase** included in the project stack.

> **Note:** Update the project description and configuration examples below to match the current implementation and the environment variables used by your app.

## Features

- **Next.js application** — modern React-based application structure.
- **TypeScript** — type-safe application development.
- **Web requests** — Axios is available for making HTTP requests.
- **Browser automation** — Playwright is included for browser-based scraping workflows.
- **Firebase integration** — Firebase client and Admin SDK packages are included.
- **Reusable UI components** — Radix UI, Lucide icons, and Tailwind CSS 4 tooling.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| [Next.js](https://nextjs.org/) | Application framework |
| [React](https://react.dev/) | User interface |
| [TypeScript](https://www.typescriptlang.org/) | Static typing |
| [Axios](https://axios-http.com/) | HTTP requests |
| [Playwright](https://playwright.dev/) | Browser automation |
| [Firebase](https://firebase.google.com/) | Firebase services |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Radix UI](https://www.radix-ui.com/) | Accessible UI primitives |
| [Lucide](https://lucide.dev/) | Icons |

## Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) (use a version compatible with the installed Next.js release)
- npm (included with Node.js)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/jaffrey33/scraper.git
cd scraper
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

If the application uses Firebase or other external services, create a `.env.local` file in the project root and add the variables required by your implementation.

Example **only** — replace these names with the actual variables referenced in your source code:

```env
# Add the environment variables required by your application.
# Never commit real API keys, credentials, or service-account secrets.
```

For Firebase Admin credentials, prefer secure server-side environment configuration. Do not expose Admin SDK credentials or private keys through variables prefixed with `NEXT_PUBLIC_`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The development server supports hot reloading as you edit files.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Creates a production build |
| `npm run start` | Starts the production server (run after building) |
| `npm run lint` | Runs ESLint |

Build and run the production version locally:

```bash
npm run build
npm run start
```

## Project Structure

The repository currently includes the following top-level directories and configuration files:

```text
scraper/
├── app/                  # Next.js routes, pages, and application logic
├── components/           # Reusable UI components
├── context/              # React context and shared state
├── lib/                  # Shared utilities and service integrations
├── public/                # Static assets
├── scripts/               # Utility and automation scripts
├── types/                 # TypeScript type definitions
├── .github/workflows/     # GitHub Actions workflows
├── package.json           # Dependencies and npm scripts
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── README.md
```

## Scraping Notes

The repository includes Axios and Playwright, which support different scraping approaches:

- **Axios** can request pages or APIs and retrieve response data.
- **Playwright** can automate a browser and interact with pages that rely on client-side JavaScript.

Use the approach that matches the target website. Website structure, authentication requirements, rate limits, and anti-bot protections can affect results.

Before scraping a website:

1. Check its Terms of Service and `robots.txt`.
2. Respect applicable privacy, copyright, and data-protection requirements.
3. Use reasonable request rates and avoid unnecessary repeated requests.
4. Protect credentials and personal data.
5. Handle request failures, timeouts, and changes to page structure.

The exact scraping workflow, supported targets, input format, and output format should be documented here once verified against the application's current source code.

## Deployment

This is a Next.js application and can be deployed to a compatible Node.js host or a platform such as [Vercel](https://vercel.com/).

Before deploying:

1. Configure all required environment variables in the hosting platform.
2. Ensure secrets are stored securely and are not included in client-side bundles.
3. Verify that any browser automation dependencies are supported by the deployment environment.
4. Run a production build:

   ```bash
   npm run build
   ```

5. Test the deployed application and confirm that any external services are configured correctly.

**Important:** Playwright browser binaries and operating-system dependencies may require additional setup on some hosting platforms. Follow the deployment provider's guidance for the chosen runtime.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a branch for your changes.
3. Make and test your changes.
4. Open a pull request describing the changes.

## License

No license information was verified from the repository overview. Add a `LICENSE` file and update this section if you intend to distribute the project under an open-source license.

## Repository

[https://github.com/jaffrey33/scraper](https://github.com/jaffrey33/scraper)
