<?php
/**
 * Yii Application Config
 *
 * Edit this file at your own risk!
 *
 * The array returned by this file will get merged with
 * vendor/craftcms/cms/src/config/app.php and app.[web|console].php, when
 * Craft's bootstrap script is defining the configuration for the entire
 * application.
 *
 * You can define custom modules and system components, and even override the
 * built-in system components.
 *
 * If you want to modify the application config for *only* web requests or
 * *only* console requests, create an app.web.php or app.console.php file in
 * your config/ folder, alongside this one.
 *
 * Read more about application configuration:
 * https://craftcms.com/docs/5.x/reference/config/app.html
 */

use craft\helpers\App;

return [
	'id' => App::env('CRAFT_APP_ID') ?: 'CraftCMS',
	'modules' => [
		'site-module' => modules\siteModule\SiteModule::class,
	],
	'bootstrap' => [
		'site-module',
	],
	'components' => [
		'cache' => function() {
			$config = [
				'class' => yii\redis\Cache::class,
				'keyPrefix' => Craft::$app->id,
				'defaultDuration' => Craft::$app->config->general->cacheDuration,

				// Full Redis connection details:
				'redis' => [
					'class' => yii\redis\Connection::class,
					'hostname' => App::env('REDIS_HOSTNAME') ?: 'localhost',
					'port' => App::env('REDIS_PORT') ?: 6379,
					'password' => App::env('REDIS_PASSWORD') ?: null,
				],
			];

			return Craft::createObject($config);
		},
		'deprecator' => [
			'throwExceptions' => App::env('DEV_MODE') ?? false,
		],
		'mailer' => function() {
			// Get the default component config:
			$config = App::mailerConfig();

			// Use Mailpit on dev environments:
			if (App::env('CRAFT_ENVIRONMENT') === 'dev') {
				$adapter = craft\helpers\MailerHelper::createTransportAdapter(
					craft\mail\transportadapters\Smtp::class,
					[
						'host' => App::env('MAILPIT_HOST') ?: 'mailpit',
						'port' => App::env('MAILPIT_PORT') ?: 1025,
					]
				);

				// Override the transport:
				$config['transport'] = $adapter->defineTransport();
			}

			// Return the initialized component:
			return Craft::createObject($config);
		},
	],
];
