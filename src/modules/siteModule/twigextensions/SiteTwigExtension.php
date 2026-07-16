<?php
/**
 * Site Module for Craft CMS
 *
 * Twig extension stub for registering project-specific functions and filters.
 *
 * @link      https://jalendport.com
 * @copyright Copyright (c) 2026 Jalen Davenport
 */

namespace modules\siteModule\twigextensions;

use Twig\Extension\AbstractExtension;

/**
 * Site Twig extension.
 *
 * @author Jalen Davenport
 * @since 1.0.0
 */
class SiteTwigExtension extends AbstractExtension
{
	/**
	 * Returns the Twig functions registered by this extension.
	 *
	 * @return array
	 * @author Jalen Davenport
	 * @since 1.0.0
	 */
	public function getFunctions(): array
	{
		return [];
	}

	/**
	 * Returns the Twig filters registered by this extension.
	 *
	 * @return array
	 * @author Jalen Davenport
	 * @since 1.0.0
	 */
	public function getFilters(): array
	{
		return [];
	}

	/**
	 * Returns the name of the extension.
	 *
	 * @return string
	 * @author Jalen Davenport
	 * @since 1.0.0
	 */
	public function getName(): string
	{
		return 'Site';
	}
}
