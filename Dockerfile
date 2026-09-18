# Patched ZenML dashboard, layered onto the official zenml-server image.
#
# Upstream ZenML's OSS dashboard build hardcodes the "default" project
# everywhere (src/app/projects/project-list.tsx + searchbar.tsx only ever
# fetch/create the "default" project, even though the OSS server's REST API
# already fully supports listing/creating arbitrary projects). This image
# swaps in a build with that restriction patched out.
#
# Keep the base tag in sync with docker/zenml/docker-compose.yml in the tdew
# repo (currently zenmldocker/zenml-server:0.96.4) and with the zenml[server]
# pin in tdew's pyproject.toml.
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build

FROM zenmldocker/zenml-server:0.96.4
# Path confirmed by inspecting a running 0.96.4 container:
#   docker exec <container> python -c "import zenml,os;print(os.path.dirname(zenml.__file__))"
# -> /opt/venv/lib/python3.11/site-packages/zenml
# If the base tag above is ever bumped to a release using a different Python
# minor version, re-check this path — it's not parameterized.
COPY --from=build --chown=zenml:zenml /app/dist/ /opt/venv/lib/python3.11/site-packages/zenml/zen_server/dashboard/
