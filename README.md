# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Google sign-in setup

The login and sign-up forms use the Google Identity Services authorization-code
popup. Both send the code to the existing API and store the returned application
JWT, just like email login.

1. Create a **Web application** OAuth client in Google Cloud and configure the
   consent screen. Add the frontend origins (for example `http://localhost:8080`
   and your production origin) to **Authorized JavaScript origins**.
2. Set `VITE_GOOGLE_CLIENT_ID` in `.env.local` to the public client ID. Optionally
   set `VITE_API_URL` to the backend origin. See `.env.example`. Restart Vite after
   changing environment variables. Never put the Google client secret in a Vite
   environment variable.
3. Implement `POST /api/auth/google` on the backend with the following contract:

   ```json
   { "code": "google-authorization-code", "redirectUri": "https://your-frontend.example" }
   ```

   Exchange the one-time code with Google using the server-side client ID and
   secret. For this popup flow, the exchange's `redirect_uri` is the frontend
   origin. Validate `redirectUri` against your configured frontend origins before
   using it; configure CORS for those origins as well. Verify the returned Google
   ID token's signature, issuer, audience, expiry, and verified-email claim.
   Identify Google users by the token's `sub`; create a customer when needed and
   use the backend's secure account-linking policy for existing email accounts.
   Do not grant administrator access during signup.
4. Return `{ "token": "your-application-jwt" }`. That JWT must work with the
   existing `/api/auth/me`, profile, checkout, and order endpoints.

The backend is maintained outside this repository. Its endpoint and Google
configuration must be deployed before Google sign-in can succeed. Missing
configuration, blocked or closed popups, and API failures show an error and allow
the customer to retry or continue with email.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
