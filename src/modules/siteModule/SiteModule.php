<?php
/**
 * Site Module for Craft CMS
 *
 * Project-specific bootstrap module: wires up controller namespaces, a dedicated
 * log target, and the site Twig extension.
 *
 * @link      https://jalendport.com
 * @copyright Copyright (c) 2026 Jalen Davenport
 */

namespace modules\siteModule;

use Craft;
use craft\console\Application as ConsoleApplication;
use craft\log\MonologTarget;
use craft\web\Application as WebApplication;
use modules\siteModule\twigextensions\SiteTwigExtension;
use Monolog\Formatter\LineFormatter;
use Psr\Log\LogLevel;
use yii\base\Module as BaseModule;

/**
 * Site module.
 *
 * @author Jalen Davenport
 * @since 1.0.0
 */
class SiteModule extends BaseModule
{
	/**
	 * Initializes the module.
	 *
	 * @return void
	 * @author Jalen Davenport
	 * @since 1.0.0
	 */
	public function init(): void
	{
		Craft::setAlias('@modules/siteModule', __DIR__);

		parent::init();

		// Register web controllers
		if (Craft::$app instanceof WebApplication) {
			$this->controllerNamespace = 'modules\\siteModule\\controllers\\web';
		}

		// Register console controllers
		if (Craft::$app instanceof ConsoleApplication) {
			$this->controllerNamespace = 'modules\\siteModule\\controllers\\console';
		}

		// Defer setup tasks until Craft is fully initialized
		Craft::$app->onInit(function() {
			$this->registerTwigExtension();
			$this->_registerLogTarget();
		});
	}

	/**
	 * Registers the site Twig extension.
	 *
	 * @return void
	 * @author Jalen Davenport
	 * @since 1.0.0
	 */
	public function registerTwigExtension(): void
	{
		Craft::$app->view->registerTwigExtension(new SiteTwigExtension());
	}

	/**
	 * Logs an informational message to the module's log target.
	 *
	 * @param string $message the message to log
	 * @return void
	 * @author Jalen Davenport
	 * @since 1.0.0
	 */
	public static function info(string $message): void
	{
		Craft::info($message, 'site-module');
	}

	/**
	 * Logs an error message to the module's log target.
	 *
	 * @param string $message the message to log
	 * @return void
	 * @author Jalen Davenport
	 * @since 1.0.0
	 */
	public static function error(string $message): void
	{
		Craft::error($message, 'site-module');
	}

	/**
	 * Registers a dedicated log target so module-specific logs end up in their own file.
	 *
	 * @return void
	 * @author Jalen Davenport
	 * @since 1.0.0
	 */
	private function _registerLogTarget(): void
	{
		Craft::getLogger()->dispatcher->targets[] = new MonologTarget([
			'name' => 'site-module',
			'categories' => ['site-module'],
			'level' => LogLevel::INFO,
			'logContext' => false,
			'allowLineBreaks' => false,
			'formatter' => new LineFormatter(
				format: "%datetime% %message%\n",
				dateFormat: 'Y-m-d H:i:s',
			),
		]);
	}
}
