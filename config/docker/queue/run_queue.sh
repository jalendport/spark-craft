#!/bin/sh

set -e

# Source the .env file; set -a exports everything it defines, and quoted
# values containing spaces survive intact where a grep|xargs pipeline
# would split them on whitespace.
if [ -f .env ]; then
	set -a
	. ./.env
	set +a
fi

echo "Waiting for the MySQL container to respond"
# --skip-ssl: the MariaDB client would otherwise negotiate TLS and reject
# the MySQL container's self-signed certificate, hanging this gate forever.
until eval "mysql --skip-ssl -h $CRAFT_DB_SERVER -u $CRAFT_DB_USER -p$CRAFT_DB_PASSWORD $CRAFT_DB_DATABASE -e 'select 1' > /dev/null 2>&1"
do
	sleep 1
done

echo "Waiting for vendor/autoload.php"
while [ ! -f "vendor/autoload.php" ] || [ ! -f "composer.lock" ]
do
	sleep 1
done

echo "Waiting for Craft to be installed"
until eval "php craft install/check"
do
	sleep 30
done

exec "$@"
