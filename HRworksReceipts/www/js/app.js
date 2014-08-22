// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'ionic.utils', 'ui.bootstrap.datetimepicker', 'pascalprecht.translate'])

.run(function ($localstorage, $translate, $cordovaSplashscreen, $ionicPlatform) {
	// Initialize the localStorage if the app was open for the first time
	if ($localstorage.getObjects('version').version != 1) {
		$localstorage.setObject('receipts', new Array());
		$localstorage.setObject('kindsOfPayment', new Array());
		$localstorage.setObject('currencies', new Array());
		$localstorage.setObject('receiptKinds', new Array());
		$localstorage.setObject('lastCurrency', new Array());
		$localstorage.setObject('hideAlert', new Array());
		$localstorage.setObject('copyGUID', new Array());
		$localstorage.setObject('user', new Array());

		var userLanguage = window.navigator.userLanguage || window.navigator.language;
		if (userLanguage == "de" || userLanguage == "de-DE" || userLanguage == "de_DE") {
			userLanguage = "de";
		} else {
			userLanguage = "en";
		}
		$localstorage.setObject('language', {
			language : userLanguage
		});
		$localstorage.setObject('version', {
			version : 1
		});
	}
	$translate.use($localstorage.getObjects('language').language);
})

.run(function ($ionicPlatform, $localstorage, $cordovaDevice, $cordovaNetwork, $ionicLoading, getData) {
	$ionicPlatform.ready(function () {
		document.addEventListener('focus', function (e) {
			e.preventDefault();
			e.stopPropagation();
			window.scrollTo(0, 0);
		}, true);
		
		if($cordovaNetwork.isOnline() && typeof $localstorage.getObjects('user').personId === 'string') {
			$ionicLoading.show({
				templateUrl : 'templates/synchronize.html',
			});
			var promise = getData.all();
			promise.then(function () {
				$ionicLoading.hide();
			});
		}
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		} 
		// Initialize the statusbar for iOS
		if (window.StatusBar) {
			StatusBar.styleLightContent();
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

// Translations
.config(function ($translateProvider) {
	$translateProvider.translations('en', {
		ADVANCEMENT : 'Advancement',
		ALLCURRENCIES : 'All Currencies',
		ALTERNATIVE_AMOUNTPICKER : 'alternative Amountpicker',
		ALTERNATIVE_DATEPICKER : 'alternative Datepicker',
		AMOUNT : 'Amount',
		BUG : 'Bug',
		CANCEL : 'Cancel',
		CHOOSE_CURRENCY : 'Choose Currency',
		CHOOSE_DATE: 'Choose date',
		CHOOSE_KINDOFPAYMENT : 'Choose Kind of Payment',
		CHOOSE_RECEIPTKIND : 'Choose Receipt Kind',
		COMPANYID : 'Company-Id',
		COPYOF : 'Copy of',
		COPYRECEIPT : 'Copy Receipt',
		COPYRECEIPT_ERROR : 'Please enter the entire data before copying the receipt.',
		COPYRECEIPT_INFO : 'Are you sure to copy this receipt?<br><input type="checkbox" ng-model="hideData.hideAlert"><font size="2"> Do not ask again.</font>',
		CURRENCIES : 'Currencies',
		CURRENCY : 'Currency',
		DATE : 'Date',
		DELETE : 'Delete',
		DELETERECEIPT : 'Delete Receipt',
		DELETERECEIPT_TEMPLATE : 'Do you realy want to delete this receipt?',
		DESCRIPTION : 'Description',
		EDIT : 'Edit',
		EDIT_RECEIPT : 'Edit Receipt',
		ENDDATE : 'End Date',
		ENGLISH : 'English',
		ERROR : 'Error',
		ERRORMESSAGE_AMOUNT : 'Amount is mandatory.',
		ERRORMESSAGE_AMOUNTNOTVALIDE : 'Please choose a valid amount.',
		ERRORMESSAGE_CURRENCY : 'Currency is mandatory.',
		ERRORMESSAGE_DATE : 'Date is mandatory.',
		ERRORMESSAGE_DESCRIPTION : 'Description is mandatory.',
		ERRORMESSAGE_ENDDATE : 'End Date is mandatory.',
		ERRORMESSAGE_ENDDATETOLOW : 'Inconsistent data: Date of departure is before arrival date.',
		ERRORMESSAGE_KINDOFPYMENT : 'Kind of Payment is Mandatory.',
		ERRORMESSAGE_PERSONS : 'Please enter at least two names separated with a comma.',
		ERRORMESSAGE_PLACE : 'Place is mandatory.',
		ERRORMESSAGE_REASON : 'Reason is mandatory.',
		ERRORMESSAGE_RECEIPTKIND : 'Receipt Kind is madatory.',
		ERROR_SETTINGS_TEMPLATE : 'Your authentication data is incorrect.',
		ERROR_SETTINGS_TITLE : 'Error:',
		FAVORITES : 'Favorites',
		FEEDBACK : 'Feedback',
		FEEDBACK_QUESTION : 'Do you have questions regarding the application or would you like to tell us something? ',
		GERMAN : 'German',
		INFOS : 'Infos',
		INFOS_INFO_TEXT : 'Creating, Editing and Deleting of costs online or offline. Synchronising with accumulative receipts (Menu Employee/Travel Costs/Accumulative Receipts) with click in Sync. Login with company-ID, User-ID and the Mobile Password (Menu Employee/Master Data/Mobile). Support/Feedback: By E-Mail to <a href="mailto:mobile.support@hrworks.de?subject=HRworks-App">mobile.support@hrworks.de</a><br><br>In case you focus the field "Date" and no Datepicker opens, please activate "alternative Datepicker" in the settings.',
		KINDOFPYMENT : 'Kind of Payment',
		KINDSOFPYMENT : 'Kinds of Payment',
		LOGIN : 'Login',
		LOGIN_INFO_TEXT : 'Please enter the company and user ID of your HRworks account. The mobile Password is located in menu Employee/Master Data/Mobile  <br> Support/Feedback: By E-Mail to <a href="mailto:mobile.support@hrworks.de?subject=HRworks-App">mobile.support@hrworks.de</a>',
		MOBILEPASSWORD : 'Mobile Password',
		NEWRECEIPT : 'New Receipt',
		NEW_FUNCTIONALITY : 'New Functionality',
		NO : 'No',
		NOANSWERFROMTHESERVER_TEMPLATE : 'Please try again later.',
		NOANSWERFROMTHESERVER_TITLE : 'No answer from server',
		NOINTERNETACCESS_TEMPLATE : 'Please check your internet access.',
		NOINTERNETACCESS_TITLE : 'No Internet Access',
		OK : 'Ok',
		OPTIONS : 'Options',
		PERSONID : 'Person-Id',
		PERSONS : 'Persons',
		PLACE : 'Place',
		PLEASEWAIT : 'Please wait...',
		REASON : 'Reason',
		RECEIPT : 'Receipt',
		RECEIPTKIND : 'Receipt Kind',
		RECEIPTKINDS : 'Receipt Kinds',
		RECEIPTOVERVIEW : 'Receipts',
		RECEIPTS : 'Receipts',
		SAVE : 'Save',
		SEARCH : 'Search...',
		SEND : 'Send',
		SETTINGS : 'Settings',
		SUBJECT : 'Subject',
		SUCCESS_SETTINGS_TEMPLATE : 'Your settings were updated.',
		SUCCESS_SETTINGS_TITLE : 'Success',
		SYNCHRONIZE : 'Synchronize...',
		TARGETSERVER : 'Targetserver',
		WRONGCREDENTIALS_TEMPLATE : 'Your authentication data is incorrect.',
		WRONGCREDENTIALS_TITLE : 'Authentication error:',
		YES : 'Yes'
	});

	$translateProvider.translations('de', {
		ADVANCEMENT : 'Verbesserung',
		ALLCURRENCIES : 'Alle W&auml;hrungen',
		ALTERNATIVE_AMOUNTPICKER : 'alternative Betragseingabe',
		ALTERNATIVE_DATEPICKER : 'alternative Datumsauswahl',
		AMOUNT : 'Betrag',
		BUG : 'Fehler',
		CANCEL : 'Abbrechen',
		CHOOSE_CURRENCY : 'W&auml;hrung w&auml;hlen',
		CHOOSE_DATE : 'Datum ausw&auml;hlen',
		CHOOSE_KINDOFPAYMENT : 'Zahlungsart w&auml;hlen',
		CHOOSE_RECEIPTKIND : 'Belegart w&auml;hlen',
		COMPANYID : 'Firmenkennung',
		COPYOF : 'Kopie von',
		COPYRECEIPT : 'Beleg Kopieren',
		COPYRECEIPT_ERROR : 'Der Beleg konnte nicht kopiert werden, da nicht alle Felder ausgef&uuml;llt sind.',
		COPYRECEIPT_INFO : 'Der Beleg wird gespeichert und kopiert! Wollen Sie diese Aktion durchf&uuml;hren?<br><input type="checkbox" ng-model="hideData.hideAlert"><font size="2"> Diese Meldung nicht mehr anzeigen.</font>',
		CURRENCIES : 'W&auml;hrungen',
		CURRENCY : 'W&auml;hrung',
		DATE : 'Datum',
		DELETE : 'L&ouml;schen',
		DELETERECEIPT : 'Beleg l&ouml;schen',
		DELETERECEIPT_TEMPLATE : 'Wollen Sie diesen Beleg wirklich l&ouml;schen?',
		DESCRIPTION : 'Bezeichnung',
		EDIT : 'Bearbeiten',
		EDIT_RECEIPT : 'Beleg Bearbeiten',
		ENDDATE : 'Abreise Datum',
		ENGLISH : 'Englisch',
		ERROR : 'Fehler',
		ERRORMESSAGE_AMOUNT : 'Bitte geben Sie einen Betrag ein.',
		ERRORMESSAGE_AMOUNTNOTVALIDE : 'Bitte geben Sie einen gültigen Betrag ein.',
		ERRORMESSAGE_CURRENCY : 'Bitte w&auml;hlen Sie eine W&auml;hrung aus.',
		ERRORMESSAGE_DATE : 'Bitte geben Sie ein Datum ein.',
		ERRORMESSAGE_DESCRIPTION : 'Bitte geben Sie eine Bezeichnung ein.',
		ERRORMESSAGE_ENDDATE : 'Bitte geben Sie ein Enddatum ein.',
		ERRORMESSAGE_ENDDATETOLOW : 'Datum der Abreise liegt vor der Anreise.',
		ERRORMESSAGE_KINDOFPYMENT : 'Bitte w&auml;hlen Sie eine Zahlungsart aus.',
		ERRORMESSAGE_PERSONS : 'Bitte geben Sie die Personen ein.',
		ERRORMESSAGE_PLACE : 'Bitte geben Sie einen Ort ein.',
		ERRORMESSAGE_REASON : 'Bitte geben Sie einen Grund an.',
		ERRORMESSAGE_RECEIPTKIND : 'Bitte w&auml;hlen Sie eine Belegart aus.',
		ERROR_SETTINGS_TEMPLATE : 'Die Anmeldedaten sind fehlerhaft.',
		ERROR_SETTINGS_TITLE : 'Fehler:',
		FAVORITES : 'Favoriten',
		FEEDBACK : 'Feedback',
		FEEDBACK_QUESTION : 'Was wollen Sie uns mitteilen?',
		GERMAN : 'Deutsch',
		INFOS : 'Infos',
		INFOS_INFO_TEXT : 'Anlegen, &Auml;ndern und L&ouml;schen von Belegen online oder offline. Synchronisierung mit Sammelbelegen (Men&uuml; Mitarbeiter/Reisekosten/Sammelbelege) mit Push & Sync. Anmeldung mit Firmenkennung, Benutzerkennung und Mobiles Passwort (Men&uuml; Mitarbeiter/Stammdaten/Mobile). Support/Feedback: per E-Mail an <a href="mailto:mobile.support@hrworks.de?subject=HRworks-App">mobile.support@hrworks.de</a><br><br>Sollte beim Feld "Datum" in der Belegerfassung keine Auswahl erscheinen, aktivieren Sie das Feld Datumsauswahl in den Einstellungen.',
		KINDOFPYMENT : 'Zahlungsart',
		KINDSOFPYMENT : 'Zahlungsarten',
		LOGIN : 'Anmeldung',
		LOGIN_INFO_TEXT : "Verwenden Sie die Firmen-& Benutzerkennung, mit der Sie sich unter www.hrworks.de anmelden. Das mobile Passwort finden Sie in HRworks im Men&uuml; Mitarbeiter/Stammdaten/Mobile.",
		MOBILEPASSWORD : 'Mobiles Passwort',
		NEWRECEIPT : 'Neuer Beleg',
		NEW_FUNCTIONALITY : 'neue Funktionalit&auml;t',
		NO : 'Nein',
		NOANSWERFROMTHESERVER_TEMPLATE : 'Der Server antwortet nicht. Bitte versuchen Sie es später noch einmal.',
		NOANSWERFROMTHESERVER_TITLE : 'Keine Antwort vom Server',
		NOINTERNETACCESS_TEMPLATE : 'Bitte prüfen Sie ob, Ihr Gerät mit dem Internet verbunden ist.',
		NOINTERNETACCESS_TITLE : 'Kein Internetzugriff',
		OK : 'Ok',
		OPTIONS : 'Belegoptionen:',
		PERSONID : 'Benutzerkennung',
		PERSONS : 'Bewirtete Personen',
		PLACE : 'Ort der Bewirtung',
		PLEASEWAIT : 'Bitte warten...',
		REASON : 'Grund der Bewirtung',
		RECEIPT : 'Beleg',
		RECEIPTKIND : 'Belegart',
		RECEIPTKINDS : 'Belegarten',
		RECEIPTOVERVIEW : 'Beleg&uuml;bersicht',
		RECEIPTS : 'Belege',
		SAVE : 'Speichern',
		SEARCH : 'Suche...',
		SEND : 'Senden',
		SETTINGS : 'Einstellungen',
		SUBJECT : 'Betreff',
		SUCCESS_SETTINGS_TEMPLATE : 'Einstellungen erfolgreich geändert.',
		SUCCESS_SETTINGS_TITLE : 'Meldung:',
		SYNCHRONIZE : 'Synchronisieren...',
		TARGETSERVER : 'Zielserver',
		WRONGCREDENTIALS_TEMPLATE : 'Die Anmeldedaten sind fehlerhaft.',
		WRONGCREDENTIALS_TITLE : 'Fehler bei der Anmeldung',
		YES : 'Ja'
	});
	$translateProvider.preferredLanguage('en');
});