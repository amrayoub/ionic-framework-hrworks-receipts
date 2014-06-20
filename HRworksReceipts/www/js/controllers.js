angular.module('starter.controllers', ['ionic'])

.controller('addReceiptCtrl', function($scope, $localstorage, $state) {
	$scope.form = {};
	$scope.receiptKinds = $localstorage.getObject('receiptKinds');
	$scope.receiptKindsSelected = $scope.receiptKinds[0];
	$scope.kindsOfPayment = $localstorage.getObject('kindsOfPayment');
	$scope.kindsOfPaymentSelected = $scope.kindsOfPayment[1];
	$scope.currencies = $localstorage.getObject('currencies');
	$scope.currenciesSelected = $scope.currencies[2];
	console.log($scope.currencies[2]);
	generateGUID = function(){
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});    
		return guid;
	};
	$scope.createReceipt = function () {
		var error = 0;
		if(!$scope.form.text) {
			error = 1;
		}
		if(!$scope.form.amount) {
			error = 1;
		}
		if(!$scope.form.date) {
			error = 1;
		}
		if(error == 1) {
			console.log("Validierungs Fehler");
		} else {
			$localstorage.insertObject('receipts', {
				text : $scope.form.text,
				amount : $scope.form.amount,
				date : $scope.form.date,
				receiptKind : "1",
				kindOfPayment : "1",
				currency : "EUR",
				rimestamp : new Date(),
				guid: generateGUID()
			});
			if($scope.$viewHistory.backView != null){
				$scope.$viewHistory.backView.go();
			}
		}
	};
})

.controller('receiptsCtrl', function($scope, $localstorage) {
	$scope.receipts = $localstorage.getObject('receipts');
})

.controller('FriendDetailCtrl', function($scope, $stateParams) {
  $scope.receipts = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
})

.controller('feedbackCtrl', function($scope) {
})

.controller('settingsCtrl', function($scope) {
})

.controller('infosCtrl', function($scope) {
})



.controller('updateReceiptCtrl', function($scope, $localstorage, $stateParams, Friends) {
	$scope.friend = $localstorage.get($stateParams.friendId);
});