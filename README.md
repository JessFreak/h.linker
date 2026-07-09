# h.linker

A comprehensive web-based platform designed to automate the lifecycle of IT hackathons. The system streamlines event management, facilitates seamless team formation through GitHub insights integration, and provides a dynamic evaluation module for jury members to calculate weighted scores in real-time.

*Note: The comprehensive academic diploma thesis document is available in Ukrainian.*
\
[📄 Read the Full Document (PDF)](docs/Дипломна%20робота.pdf)

## Tech Stack

This project is built as a monorepo using **Nx** and leverages the following technologies:

*   **Frontend:** Angular 21, PrimeNG, ECharts
*   **Backend:** NestJS 11, Prisma ORM, Passport.js (OAuth2 Google/GitHub)
*   **Database:** PostgreSQL
*   **Infrastructure & Tooling:** Docker, GitHub Actions, Jest, ESLint

## Architecture & Diagrams

<details>
<summary><b>1. System Context & Component Architecture (C4 Model)</b></summary>
<br>

The system architecture follows the C4 model specification to describe context, containers, and component relations:

#### Level 1: System Context
![System Context Diagram](docs/C4Diagram1.png)

#### Level 2: Containers
![Containers Diagram](docs/C4Diagram2.png)

#### Level 3: Components
![Components Diagram](docs/C4Diagram3.png)
</details>

<details>
<summary><b>2. Database & Data Models</b></summary>
<br>

The relational database layer is optimized for integrity and analytical aggregation using composite unique constraints and strict reference keys:

* **Entity-Relationship Diagram (ERD):**
  ![ER Diagram](docs/ERDiagram.png)
* **Database Schema Design:**
  ![Database Diagram](docs/DBDiagram.png)
</details>

<details>
<summary><b>3. Business Logic & Access Control</b></summary>
<br>

Detailed behavior modeling for system interactions and UI-driven role restrictions:

* **System Use Cases:**
  ![Use Case Diagram](docs/UseCaseDiagram.png)
* **Frontend Access Control Flow:**
  ![Frontend Access Diagram](docs/FrontendAccessDiagram.png)
* **Backend Class Structure:**
  ![Backend Class Diagram](docs/BackendClassDiagram.png)
</details>

## Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

*   Node.js (v24 or higher recommended)
*   Docker and Docker Compose
*   Git

### 1. Clone the repository

```bash
git clone [https://github.com/JessFreak/h.linker.git](https://github.com/JessFreak/h.linker.git)
cd h.linker
```

### 2. Install dependencies

```bash
npm install

```

### 3. Environment Variables

Create a `.env` file in the root directory of the project and populate it with your specific configuration credentials. Use the following template:

```env
# OAuth Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# OAuth GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
GITHUB_CONNECT_CALLBACK_URL=http://localhost:3000/api/auth/github/connect/callback
GITHUB_SYSTEM_TOKEN=your_github_personal_access_token

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/h_linker_db?schema=public"

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=1d

# Client Application
CLIENT_URL=http://localhost:8080

```

### 4. Running the Application

The project is containerized. You can start the database, backend, and frontend services simultaneously using Docker Compose:

```bash
docker compose up -d --build

```

The backend container is configured to automatically run database migrations (`npx prisma migrate deploy`) and seed the database (`npx prisma db seed`) upon startup.

* **Frontend:** accessible at `http://localhost:8080`
* **Backend API:** accessible at `http://localhost:3000`
* **Database:** accessible on port `5432`

## Testing and Linting

The repository includes scripts to ensure code quality and functionality.

To run the linter across the Nx workspace (ignoring spec files):

```bash
npm run lint
```

To execute the unit test suite (Jest):

```bash
npm run test
```

## CI/CD Pipeline

The project utilizes a fully automated CI/CD pipeline configured via GitHub Actions. The workflow triggers on every push to the `master` branch and consists of three main jobs:

1. **Lint:** Sets up Node.js v24, installs dependencies, and runs the workspace linter to ensure code style consistency.
2. **Test:** Generates the Prisma client and executes the Jest test suite to verify application logic.
3. **Deploy:** Upon successful completion of the lint and test jobs, this step connects to an Azure server via SSH. It pulls the latest changes from the repository, rebuilds the Docker containers without cache, and deploys the updated services while pruning old unused images to optimize server space.
