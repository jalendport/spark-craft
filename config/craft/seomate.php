<?php
/**
 * SEOMate Configuration
 *
 * Generic starter defaults. Wire the meta maps below up to your own field
 * handles and profiles once your content model is in place.
 *
 * @see https://github.com/vaersaagod/seomate
 */

use craft\helpers\App;

return [
	// Cache generated meta in production only
	'cacheEnabled' => !App::env('DEV_MODE') ?? true,

	// Fallback meta sources. Point these at your own global set fields.
	// 'defaultMeta' => [
	// 	'title' => ['globals.seoTitle'],
	// 	'description' => ['globals.seoDescription'],
	// 	'image' => ['globals.seoImage'],
	// ],

	// Per-element meta sources. Add profiles keyed to your field handles.
	// 'defaultProfile' => 'standard',
	// 'fieldProfiles' => [
	// 	'standard' => [
	// 		'title' => ['seoTitle', 'title'],
	// 		'description' => ['seoDescription'],
	// 		'image' => ['seoImage'],
	// 	],
	// ],

	'additionalMeta' => [
		'referrer' => 'no-referrer-when-downgrade',
		// Only allow indexing in production
		'robots' => App::env('CRAFT_ENVIRONMENT') === 'production' ? 'all' : 'noindex, nofollow',

		'og:type' => 'website',
		'og:site_name' => '{{ siteName }}',
		'twitter:card' => 'summary_large_image',
	],

	'includeSitenameInTitle' => true,
	'sitenameTitleProperties' => ['title', 'og:title', 'twitter:title'],
	'sitenamePosition' => 'after',
	'sitenameSeparator' => '|',

	'sitemapEnabled' => true,
	'sitemapLimit' => 100,
	// Add your sitemap sources once sections exist.
	// 'sitemapConfig' => [
	// 	'elements' => [
	// 		'homepage' => ['changefreq' => 'weekly', 'priority' => 1],
	// 	],
	// ],
];
