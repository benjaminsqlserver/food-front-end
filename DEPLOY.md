# Deploying to Google Cloud Run

Nothing needs to be installed on your machine. **Google Cloud Shell** runs in the
browser and already has `gcloud`, Docker and git.

You will need a Google Cloud project with **billing enabled**. Cloud Run's free
tier covers a page like this many times over, but Google requires a billing
account to be attached before it will deploy.

---

## 1. Open Cloud Shell

Go to **<https://shell.cloud.google.com>** and wait for the terminal to appear.

## 2. Get the code

```bash
git clone https://github.com/benjaminsqlserver/food-front-end.git
cd food-front-end
```

## 3. Check the container works *before* deploying

Worth two minutes — it catches any problem locally instead of halfway through a
Cloud Build.

```bash
docker build -t iya-bashirat .
docker run -d -p 8080:8080 --name iya iya-bashirat
```

Confirm the page and, importantly, that the JavaScript modules are served with a
JavaScript content type. If that header is wrong the browser refuses the modules
and the menu and guest book come up empty:

```bash
curl -sI localhost:8080/ | head -n 1
curl -sI localhost:8080/assets/js/main.js | grep -i content-type
curl -sI localhost:8080/site.webmanifest  | grep -i content-type
```

Expect `HTTP/1.1 200 OK`, then a `Content-Type` of `text/javascript` (or
`application/javascript` — both are valid for modules), then
`application/manifest+json`.

To actually look at it, click **Web Preview** (the eye icon, top right of Cloud
Shell) → **Preview on port 8080**.

Then clean up:

```bash
docker rm -f iya
```

## 4. Point at your project

```bash
gcloud config set project YOUR_PROJECT_ID
```

`gcloud projects list` will show your project IDs if you are not sure.

## 5. Deploy

```bash
gcloud run deploy iya-bashirat \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080
```

The first run offers to enable the Cloud Run, Cloud Build and Artifact Registry
APIs — answer `y`. It takes a couple of minutes, then prints your **Service URL**,
something like `https://iya-bashirat-xxxxxxxxxx.europe-west1.run.app`.

`--allow-unauthenticated` is what makes it publicly viewable. Without it, judges
would hit a login wall.

### Choosing a region

`europe-west1` (Belgium) is a reasonable middle for European and American
judges. Alternatives: `us-central1` if the audience is mostly US,
`africa-south1` (Johannesburg) for the lowest latency to Lagos.

### Cold starts

By default the service scales to zero, so the first visitor after an idle period
waits a second or two while the container starts. The image is small and static,
so this is brief. If you would rather it were instant during judging:

```bash
gcloud run services update iya-bashirat --region europe-west1 --min-instances 1
```

That keeps one instance warm and **does bill continuously**, so set it back to
`--min-instances 0` when the challenge is over.

## 6. Put it in the DEV post

```
{% embed https://your-service-url.run.app %}
```

Paste that into the **Demo** section of `SUBMISSION.md`, replacing
`YOUR-LIVE-URL`.

---

## Redeploying after a change

```bash
git pull
gcloud run deploy iya-bashirat --source . --region europe-west1 --allow-unauthenticated --port 8080
```

`index.html` is served with `no-cache`, so a redeploy is visible immediately
rather than sitting behind a stale cache.

---

## What the container does

`Dockerfile` is a single stage on `nginx:1.27-alpine`. There is nothing to
build — no bundler, no dependencies — so it copies `index.html`,
`site.webmanifest` and `assets/`, and nothing else. The launcher scripts, README
and submission draft are excluded by `.dockerignore`.

`deploy/default.conf.template` is the nginx config. The stock nginx entrypoint
substitutes `${PORT}` at container start, which is how Cloud Run tells a
container which port to listen on.

It sets gzip, `no-cache` on the HTML so redeploys land immediately, a one-hour
cache on assets, and a strict `Content-Security-Policy` — the page loads nothing
from any other host, so it can afford one. `frame-ancestors` is left open on
purpose: DEV renders the embed in an iframe, and locking it down would show
judges a blank box.

## Troubleshooting

**"Billing account not found"** — attach billing to the project in the Cloud
console, then retry.

**The page loads but the menu and guest book are empty** — the modules are not
being served as JavaScript. Re-run the `curl` check in step 3.

**"Container failed to start and listen on the port"** — nginx did not bind to
`$PORT`. Confirm you deployed with `--port 8080` and that `ENV PORT=8080` is
still in the `Dockerfile`.
