# Aditya Malik - Personal Portfolio & Blog

Welcome to the source code of my personal portfolio and web platform. This project serves as a central hub for my professional experience, highlighted projects, technical blog posts, and a 4chan-style anonymous discussion board featuring a built-in colored ASCII art generator.

## 🚀 Features

- **Markdown-Driven Content**: Projects, blogs, experience, and site configuration are all statically managed via local `.md` files for fast edits using tools like Obsidian.
- **Dynamic Projects & Blogs**: Fully responsive project detail and blog pages with rich markdown rendering.
- **Anonymous Forum**: A fully functional, unauthenticated imageboard-style forum with threads and replies.
- **In-Browser ASCII Art Generator**: Upload images to the forum to have them processed client-side into beautiful, colored ASCII art that scales dynamically.
- **Direct Email Contact**: A server-action powered contact form that delivers messages instantly to a personal inbox.
- **Dark Mode First**: Beautiful UI crafted with modern glassmorphism, tailored cyan/green accents, and micro-animations.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **Content**: `react-markdown`, `gray-matter`
- **Icons**: `lucide-react`
- **Deployment**: Vercel

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/M1hawk005/php.git
cd php
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:

```env
# PostgreSQL database for the Forum
POSTGRES_PRISMA_URL="postgresql://postgres:password@localhost:5433/portfolio?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://postgres:password@localhost:5433/portfolio?schema=public"

# Contact Form Delivery
PERSONAL_EMAIL="your.email@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your.email@gmail.com"
SMTP_PASS="your-app-password"
```

### 4. Database Setup
Push the Prisma schema to your local database to set up the forum tables:
```bash
npx prisma db push
```

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Content Management

All personal content is managed statically in the `content/` folder:
- `content/projects/*.md` - Project detail pages and cards
- `content/blog/*.md` - Blog feed and individual blog posts
- `content/site/home.md` - Homepage content including Hero, Bio, Experience, and Education timelines

Profile picture and resume should be placed in `public/avatar.png` and `public/resume.pdf` respectively.

## 📝 License
MIT
