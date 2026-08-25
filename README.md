# Week 9 — Tasks Client

A Next.js App Router frontend for the **Week 8 Authenticated Tasks API**.

The application provides authentication, protected task management, API-driven status filtering, task creation, task deletion, error handling, automated tests, and GitHub Actions CI.

---

## Tech Stack

- Next.js 16.3.2
- React 19
- TypeScript
- Tailwind CSS
- Jest
- React Testing Library
- Testing Library User Event
- GitHub Actions
- Week 8 NestJS API
- PostgreSQL through the Week 8 API

---

## Features

- User sign-in with email and password
- JWT token-based authentication
- Session persistence using `localStorage`
- Client-side authentication guard
- Automatic redirect to `/login` when signed out
- Automatic session clearing on API `401 Unauthorized`
- Protected `/tasks` page
- Fetch tasks from the Week 8 API
- Loading, error, empty, and results states
- API-driven status filtering through `GET /tasks?status=`
- Create tasks through `POST /tasks`
- Display API validation errors beside the relevant fields
- Keep form values when task creation fails
- Delete tasks through `DELETE /tasks/:id`
- Correct handling of `204 No Content`
- Centralized API requests through `lib/api.ts`
- Centralized browser storage through `lib/session.ts`
- Automated tests with mocked `fetch`
- GitHub Actions CI
- Builds and tests successfully without the API running

---

## Project Structure

```text
week-9-tasks-client/
│
├── app/
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── tasks/
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── AuthProvider.tsx
│   ├── AuthGuard.tsx
│   └── CreateTaskForm.tsx
│
├── lib/
│   ├── api.ts
│   ├── session.ts
│   └── types.ts
│
├── __tests__/
│   ├── api-auth.test.ts
│   ├── tasks.test.tsx
│   ├── create-task.test.tsx
│   └── helpers/
│       └── mockFetch.ts
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .env.example
├── .gitignore
├── jest.config.ts
├── jest.setup.ts
├── package.json
├── package-lock.json
└── README.md
```

---

## Environment Variables

The application uses the following environment variable:

NEXT_PUBLIC_API_URL=

This variable contains the base URL of the Week 8 API.

For local development, create a .env.local file:

NEXT_PUBLIC_API_URL=http://localhost:3001

The .env.local file is intentionally ignored by Git and must not be committed.

The repository contains .env.example:

NEXT_PUBLIC_API_URL=

No API host or port is hardcoded inside app/, components/, or lib/.

If NEXT_PUBLIC_API_URL is missing, the application still supports building and testing. The API wrapper falls back to an empty base URL and allows requests to fail visibly instead of silently pointing to another developer's machine.

---

## Installation

Clone the repository and enter the project directory:

git clone <YOUR_GITHUB_REPOSITORY_URL>

cd week-9-tasks-client

Install dependencies:

npm ci

Create .env.local:

NEXT_PUBLIC_API_URL=http://localhost:3001

---

## Running the Week 8 API

The Week 9 client communicates with the Week 8 NestJS API.

Open a separate terminal and start the Week 8 API:

cd week-8-authenticated-tasks-api

npm run start:dev

The Week 8 API should be available at:

http://localhost:3001

The API provides endpoints such as:

POST /auth/register
POST /auth/login
GET /tasks
GET /tasks/:id
POST /tasks
PATCH /tasks/:id
DELETE /tasks/:id

The Week 9 client does not connect directly to PostgreSQL. Database operations are handled by the Week 8 API.

---

## Running the Week 9 Client

Open another terminal:

cd week-9-tasks-client

Start the development server:

npm run dev

The client runs at:

http://localhost:3000

Open:

http://localhost:3000

The Week 8 API and Week 9 client therefore run side by side:

Week 8 API → http://localhost:3001

Week 9 Client → http://localhost:3000

---

## Creating an Account

If a user does not already have an account, register through the Week 8 API.

Using Postman or Thunder Client, send:

POST http://localhost:3001/auth/register

with:

{
"name": "Your Name",
"email": "your@email.com",
"password": "yourpassword"
}

The password must satisfy the validation rules implemented by the Week 8 API.

After successful registration, use the same email and password on the Week 9 /login page.

