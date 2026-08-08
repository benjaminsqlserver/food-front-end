# Static site on nginx. There is nothing to build — no bundler, no dependencies,
# no package manager — so this is a single stage that copies files and serves them.

FROM nginx:1.27-alpine

# Cloud Run injects PORT at runtime. Defaulting it here means the same image
# also runs locally with `docker run -p 8080:8080` and no extra flags.
ENV PORT=8080

# The official nginx entrypoint runs envsubst over /etc/nginx/templates/*.template
# before starting. It substitutes only variables that actually exist in the
# environment, so ${PORT} is replaced while nginx's own $uri and $host survive.
COPY deploy/default.conf.template /etc/nginx/templates/default.conf.template

WORKDIR /usr/share/nginx/html

# Copy only what the site actually serves. The launcher scripts, README,
# submission draft and git metadata have no business in a container.
COPY index.html site.webmanifest ./
COPY assets ./assets

EXPOSE 8080
