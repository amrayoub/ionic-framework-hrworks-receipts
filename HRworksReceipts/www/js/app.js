// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'ionic.utils', 'validation'])

.run(function ($localstorage, KindsOfPayment, Currencies, ReceiptKinds, LastCurrency, GetCurrentUrl) {
	if($localstorage.getObjects('version').version != 1) {
		$localstorage.setObject('receipts', new Array());
		$localstorage.setObject('kindsOfPayment', new Array());
		$localstorage.setObject('currencies', new Array());
		$localstorage.setObject('receiptKinds', new Array());
		$localstorage.setObject('lastCurrency', new Array());
		$localstorage.setObject('hideAlert', new Array());
		$localstorage.setObject('copyGUID', new Array());
		$localstorage.setObject('user', new Array());
		$localstorage.setObject('version', {
			version : 1
		});
		console.log("Beispiel Daten wurden geladen");
	}
})

.run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		document.addEventListener('focus',function(e){
			e.preventDefault(); e.stopPropagation();
			window.scrollTo(0,0);
		}, true);
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
		}
		if (window.StatusBar) {
			alert("hi");
			console.log(window.StatusBar);
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});
})

.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {

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
	})
	.state('login', {
		url : '/login',
		templateUrl : 'login.html',
		controller : 'loginCtrl'
	})
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/receipts');
});