---

## Signing In

Open:

http://localhost:3000/login

Enter the registered email and password.

The client sends:

POST /auth/login

to the Week 8 API.

A successful response contains an access token:

{
"access_token": "JWT_TOKEN"
}

The token is stored in browser localStorage.

After successful authentication, the user is redirected to:

/tasks

---

## Authentication

The client uses JWT authentication.

The authentication flow is:

Login Form
↓
POST /auth/login
↓
Week 8 API validates credentials
↓
API returns access_token
↓
Token stored in localStorage
↓
User redirected to /tasks
↓
API requests include Authorization header

Authenticated API requests include:

Authorization: Bearer <token>

The Authorization header is attached centrally inside:

lib/api.ts

Individual pages and components do not manually construct the authorization header.

---

## Session Storage

The token is stored in browser localStorage.

Storage access is centralized in:

lib/session.ts

This module is responsible for:

Reading the token
Saving the token
Clearing the token
Reading basic user information from the JWT

The application does not use:

middleware.ts
httpOnly authentication cookies
Server-side token storage
Server Components for task fetching

Authentication-dependent UI is handled by Client Components.

---

## Why localStorage?

localStorage is used because the Week 9 exercise explicitly requires the JWT token to live in browser storage.

The main benefit is simplicity and direct access from Client Components.

The main cost is security:

JavaScript running on the page can access the token.
An XSS vulnerability could potentially expose the token.
It does not provide the same protection against JavaScript access that an httpOnly cookie can provide.

For a production application, token storage would require additional security considerations.

---

## Authentication Guard

The /tasks page is protected by a client-side authentication guard.

If there is no session:

/tasks
↓
No token
↓
/login

Authenticated users can access /tasks.

After signing out:

localStorage token
↓
cleared
↓
Protected UI removed
↓
/login

The application does not leave stale authenticated task data rendered after sign-out.

---

## Handling 401 Unauthorized

A 401 Unauthorized response can occur from any authenticated API request.

The rule is implemented centrally inside:

lib/api.ts

For authenticated requests, a 401 causes the client to:

Clear the stored session.
Redirect the user to /login.

Individual pages and components do not implement their own 401 handling.

The exception is:

POST /auth/login

A 401 from login means the credentials are incorrect, so the login form displays the API's error message instead of treating it as an expired session.

---

## Tasks

The protected task page is:

/tasks

Tasks are loaded from:

GET /tasks

The token is automatically attached by lib/api.ts.

The page renders four distinct states.

Loading

Displayed while the API request is in progress.

Loading tasks...
Error

Displayed when loading tasks fails.

A Try Again button allows the request to be retried.

Empty

Displayed when the API successfully returns:

[]

The empty state is not treated as a loading state or an error.

Results

Displayed when the API returns one or more tasks.

Each task is rendered as an individual row/card.

---

## Status Filtering

The task page provides a status filter:

All Statuses
Todo
In Progress
Done

Selecting a status re-requests the API.

For example:

GET /tasks?status=todo

or:

GET /tasks?status=in_progress

or:

GET /tasks?status=done

Filtering is performed by the Week 8 API.

The browser does not download all tasks and filter them locally.

---

## Creating a Task

Tasks are created using:

POST /tasks

The request is sent through:

lib/api.ts

The create form supports:

Title
Description
Status
Priority
Project ID
Assignee ID

A successful 201 response returns the newly created task.

The new task is immediately added to the task list without reloading the page.

---

## Validation Errors

The Week 8 API returns validation errors using its error envelope.

For example:

{
"statusCode": 400,
"message": [
"title must be longer than or equal to 3 characters",
"priority must not be greater than 5"
],
"error": "Bad Request",
"timestamp": "...",
"path": "/tasks"
}

The API wrapper converts this into a typed ApiError.

Known validation messages are mapped to the corresponding form fields.

For example:

title → Title error
priority → Priority error
projectId → Project ID error

Unknown validation messages are displayed in the form-level error region.

When task creation fails:

The form is not cleared.
The user's entered values remain available.
Validation messages are displayed beside the relevant inputs.

---

## Deleting a Task

Tasks are deleted using:

