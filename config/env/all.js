'use strict';

module.exports = {
	app: {
		title: 'Wello Snake',
		description: 'A new and totally-different-from-the-Wello-Fridge version of Wello Snake for Canvas2D',
		keywords: 'snake, canvas, raf, angular, node'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/underscore/underscore.js',
				'public/lib/angular/angular.min.js',
				'public/lib/angular-resource/angular-resource.min.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		scss: [
			'public/modules/**/css/*.scss'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};