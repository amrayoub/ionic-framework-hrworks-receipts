// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'ionic.utils', 'validation', 'pascalprecht.translate'])

.run(function ($localstorage, LastCurrency, GetCurrentUrl) {
	
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
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
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
		templateUrl : "templates/tabs.html"
	})

	// Each tab has its own nav history stack:

	.state('tab.receipts', {
		url : '/receipts',
		views : {
			'receipts' : {
				templateUrl : 'templates/receipts.html',
				controller : 'receiptsCtrl'
			}
		}
	})
	.state('tab.receipt', {
		url : '/receipt/:guid',
		views : {
			'receipts' : {
				templateUrl : 'templates/receipt.html',
				controller : 'receiptCtrl'
			}
		}
	})

	.state('tab.feedback', {
		url : '/feedback',
		views : {
			'feedback' : {
				templateUrl : 'templates/feedback.html',
				controller : 'feedbackCtrl'
			}
		}
	})

	.state('tab.settings', {
		url : '/settings',
		views : {
			'settings' : {
				templateUrl : 'templates/settings.html',
				controller : 'settingsCtrl'
			}
		}
	})

	.state('tab.infos', {
		url : '/infos',
		views : {
			'infos' : {
				templateUrl : 'templates/infos.html',
				controller : 'infosCtrl'
			}
		}
	})
	.state('login', {
		url : '/login',
		templateUrl : 'templates/login.html',
		controller : 'loginCtrl'
	})
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/receipts');
})

