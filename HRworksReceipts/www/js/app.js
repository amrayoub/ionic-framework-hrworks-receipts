// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ionic.utils'])

.run(function ($localstorage, KindsOfPayment, Currencies, ReceiptKinds, LastCurrency) {
	$localstorage.setObject('receipts', new Array());
	$localstorage.setObject('kindsOfPayment', KindsOfPayment.all());
	$localstorage.setObject('currencies', Currencies.all());
	$localstorage.setObject('receiptKinds', ReceiptKinds.all());
	$localstorage.setObject('lastCurrency', LastCurrency.all());
})

.run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});
})

.config(function ($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider

	// setup an abstract state for the tabs directive
	.state('tab', {
		url : "/tab",
		abstract : true,
		templateUrl : "tabs.html"
	})

	// Each tab has its own nav history stack:

	.state('tab.receipts', {
		url : '/receipts',
		views : {
			'receipts' : {
				templateUrl : 'receipts.html',
				controller : 'receiptsCtrl'
			}
		}
	})
	.state('tab.receipt', {
		url : '/receipt/:guid',
		views : {
			'receipts' : {
				templateUrl : 'receipt.html',
				controller : 'receiptCtrl'
			}
		}
	})

	.state('tab.feedback', {
		url : '/feedback',
		views : {
			'feedback' : {
				templateUrl : 'feedback.html',
				controller : 'feedbackCtrl'
			}
		}
	})

	.state('tab.settings', {
		url : '/settings',
		views : {
			'settings' : {
				templateUrl : 'settings.html',
				controller : 'settingsCtrl'
			}
		}
	})

	.state('tab.infos', {
		url : '/infos',
		views : {
			'infos' : {
				templateUrl : 'infos.html',
				controller : 'infosCtrl'
			}
		}
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/receipts');
	
});