*   Advanced Rate Limiting: API endpoints (Chat, Orders, Contact) and Admin routes are protected by Upstash Redis to prevent DoS attacks.
*   File Upload Security: Binary signature validation (file-type) to prevent malicious file uploads, plus automatic image compression using Sharp.
*   Error Monitoring: Real-time error tracking and performance tracing via Sentry.
*   Security Headers: Implemented X-Frame-Options, X-Content-Type-Options, and Permissions-Policy in next.config.ts.

---

## 🛠️ Tech Stack

*   Framework: Next.js 16 (App Router, Server Components)
*   Language: TypeScript
*   Styling: Tailwind CSS, Framer Motion
*   Database & Auth: Supabase (PostgreSQL)
*   AI Integration: Google Gemini AI (@google/genai)
*   Email Service: Brevo
*   Rate Limiting: Upstash Redis
*   Error Tracking: Sentry
*   Image Processing: Sharp
*   Deployment: Vercel

---

## 🚀 Getting Started

To run this project locally, follow these steps:

1.  Clone the repository:

    git clone https://github.com/abdelrhmansadeq/mood.git
    cd mood

2.  Install dependencies:

    npm install

3.  Set up Environment Variables:
    Create a .env.local file in the root directory and add the following keys:

    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

    # AI & Emails
    GEMINI_API_KEY=your_gemini_api_key
    BREVO_API_KEY=your_brevo_api_key
    BREVO_SENDER_EMAIL=your_email
    BREVO_SENDER_NAME="Mood"
    BREVO_ADMIN_EMAIL=admin_email

    # Security & Rate Limiting
    UPSTASH_REDIS_REST_URL=your_upstash_url
    UPSTASH_REDIS_REST_TOKEN=your_upstash_token
    CRON_SECRET=your_cron_secret

    # Monitoring
    NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

4.  Run the development server:

    npm run dev

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

---
<div align="center">
  <b>Built with ❤️ by <a href="https://github.com/abdelrhmansadeq">Abdelrhman Sadeq</a></b>
</div>