.config(function ($translateProvider) {
	$translateProvider.translations('en', {
		ADVANCEMENT : 'Advancement',
		AMOUNT : 'AMOUNT',
		BUG : 'BUG',
		CHOOSE_CURRENCY : 'Choose Currency',
		CHOOSE_KINDOFPAYMENT : 'Choose Kindofpayment',
		CHOOSE_RECEIPTKIND : 'Choose Receiptkind',
		COMPANYID : 'Companyid',
		CURRENCIES : 'Currencies',
		CURRENCY : 'Currency',
		DATE : 'Date',
		DELETE : 'Delete',
		EDIT : 'Edit',
		ENGLISH : 'English',
		ERRORMESSAGE_AMOUNT : 'Amount is required.',
		ERRORMESSAGE_CURRENCY : 'Currency is required.',
		ERRORMESSAGE_DATE : 'Date is required.',
		ERRORMESSAGE_KINDOFPYMENT : 'Kind of Payment is required.',
		ERRORMESSAGE_RECEIPTKIND : 'Receipt Kind is required.',
		ERRORMESSAGE_RECEIPTNAME : 'Description is required.',
		ERRORMESSAGE_AMOUNTNOTVALIDE : 'sfdg',
		FEEDBACK : 'Feedback',
		FEEDBACK_QUESTION : 'About what do you want to inform us?',
		GERMAN : 'German',
		INFOS : 'Infos',
		INFOS_INFO_TEXT : 'Creating, Editing and Deleting of costs online or offline. Synchronising with accumulative receipts (Menu Employee/Travel Costs/Accumulative Receipts) with click in Sync. Login with company-ID, User-ID and the Mobile Password (Menu Employee/Master Data/Mobile). Support/Feedback: By E-Mail to mobile.support@hrworks.de',
		KINDOFPYMENT : 'Kind of Payment',
		KINDSOFPYMENT : 'Kinds of Payment',
		LOGIN : 'Login',
		LOGIN_INFO_TEXT : "Verwenden Sie die Firmen-& Benutzerkennung, mit der Sie sich unter www.hrworks.de anmelden. Das mobile Passwort finden Sie in HRworks im Men&uuml; Mitarbeiter/Stammdaten/Mobile.",
		MOBILEPASSWORD : 'Mobile Password',
		NEWRECEIPT : 'New Receipt',
		NEW_FUNCTIONALITY : 'new Functionality',
		PERSONID : 'Person Id',
		RECEIPT : 'Receipt',
		RECEIPTKIND : 'Receipt Kind',
		RECEIPTKINDS : 'Receipt Kinds',
		DESCRIPTION : 'Description',
		RECEIPTS : 'Receipts',
		SAVE : 'Save',
		SEND : 'Send',
		SETTINGS : 'Settings',
		SUBJECT : 'Subject',
		SYNCHRONIZE : 'Synchronize...',
		TARGETSERVER : 'Target Server',
		ALLCURRENCIES : 'All Currencies',
		FAVORITES : 'Favorites'
	});
	$translateProvider.translations('de', {
		ADVANCEMENT : 'Verbesserung',
		AMOUNT : 'Betrag',
		BUG : 'Fehler',
		CANCEL : 'Abbrechen',
		OK : 'Ok',
		CHOOSE_CURRENCY : 'W&auml;hrung w&auml;hlen',
		CHOOSE_KINDOFPAYMENT : 'Zahlungsart w&auml;hlen',
		CHOOSE_RECEIPTKIND : 'Belegart w&auml;hlen',
		COMPANYID : 'Firmenkennung',
		CURRENCIES : 'W&auml;hrungen',
		CURRENCY : 'W&auml;hrung',
		DATE : 'Datum',
		ENDDATE : 'Abreise Datum',
		DELETE : 'L&ouml;schen',
		EDIT : 'Bearbeiten',
		EDIT_RECEIPT : 'Beleg Bearbeiten',
		ENGLISH : 'Englisch',
		ERROR : 'Fehler',
		ERRORMESSAGE_AMOUNT : 'Bitte geben Sie einen Betrag ein.',
		ERRORMESSAGE_CURRENCY : 'Bitte w&auml;hlen Sie eine W&auml;hrung aus.',
		ERRORMESSAGE_DATE : 'Bitte geben Sie ein Datum ein.',
		ERRORMESSAGE_ENDDATE : 'Bitte geben Sie ein Enddatum ein.',
		ERRORMESSAGE_ENDDATETOLOW : 'Datum der Abreise liegt vor der Anreise.',
		ERRORMESSAGE_KINDOFPYMENT : 'Bitte w&auml;hlen Sie eine Zahlungsart aus.',
		ERRORMESSAGE_RECEIPTKIND : 'Bitte w&auml;hlen Sie eine Belegart aus.',
		ERRORMESSAGE_DESCRIPTION : 'Bitte geben Sie eine Bezeichnung ein.',
		ERRORMESSAGE_PERSONS : 'Bitte geben Sie die Personen ein.',
		ERRORMESSAGE_REASON : 'Bitte geben Sie einen Grund an.',
		ERRORMESSAGE_PLACE : 'Bitte geben Sie einen Ort ein.',
		ERRORMESSAGE_AMOUNTNOTVALIDE : 'Bitte geben Sie einen gültigen Betrag ein.',
		FEEDBACK : 'Feedback',
		FEEDBACK_QUESTION : 'Was wollen Sie uns mitteilen?',
		GERMAN : 'Deutsch',
		INFOS : 'Infos',
		INFOS_INFO_TEXT : 'Anlegen, &auml;ndern und L&ouml;schen von Belegen online oder offline.Synchronisierung mit Sammelbelegen (Men&uuml; Mitarbeiter/Reisekosten/Sammelbelege) mit Push & Sync. Anmeldung mit Firmenkennung, Benutzerkennung und Mobiles Passwort (Men&uuml; Mitarbeiter/Stammdaten/Mobile). Support/Feedback: per E-Mail an mobile.support@hrworks.de',
		KINDOFPYMENT : 'Zahlungsart',
		KINDSOFPYMENT : 'Zahlungsarten',
		LOGIN : 'Anmelung',
		LOGIN_INFO_TEXT : "Verwenden Sie die Firmen-& Benutzerkennung, mit der Sie sich unter www.hrworks.de anmelden. Das mobile Passwort finden Sie in HRworks im Men&uuml; Mitarbeiter/Stammdaten/Mobile.",
		MOBILEPASSWORD : 'Mobiles Passwort',
		NEWRECEIPT : 'Neuer Beleg',
		NEW_FUNCTIONALITY : 'neue Funktionalit&auml;t',
		PERSONID : 'Benutzerkennung',
		RECEIPT : 'Beleg',
		REASON : 'Grund der Bewirtung',
		PERSONS : 'Bewirtete Personen',
		PLACE : 'Ort der Bewirtung',
		RECEIPTKIND : 'Belegart',
		RECEIPTKINDS : 'Belegarten',
		DESCRIPTION : 'Bezeichnung',
		RECEIPTS : 'Belege',
		SAVE : 'Speichern',
		SEND : 'Senden',
		SETTINGS : 'Einstellungen',
		SUBJECT : 'Betreff',
		SYNCHRONIZE : 'Synchronisieren...',
		TARGETSERVER : 'Zielserver',
		ALLCURRENCIES : 'Alle W&auml;hrungen',
		FAVORITES : 'Favoriten',
		SEARCH : 'Suche...',
		OPTIONS : 'Belegoptionen:',
		COPYRECEIPT : 'Beleg Kopieren',
		COPYRECEIPT_INFO : 'Der Beleg wird gespeichert und kopiert! Wollen Sie diese Aktion durchf&uuml;hren?<br><input type="checkbox" ng-model="hideData.hideAlert"><font size="2"> Diese Meldung nicht mehr anzeigen.</font>',
		COPYRECEIPT_ERROR : 'Der Beleg konnte nicht kopiert werden, da nicht alle Felder ausgef&uuml;llt sind.'
		
	});
	$translateProvider.preferredLanguage('de');
});
