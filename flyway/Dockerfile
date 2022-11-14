FROM flyway/flyway:9.8.1-alpine

LABEL version="1-9.8.1-alpine"
LABEL repository="http://github.com/sittercity/github-actions/flyway"
LABEL homepage="http://github.com/sittercity/github-actions/flyway"
LABEL maintainer="Sittercity"
LABEL "com.github.actions.name"="Flyway"
LABEL "com.github.actions.description"="Wraps the Flyway CLI to enable Flyway commands"
USER root
RUN ln -s `pwd`/flyway /usr/local/bin/
USER flyway

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]