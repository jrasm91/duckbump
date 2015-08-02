var app = angular.module('duckbumpApp', ['ngRoute']);

app.controller('MainController', ['$route', function($route) {
	this.tabs = {
		HOME: {
			title: 'The Game',
			routeId: 'home'
		},
		PLAY: {
			// title2: 'How many ducks can you bump?',
			routeId: 'play'
		},
		HOW_TO_PLAY: {
			title: 'How To Play',
			routeId: 'htp'
		},
		CHARACTERS: {
			title: 'Meet The characters',
			routeId: 'characters'
		},
		ABOUT: {
			title: 'About Duckbump',
			routeId: 'about'
		}
	};
	this.isActive = function(tab) {
		return this.getActiveTab() == tab;
	}
	this.getActiveTab = function() {
		if ($route && $route.current && $route.current.activeTab) {
			for (key in this.tabs) {
				if (this.tabs[key].routeId == $route.current.activeTab) {
					return this.tabs[key];
				}
			}
		}
		return {};
	}
}]);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	.when('/home', {
		templateUrl: 'partial/home.html',
		activeTab: 'home'
	})
	.when('/how-to-play', {
		templateUrl: '/partial/howtoplay.html',
		controller: function() {
			this.steps = [{
				name: 'LOOK',
				description: 'Wait for a duck to appear.',
				imageUrl: 'img/DuckBumpJones.png'
			}, {
				name: 'AIM',
				description: 'Line up your shot.',
				imageUrl: 'img/DuckBumpJones.png'
			}, {
				name: 'FIRE',
				description: 'SHOOT THE DUCK.',
				imageUrl: 'img/DuckBumpJones.png'
			}]
		},
		controllerAs: 'htpCtrl',
		activeTab: 'htp'
	})
	.when('/play', {
		templateUrl: '/partial/play.html',
		activeTab: 'play'
	})
	.when('/characters', {
		templateUrl: '/partial/characters.html',
		controller: function() {
			this.characters = [{
				name: "Duckbump Jones",
				imageUrl: "img/DuckBumpJones.png",
				description: "Duckbump Jones throws whirlies in attempt to bump the ducks. He is always looking out for the 'Golden' duck."
			}, {
				name: "Duck",
				imageUrl: "img/DuckBumpDuck.png",
				description: "A simple duck who is for some reason flying around forever."
			}, {
				name: "Golden Duck",
				imageUrl: "img/DuckBumpGoldDuck.png",
				description: "The golden duck is a magic duck. It appears x10 less often than its non-magical counterpart."
			}, {
				name: "Whirlie",
				imageUrl: "img/DuckBumpWhirlie.png",
				description: "A whirlie is Duckbump Jones' weapon against the Duckbump ducks. By rubbing his hands together he is able to launch whirlies into the blue sky of Duckbump world."
			}, {
				name: "???",
				imageUrl: "img/DuckBumpPig2.png",
				description: "What could it be?"
			}];
		},
		controllerAs: 'charactersCtrl',
		activeTab: 'characters'
	})
.when('/about', {
	templateUrl: '/partial/about.html',
	activeTab: 'about'
})
.otherwise({
	redirectTo: '/home'
});
}]);