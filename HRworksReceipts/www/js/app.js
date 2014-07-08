// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'ionic.utils', 'validation', 'pascalprecht.translate'])

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

.run(function ($ionicPlatform, $cordovaDevice) {
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
})

.config(function ($translateProvider) {
	$translateProvider.translations('en', {
		SETTINGS : 'Settings',
		RECEIPTS : 'Receipts',
		INFOS : 'Infos',
		GERMAN : 'German',
		ENGLISH : 'English',
	});
	$translateProvider.translations('de', {
		SETTINGS : 'Einstellungen',
		COMPANYID : 'Firmenkennung',
		CURRENCY : 'W�hrung',
		CURRENCIES : 'W�hrungen',
		ERRORMESSAGE_CURRENCY : 'Bitte w�hlen Sie eine W�hrung aus.',
		PERSONID : 'Benutzerkennung',
		MOBILEPASSWORD : 'Mobiles Passwort',
		TARGETSERVER : 'Zielsever',
		SAVE : 'Speichern',
		FEEDBACK : 'Feedback',
		FEEDBACK_QUESTION : 'Was wollen Sie uns mitteilen?',
		INFOS : 'Infos',
		RECEIPTS : 'Belege',
		SUBJECT : 'Betreff',
		BUG : 'Fehler',
		ADVANCEMENT : 'Verbesserung',
		NEW_FUNCTIONALITY : 'neue Funktionalit�t',
		RECEIPT : 'Beleg',
		SYNCHRONIZE : 'Synchronisieren...',
		DATE : 'Datum',
		ERRORMESSAGE_DATE : 'Bitte geben Sie ein Datum ein.',
		RECEIPTNAME : 'Bezeichnung',
		ERRORMESSAGE_RECEIPTNAME : 'Bitte geben Sie eine Bezeichnung ein.',
		AMOUNT : 'Betrag',
		ERRORMESSAGE_AMOUNT : 'Bitte geben Sie einen Betrag ein.',
		RECEIPTKIND : 'Belegart',
		ERRORMESSAGE_RECEIPTKIND : 'Bitte w�hlen Sie eine Belegart aus.',
		RECEIPTKINDS : 'Belegarten',
		NEWRECEIPT : 'Neuer Beleg',
		KINDOFPYMENT : 'Zahlungsart',
		KINDSOFPYMENT : 'Zahlungsarten',
		ERRORMESSAGE_KINDOFPYMENT : 'Bitte w�hlen Sie eine Zahlungsart aus.',
		LOGIN : 'Anmelung',
		LOGIN_INFO_TEXT : "Verwenden Sie die Firmen-& Benutzerkennung, mit der Sie sich unter www.hrworks.de anmelden. Das mobile Passwort finden Sie in HRworks im Men� Mitarbeiter/Stammdaten/Mobile.",
		EDIT : 'Bearbeiten',
		DELETE : 'L�schen',
		SEND : 'Senden',
		GERMAN : 'Deutsch',
		ENGLISH : 'Englisch',
		INFOS_INFO_Text : 'Anlegen, �ndern und L�schen von Belegen online oder offline.Synchronisierung mit Sammelbelegen (Men� Mitarbeiter/Reisekosten/Sammelbelege) mit Push & Sync. Anmeldung mit Firmenkennung, Benutzerkennung und Mobiles Passwort (Men� Mitarbeiter/Stammdaten/Mobile). Support/Feedback: per E-Mail an mobile.support@hrworks.de',
		
		
		
		
		

	});
	$translateProvider.preferredLanguage('de');
});
