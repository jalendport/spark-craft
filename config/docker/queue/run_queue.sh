#!/bin/sh

set -e

# Source the .env file
if [ -f .env ]; then
	export $(grep -v '^#' .env | xargs)
fi

echo "Waiting for the MySQL container to respond"
until eval "mysql -h $CRAFT_DB_SERVER -u $CRAFT_DB_USER -p$CRAFT_DB_PASSWORD $CRAFT_DB_DATABASE -e 'select 1' > /dev/null 2>&1"
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
