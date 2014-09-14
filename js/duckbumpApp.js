
var app = angular.module('duckbumpApp', []);


app.directive('duckbumpTabs', function(){
	return {
		restrict: 'E',
		templateUrl: 'partial/duckbump-tabs.html',
		controller: function () {
			this.tab = 1;
			this.isSet = function(checkTab){
				return this.tab == checkTab;
			}
			this.setTab = function(activeTab) {
				this.tab = activeTab;
			};
		},
		controllerAs: 'tabCtrl'
	}
});

app.directive('duckbumpHome', function(){
	return {
		restrict: 'E',
		templateUrl: 'partial/duckbump-home.html',
		controller: function () {
			
		},
		controllerAs: 'homeCtrl'
	}
});

app.directive('duckbumpHowtoplay', function(){
	return {
		restrict: 'E',
		templateUrl: 'partial/partial/duckbump-howtoplay.html',
		controller: function () {
			this.steps = [{
				name: 'Step 1',
				description: 'Wait for a duck to appear. Usually this only takes 1-2 seconds.',
				imageUrl: 'step1.jpg'
			}, {
				name: 'Step 2',
				description: 'Shoot the Whirlie! Press space to launch a whilrie into the sky.',
				imageUrl: 'step2.jpg'
			}, {
				name: 'Step 3',
				description: ''
			}



			]
		},
		controllerAs: 'htpCtrl'
	}
});

app.directive('duckbumpCharacters', function(){
	return {
		restrict: 'E',
		templateUrl: 'partial/duckbump-characters.html',
		controller: function () {
			this.characters = [{
				name: "Duckbump Jones",
				imageUrl: "img/DuckBumpJones.png",
				description: "Duckbump Jones throws whirlies in attempt to bump the ducks. He is always looking out for the 'Golden' duck."
			}, {
				name: "Duck",
				imageUrl: "img/DuckBumpDuck.png",
				description: "A simple duck who is trying to reach the sun on the other side on the screen"
			}, {
				name: "Golden Duck",
				imageUrl: "img/DuckBumpGoldDuck.png",
				description: "The golden duck is a rare version of the original Duckbump duck. It appears x10 less often than its original duck counterpart."
			}, {
				name: "Whirlie",
				imageUrl: "img/DuckBumpWhirlie.png",
				description: "A whirlie is Duckbump Jones' weapon against the Duckbump ducks. By rubbing his hands together he is able to launch whirlies into the blue sky of Duckbump world."

			}];
		},
		controllerAs: 'charactersCtrl'
	}
});

app.directive('duckbumpAbout', function(){
	return {
		restrict: 'E',
		templateUrl: 'partial/duckbump-about.html',
		controller: function () {
			
		},
		controllerAs: 'aboutCtrl'
	}
});



