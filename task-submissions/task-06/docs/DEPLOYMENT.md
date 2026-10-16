# Setup and deployment guide

Free-tier features, screens and limits change over time. These steps describe the usual flow; check each
provider's current documentation if something looks different. None of the steps below were run by the
author of this guide; a deployment is only "verified" once you have completed the checklist at the end.

## 1. MongoDB Atlas

1. Sign in at <https://www.mongodb.com/cloud/atlas>, create a project (for example `fixflow`) and a free
   (M0) cluster. Choose the region closest to where the API will run.
2. **Database Access** > **Add New Database User**. Choose password authentication, use a generated strong
   password, and under privileges choose **Specific Privileges** > role `readWrite` on database `fixflow`.
   (If you will run the optional integration tests, also add `readWrite` on `fixflow_test`.)
   Keep the password in a password manager.
3. **Network Access** > **Add IP Address** > **Add Current IP Address** for local work. Do not leave
   `0.0.0.0/0` (anywhere) in place longer than necessary. See "Hosting and Atlas network access" below for the API host.
4. **Database** > **Connect** > **Drivers**. Copy the `mongodb+srv://...` string. Insert the database name
   `fixflow` before the `?` and replace `<password>` with your real password. If the password contains
   special characters such as `@` or `#`, URL-encode them.
5. Paste the result into `server/.env` as `MONGODB_URI`. Run `npm run dev`; the console prints
   `[database] connected` on success. A wrong password or blocked IP prints a failure and exits.

Never put this string in `client/`, in screenshots, in documentation or in a GitHub commit.

## 2. API on Render (Web Service)

1. Upload the project to your GitHub repository, then in Render choose
   **New** > **Web Service** and connect the repository.
2. Settings:

| Setting | Value |
|---|---|
| Root Directory | `task-submissions/task-06/server` |
| Runtime | Node |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/v1/health` |

   (`--include=dev` is needed because TypeScript is a dev dependency and Render sets `NODE_ENV=production`.)
3. Environment variables (Render's **Environment** tab, not in the repository):

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas string |
| `CLIENT_ORIGIN` | the exact URL of your deployed client, for example `https://fixflow-client.onrender.com` (no path, no trailing slash) |
| `NODE_VERSION` | `22` |

4. After the first deploy, open `https://<your-api>.onrender.com/api/v1/health`.

### Hosting and Atlas network access

Render's free web services do not have a single fixed outbound IP address, so Atlas must allow Render's
addresses. The widest option is `0.0.0.0/0`; a narrower option is to add the outbound IP ranges Render
publishes for your region (find them in Render's current documentation). If you use `0.0.0.0/0`, rely on a
strong, least-privilege database user and remove the entry when you no longer need the demo.

## 3. Client as a static site

Use a different host from the API or the same provider. On Render choose **New** > **Static Site**:

| Setting | Value |
|---|---|
| Root Directory | `task-submissions/task-06/client` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Environment variable | `VITE_API_BASE_URL` = `https://<your-api>.onrender.com/api/v1` |

The app has no client-side routes, so no rewrite rules are needed, and the build uses relative asset paths so
it also works from a sub-folder.

**About GitHub Pages:** it can host the built `client/dist` folder, but do not change the repository's Pages
source to a new GitHub Actions workflow without checking first: your earlier tasks may be published from the
current Pages setting and switching it could take them offline. A separate static host avoids that risk.

Order matters for CORS: deploy the API, deploy the client, then set the API's `CLIENT_ORIGIN` to the client's real
URL and redeploy the API.

## 4. Verification checklist (record results in `docs/TEST_PLAN.md`)

- [ ] API health URL returns `200` with `"database":"up"`.
- [ ] The client loads and lists records from the API (open the browser network tab: requests go to the API URL, not localhost).
- [ ] Create, edit and delete each work from the deployed client.
- [ ] Refreshing the page keeps the changes (persistence).
- [ ] No CORS error in the browser console.
- [ ] Run the Postman collection with `baseUrl` set to the deployed API.
- [ ] Note that a free instance may take a while to wake after being idle.