DELETE /tasks/:id

The Week 8 API returns:

204 No Content

A 204 response has no response body, so lib/api.ts does not attempt to parse JSON.

After a successful delete, the task is removed from the UI without a page reload.

If deletion fails:

The task remains visible.
An error message is displayed.

---

## Centralized API Wrapper

All API requests are made through:

lib/api.ts

The application does not call fetch() directly from pages, components, or hooks.

The wrapper:

Builds the request URL
Attaches the JWT when a session exists
Adds appropriate request headers
Handles JSON responses
Handles 204 No Content
Decodes API error responses
Throws a typed ApiError
Handles 401 Unauthorized

The only direct fetch() call in the application is inside:

lib/api.ts

---

## Browser Storage

All browser storage access is centralized in:

lib/session.ts

No other module directly accesses localStorage.

This keeps authentication storage logic separate from UI components and API request logic.

---

## Testing

The project uses:

Jest
jsdom
React Testing Library
Testing Library User Event
Mocked fetch

Tests do not require:

A running Week 8 API
PostgreSQL
A database
Network access
API secrets

The test setup mocks fetch, so the tests are isolated from external services.

---

## Test Files

There are three required test specifications.

1. API Authorization
   **tests**/api-auth.test.ts

Tests that:

The Authorization: Bearer <token> header is attached when signed in.
The Authorization header is absent when signed out.

2. Tasks List
   **tests**/tasks.test.tsx

Tests that:

One row is rendered for each task returned by the API.
The empty state is rendered when the API returns an empty array.

3. Create Task
   **tests**/create-task.test.tsx

Tests that:

A newly created task is added to the list after a successful 201.
An API 400 validation message is rendered against the relevant input.
Form values remain populated after a validation failure.

---

## Running Tests

Run all tests:

npm test

Expected result:

Test Suites: 3 passed, 3 total
Tests: 6 passed, 6 total

Run an individual test file:

npm test -- api-auth.test.ts
npm test -- tasks.test.tsx
npm test -- create-task.test.tsx

The tests pass with the Week 8 API stopped.

---

## Production Build

Create an optimized production build:

npm run build

The build does not require the Week 8 API to be running.

The application supports building when:

NEXT_PUBLIC_API_URL

is not configured.

This ensures that the build process does not depend on a running backend API.

---

## Continuous Integration

GitHub Actions is configured in:

.github/workflows/ci.yml

The workflow runs on:

Push
Pull request

The workflow uses:

Ubuntu
Node.js 20
npm ci
npm run build
npm test

The CI workflow does not require:

PostgreSQL
Week 8 API
Database services
API secrets

The workflow verifies that the client can be installed, built, and tested independently.

---

## CI Workflow

The workflow performs the following steps:

Checkout repository
↓
Setup Node.js 20
↓
npm ci
↓
npm run build
↓
npm test

The repository includes:

package-lock.json

so that npm ci can install the dependency tree defined by the project.

---

## GitHub Actions Workflow

The workflow is located at:

.github/workflows/ci.yml

It contains:

name: CI

on:
push:
pull_request:

jobs:
build-and-test:
runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

---

## Architecture Rules

This project follows the Week 9 architectural requirements.

API Requests

All API requests go through:

lib/api.ts

No page, component, or hook directly calls fetch().

Storage

All browser storage access goes through:

lib/session.ts
Authentication

Authentication-dependent UI is implemented using Client Components.

Route Guard

The /tasks route is protected by a client-side guard.

Token

The JWT token is stored in browser localStorage.

API Filtering

Task status filtering is performed by the API through:

GET /tasks?status=

Server Components

The task list is not fetched from a Server Component.

Middleware

No middleware.ts is used for authentication.

Cookies

The application does not use an httpOnly authentication cookie.

---

## Verification Checklist

The Week 9 client implements the following requirements:

