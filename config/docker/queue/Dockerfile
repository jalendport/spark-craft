FROM jalendport/spark-php:8.0-cli

ARG UID
ARG GID

ENV UID=${UID:-1000}
ENV GID=${GID:-1000}

# MacOS staff group's gid is 20; so is the dialout group in alpine linux. We're not using it so let's just remove it.
RUN delgroup dialout

RUN deluser www-data

RUN addgroup -g ${GID} --system spark
RUN adduser -G spark --system -D -s /bin/sh -u ${UID} spark

USER spark

CMD ["php", "craft", "queue/listen", "--verbose"]
