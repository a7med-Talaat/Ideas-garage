# 🚗 Idea Garage

### *Where do you park your raw, creative ideas before they get lost in the noise of overcomplicated task managers?*

**Idea Garage** is a clean, modern creative workspace where every idea is represented as a unique car parked in a garage slot. No AI bloat—just a fast, satisfying workspace to capture, sort, and organize your ideas.


---

## Key Features

* 🏎️ **Visual Garage Dashboard**: View and manage your ideas as visually customized car cards parked in designated category sections.
* 🖱️ **Drag-and-Drop Organization**: Drag and drop car cards between category sections to instantly reorganize your workspace.
* 🏁 **Visual Drop Zones**: Drag ideas to the **Exit Door** (to mark them as completed with a celebratory confetti blast) or to the **Archive Lot** (to archive them).
* 🗂️ **Manual Categories & Tagging**: Add custom categories with visual color presets and tag ideas to filter and sort your dashboard manually.
* 🔍 **Fuzzy Instant Search**: Real-time searching across titles, descriptions, categories, and tags.
* ⚡ **Command Palette (Ctrl+K)**: Instant keyboard-driven navigation built specifically for Windows/PC shortcuts.
* 🔐 **Secure Local Authentication**: Multi-user support with secure password hashing and NextAuth session persistence.
* 📥 **Export Options**: Export all of your ideas at any time as grouped Markdown (`.md`) files or clean `.json` data backups.
* 👤 **User Profile Edit**: Update personal details (full name, email address) or update passwords directly from your user avatar menu.

---

## 🛠️ Local Installation & Setup

Follow these steps to run the application locally on your machine.

### 1. Prerequisites
Make sure you have Node.js (v18+) installed on your machine.

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/ideas-garage.git
cd ideas-garage
```

### 3. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 4. Setup Environment Variables
1. Copy the `.env.example` file and create `.env` and `.env.local` files in the root folder:
   ```bash
   cp .env.example .env
   cp .env.example .env.local
   ```
2. Open `.env` and `.env.local` to customize variables if needed. By default, it will save data to a local SQLite database file named `dev.db`.

### 5. Setup the Database
Run the following commands to set up the local database structure and seed default data:
```bash
# Generate database schema
npx prisma migrate dev --name init

# Seed database with a demo account & default templates
npx tsx prisma/seed.ts
```

### 6. Run the Application
Start the Next.js development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔑 Demo Account
After running the database seed script, you can log in with:
* **Email**: `demo@ideasgarage.com`
* **Password**: `demo1234`

---

## 💻 Tech Stack
* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Database Client**: Prisma (SQLite for local storage)
* **Drag and Drop**: `@dnd-kit/core`
* **State Management**: React Query & Zustand
* **Authentication**: NextAuth.js
* **Styles & Animations**: Tailwind CSS + Custom CSS & Framer Motion
* **Charts**: Recharts
