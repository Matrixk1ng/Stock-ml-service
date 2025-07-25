# Full-Stack Stock Analysis Dashboard

A comprehensive, full-stack stock analysis application designed to provide users with real-time market data, detailed stock information, and powerful screening tools. The application features a robust Java Spring Boot backend for data aggregation and a dynamic, responsive Next.js frontend for a seamless user experience.

**Live Demo:**
* **Frontend (Vercel):** `[https://stock-analysis-teal.vercel.app]`

---

## Key Features

### Frontend (Next.js & React)
* **Live Dashboard:** A real-time overview of the market, including major indices (S&P 500, Nasdaq Composite) with data that polls automatically for fresh updates.
* **Dynamic Stock Detail Pages:** A dedicated page for each stock featuring live price quotes and interactive historical price charts with multi-timeframe views (1D, 5D, 1M, 1Y).
* **Interactive Stock Screener:** A powerful client-side tool that allows users to filter thousands of US stocks by sector, market cap, and price to discover investment ideas.
* **Instant Autocomplete Search:** A global search bar that provides instant search results from a pre-fetched list of all US symbols for a fast and frictionless user experience.
* **General & Company-Specific News:** A dedicated news page for market-wide updates and context-specific news on individual stock pages.
* **Secure OAuth Login:** A clean, modern login page that supports secure sign-in with Google.(in development not live yet)

### Backend (Spring Boot & Java)
* **Multi-Source API Aggregation:** A robust REST API that connects to multiple third-party financial data providers (Finnhub, Financial Modeling Prep) to serve a wide range of data.
* **Performance-Optimized Caching:** A server-side caching layer implemented with Spring Cache to dramatically reduce redundant API calls, improve response times, and stay within external API rate limits.
* **JWT-Based Authentication:** A secure authentication flow using Google OAuth2. After a successful login, the backend generates a custom JWT to manage user sessions for subsequent API requests.
* **Database Integration:** Connects to a PostgreSQL database (hosted on Supabase) with Spring Data JPA to manage user data, portfolios, and watchlists.
* **Cloud Deployment:** The backend is deployed and running live on Heroku, providing a stable and accessible API for the frontend application.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React, Next.js, TypeScript, SWR, Recharts, Tailwind CSS |
| **Backend** | Java, Spring Boot, Spring Security, Spring Data JPA, Maven |
| **Database** | PostgreSQL (hosted on Supabase) |
| **Deployment** | Vercel (Frontend), Heroku (Backend), Git/GitHub |

---

## Getting Started

### Prerequisites
* Java 21+
* Node.js & npm
* Maven
* Heroku CLI
* A PostgreSQL database (e.g., from Supabase)
* API keys from Finnhub and Financial Modeling Prep

### Backend Setup (`/server`)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Matrixk1ng/StockAnalysis.git]
    cd StockAnalysis/server
    ```

2.  **Configure Environment Variables:**
    Create an `application.properties` file in `src/main/resources/` and add your secret keys and database URL. Use the provided `.properties` file in the source code as a template, replacing the placeholder values.

3.  **Run the application:**
    ```bash
    ./mvnw spring-boot:run
    ```
    The backend server will start on `http://localhost:8080`.

### Frontend Setup (`/client`)

1.  **Navigate to the client directory:**
    ```bash
    cd ../client 
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the `client` directory and add the backend API URL:
    ```
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
    ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.
