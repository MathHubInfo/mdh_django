# Stage 1: Build the frontend
FROM node:12 as frontend
WORKDIR /app/frontend/
ADD frontend .
RUN yarn && yarn build

# Stage 2: Build the backend + add the frontend to it
FROM python:3.7-alpine

# Add requirements and install dependencies
WORKDIR /app/
ADD requirements.txt /app/
ADD requirements-prod.txt /app/

# Add dependencies
RUN mkdir -p /var/www/admin/static/ \
    && apk add --no-cache bash postgresql-libs postgresql-client pcre-dev mailcap \
    && apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev linux-headers python3-dev \
    && pip install -r requirements.txt -r requirements-prod.txt --no-cache-dir \
    && apk --purge del .build-deps

# Install Django App, configure settings and copy over djano app
ADD manage.py /app/
ADD mdh/ /app/mdh/
ADD mdh_data/ /app/mdh_data/
ADD mdh_provenance/ /app/mdh_provenance/
ADD mdh_schema/ /app/mdh_schema/
ADD mhd_tests/ /app/mhd_tests/
ADD mddl_catalog/ /app/mddl_catalog/

### ALL THE CONFIGURATION

ENV DJANGO_SETTINGS_MODULE "mdh.docker_settings"
ENV DJANGO_SECRET_KEY ""
ENV DJANGO_ALLOWED_HOSTS "localhost"
ENV DJANGO_DB_ENGINE "django.db.backends.sqlite3"
ENV DJANGO_DB_NAME "/data/mdh.db"
ENV DJANGO_DB_USER ""
ENV DJANGO_DB_PASSWORD ""
ENV DJANGO_DB_HOST ""
ENV DJANGO_DB_PORT ""

# Copy over static files
RUN DJANGO_SECRET_KEY=setup python manage.py collectstatic --noinput
COPY --from=frontend /app/frontend/build /var/www/frontend/build

# Add uwsgi config and entrypoint
ADD docker/entrypoint.sh /entrypoint.sh
ADD docker/uwsgi.ini /uwsgi.ini

# Volume and ports
VOLUME /data/
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["uwsgi", "--ini", "/uwsgi.ini"]