Next.js App Router application
TypeScript
Tailwind CSS
Separate client repository
Week 8 API integration
NEXT_PUBLIC_API_URL environment variable
.env.example
Real .env files ignored
No API host hardcoded in application source
API requests centralized in lib/api.ts
Browser storage centralized in lib/session.ts
Authorization header added centrally
Typed API errors
401 session handling
Login form
Login validation
Client-side authentication guard
Session restoration
Sign-out
Protected /tasks page
Loading state
Error state
Empty state
Results state
API-driven status filtering
Task creation
400 validation mapping
Form values preserved after validation failure
Task deletion
204 No Content handling
Three required test specifications
Mocked fetch
Jest with jsdom
GitHub Actions CI
Node.js 20 in CI
npm ci in CI
npm run build in CI
npm test in CI
package-lock.json
Build works without the API running
Tests work without the API running
No database required for tests
No API secrets required for CI

---

## Useful Commands

Install dependencies:

npm ci

Start development server:

npm run dev

Create production build:

npm run build

Start production server:

npm start

Run tests:

npm test

Check TypeScript:

npx tsc --noEmit

Check Git status:

git status

##Running Both Projects Together

Terminal 1 — Week 8 API

cd week-8-authenticated-tasks-api

npm run start:dev

API:

http://localhost:3001

Terminal 2 — Week 9 Client

cd week-9-tasks-client

npm run dev

Client:

http://localhost:3000

The client uses:

NEXT_PUBLIC_API_URL=http://localhost:3001

---

## Demo Flow

The Week 9 demo can be performed in the following order:

Start the Week 8 API.
Start the Week 9 client.
Open /login.
Sign in using an existing account.
Show the redirect to /tasks.
Show the task list.
Show the loading, error, empty, or results behavior.
Change the status filter.
Confirm that a new API request is made with ?status=.
Create a valid task.
Show that it appears without a page reload.
Submit invalid task data.
Show the API validation message beside the relevant input.
Confirm that the entered form values remain.
Delete a task.
Confirm that the task disappears after the 204 response.
Sign out.
Confirm that the authenticated UI is cleared.
Attempt to access /tasks.
Confirm that the user is redirected to /login.

---

## Authentication Explanation for Demo

The token is obtained from:

POST /auth/login

The token is stored in:

localStorage

The API wrapper reads the session token and attaches:

Authorization: Bearer <token>

to authenticated API requests.

A 401 Unauthorized can happen from any authenticated API request, including:

GET /tasks
POST /tasks
DELETE /tasks/:id
Other protected API requests

The centralized API wrapper handles these 401 responses by clearing the session and redirecting the user to /login.

The login request is the exception because its 401 means that the supplied credentials are incorrect. The login form displays that error instead of treating it as an expired session.

---

## Security Considerations

This project uses localStorage for the JWT because it is an explicit requirement of the Week 9 exercise.

However, localStorage has an important security trade-off:

JavaScript can access the stored token.

Therefore, an XSS vulnerability could potentially expose the token.

A production authentication architecture may use more secure approaches such as carefully configured httpOnly, Secure, and SameSite cookies, depending on the application's architecture and threat model.

This project intentionally follows the requirements of the Week 9 exercise rather than implementing a production cookie-based authentication architecture.

---

## API Dependency

The application depends on the Week 8 API for real task data.

The client does not use:

Hardcoded task fixtures as application data
A mock server
A local database
Fake API responses during normal development

Mocks are used only inside automated tests.

The development application communicates with the real Week 8 API.

---

## Build and Test Independence

The client is intentionally designed so that:

npm run build

and:

npm test

do not require the Week 8 API to be running.

The API URL is read from:

NEXT_PUBLIC_API_URL

and the API wrapper does not throw simply because the variable is missing.

Tests mock fetch, so they do not make real network requests.

---

## Project Status

Week 9 Tasks Client implementation is complete according to the specified Week 9 exercise requirements.

Current local verification:

TypeScript PASS
Production Build PASS
Jest Tests PASS
CI Configuration PASS

The three required test suites are:

**tests**/api-auth.test.ts
**tests**/tasks.test.tsx
**tests**/create-task.test.tsx

Current test result:

3 test suites passed
6 tests passed

---

## 👨‍💻 Developer

**Muhammad Haris**

GitHub: https://github.com/hariskhan-136

---

## 🎓 Internship

**Coding Pixel Full-Stack Internship Program**

**Week 9 — Tasks Client**

**Repository created for Week 9 Tasks Client internship exercise**
