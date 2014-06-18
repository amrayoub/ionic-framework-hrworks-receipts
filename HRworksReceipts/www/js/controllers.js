angular.module('starter.controllers', ['ionic'])

.controller('addReceiptCtrl', function($scope, $localstorage, $state) {
	$scope.form = {};
	$scope.receiptKinds = $localstorage.getObject('receiptKinds');
	generateGUID = function(){
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});    
		return guid;
	};
	$scope.createReceipt = function () {
		console.log($scope.form);
		console.log($scope);
		$localstorage.insertObject('receipts', {
			text : 'Beleg',
			amount : 123,
			date : new Date(),
			receiptKind : "1",
			kindOfPayment : "1",
			currency : "EUR",
			rimestamp : new Date(),
			guid: generateGUID()
		});
		if($scope.$viewHistory.backView != null){
			$scope.$viewHistory.backView.go();
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