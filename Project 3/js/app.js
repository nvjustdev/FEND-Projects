/*
This file handles all the internal details of the Game. The game comprises of five parts -- the avatar who is the player,
the enemy who's out to get the player's avatar, the gems that the player intends to collect, the time that the player is racing against,
and the points that the player intends to gather.

There are three levels of difficulty. With each level, there's an associated time, points, lives and the speed of the enemy. The speed of the
enemy will be a multiplier set for each difficulty level.

There will be three colored gems and some special items. The colored gems offer different points while the special items offer lives.
*/
//All the global variables are declared up front with just a single var command which will save some performance time.
var avatarIndex, difficultyLevel, avatarImages, isGameOn, easy, medium,
	hard, gameMinutes, gameLives, gameGemIndex, gamePointsPerGem,
	totalPoints, sprites, gemImages, possibleGemX, possibleGemY, possibleGemPoints,
	selections, gameSpeedMultiplier;

//Initializing the points tally to be zero
totalPoints = 0;

//Creating an array of avatars based on images
avatarImages = [
	'images/char-boy.png',
	'images/char-cat-girl.png',
	'images/char-horn-girl.png',
	'images/char-pink-girl.png',
	'images/char-princess-girl.png'
];

//Creating an array of gem images. The game randomly shows the gems to be collected. Each gem has a different point attached to it.
//Green = 5 points, Blue = 10 points, Orange = 15 points, Heart = 1 life, Star = 1 live + 20 points.
gemImages = [
	'images/gem-green.png',
	'images/gem-blue.png',
	'images/gem-orange.png',
	'images/Heart.png',
	'images/Star.png'
];

//Initialize the selections (Avatar, Difficulty) array to be false
selections = [false, false];

//Where can the Gems appear? Here are the possible locations
possibleGemX = [0, 100, 200, 300, 400];
possibleGemY = [60, 140, 220];

//Special Items: No points for hearts but extra live. Star has both points and lives.
possibleGemPoints = [5, 10, 15, 0, 20]; //Green, Blue, Orange, Heart, Star respectively

/*
Setting the "Game's On" variable to be false and this will be true only when the game is on. This helps in identifying the
timeframe when the canvas has to be rendered. The canvas will not be visible when the game isn't played -- when in the settings pages.
*/
isGameOn = false;

/* CLASSES and OBJECTS */

//Creating a Difficulty class with lives and time
var Difficulty = function(lives, minutes) {
	this.lives = lives;
	this.minutes = minutes;
};

//Creating a variable for each of the game's levels
easy = new Difficulty(3, 5); //3 lives + 5 minutes
medium = new Difficulty(6, 4); //6 lives + 4 minutes
hard = new Difficulty(10, 3); //10 lives + 3 minutes

//Creating an Enemy class
var Enemy = function() {
	//Defining some pre-requisites for the Enemy class - x, y, speed and sprite
	this.possibleXloc = [-150, 600];
	this.possibleYloc = [60, 140, 220];
	this.possibleSpeed = [150, 600];
	this.sprites = ['images/enemy-bug.png']; //Current form for the game offers one enemy with variable speed which further changes based on the difficulty

	this.reset(); //Setting to defaults
};

//Defaults abstracted into a method to be used later to reset the enemy
Enemy.prototype.reset = function() {
	this.x = this.possibleXloc[0]; //Always start at the left end
	this.y = this.randomY(); //Any row
	this.speed = this.randomSpeed() * gameSpeedMultiplier; //Ah-ha, here's where the speed gets altered
	this.sprite = this.randomSprite(); //Hooks to add more enemies
	//TODO: Add other enemies
};

//Helper method to get random y location
Enemy.prototype.randomY = function() {
	/* Choose the row randomly. This function will always choose one of 0, 1, 2
	and hence the y location will be one of the three previously determined values 60, 140, 220
	*/
	return this.possibleYloc[Math.floor(Math.random() * this.possibleYloc.length)];
};

//Helper method to get random speed
Enemy.prototype.randomSpeed = function() {
	/* We choose a random number from 0 - difference between max and min speeds. Then we add that value to the min speed to get the new speed.
	 */
	return (this.possibleSpeed[0] + Math.floor(Math.random() * (this.possibleSpeed[
		1] - this.possibleSpeed[0])));
};

//Helper method to get random enemy sprite
Enemy.prototype.randomSprite = function() {
	//Choose a random sprite for the enemy
	//Hooks to add more enemies
	//TODO: Add other enemies
	return this.sprites[Math.floor(Math.random() * this.sprites.length)];
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
	this.x += this.speed * dt;

	//If the enemy has reached the end of the segment, reset to defaults
	if (this.x > this.possibleXloc[1]) {
		this.reset();
	}

	//Check for collisions always. Get them lady bugs!
	this.checkCollisions();
};

//Check for enemy - player collisions
Enemy.prototype.checkCollisions = function() {
	if ((this.y === player.y) && (this.x >= player.x - 30) && (this.x <= player.x +
			30)) {
		//Player has collided with the enemy
		//Oops, player lost a life
		gameLives--;
		//Update the lives text on the game console
		document.getElementById('livesText').innerHTML = 'Lives: ' + gameLives;

		//Check if all lives have been exhausted
		if (gameLives <= 0) {
			//Stop the game as all the lives have been exhausted
			stopGame();
		} else {
			//Reset the player position
			player.reset();
		}
	}
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Creating a Gem class
var Gem = function() {
	this.x = possibleGemX[Math.floor(Math.random() * 5)]; //One of the possible 5 x values
	this.y = possibleGemY[Math.floor(Math.random() * 3)]; //One of the possible 3 y values
};

//Update the gem
Gem.prototype.update = function() {
	if ((player.y === this.y) && (this.x >= player.x - 30) && (this.x <= player.x +
			30)) {
		// if ((this.x >= player.x - 30) && (this.x <= player.x + 30)) {

		if (gameGemIndex === 3) {
			//Got a heart, did you? Awesome. you earned an extra life
			gameLives++;
			//Updating Lives Text
			document.getElementById('livesText').innerHTML = 'Lives: ' + gameLives;
		} else if (gameGemIndex < 3) {
			//Bull's Eye. Updating points tally
			totalPoints = totalPoints + gamePointsPerGem;

			//Updating score
			document.getElementById('pointsText').innerHTML = 'Points: ' + totalPoints;
		} else if (gameGemIndex === 4) {
			//Ah ha! Found the star. Earns you a life and points
			gameLives++;
			//Updating Lives Text
			document.getElementById('livesText').innerHTML = 'Lives: ' + gameLives;

			//Bull's Eye. Updating points tally
			totalPoints = totalPoints + gamePointsPerGem;
			//Updating score
			document.getElementById('pointsText').innerHTML = 'Points: ' + totalPoints;
		}

		//Set Next Gem and its associated points
		gameGemIndex = this.randomGem();
		gamePointsPerGem = possibleGemPoints[gameGemIndex];

		//Need to get random location for the gem
		this.x = possibleGemX[Math.floor(Math.random() * 5)];
		this.y = possibleGemY[Math.floor(Math.random() * 3)];

		//Resetting the player location to default since the player got a gem
		player.reset();
		// }
	}
};

//Draw a gem on the game console
Gem.prototype.render = function() {
	ctx.drawImage(Resources.get(gemImages[gameGemIndex]), this.x, this.y);
};

//Get a random gem index. Game will be more interesting if we had more than one gems to collect
Gem.prototype.randomGem = function() {
	return Math.floor(Math.random() * 5);
};

//Creating a Player class
var Player = function() {
	this.xRange = [-2, 402]; //Define x range
	this.yRange = [-20, 380]; //Define y range
	this.sprite = avatarImages[avatarIndex]; //Based on the chosen avatar

	this.reset(); //Reset if player lost life, or got collectible
};

//Reset player
Player.prototype.reset = function() {
	//Default Location
	this.x = 200;
	this.y = 380;
};

//Set player's avatar
Player.prototype.avatarImage = function() {
	//Based on the chosen avatar, set the avatar image
	this.sprite = avatarImages[avatarIndex];
};

//Draw the player avatar on the game console
Player.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//When there is a key pressed on the keyboard, make sure to move the player accordingly
Player.prototype.update = function() {
	if (this.key === 'left' && this.x > 0) {
		this.x = this.x - 100;
	} else if (this.key === 'right' && this.x != 400) {
		this.x = this.x + 100;
	} else if (this.key === 'up') {
		this.y = this.y - 80;
	} else if (this.key === 'down' && this.y != 400) {
		this.y = this.y + 80;
	}

	this.key = null; //Waiting for the next input

	//If the player goes out of the bounds, put the player back at the default location
	if ((this.y < 60) || (this.y > 380)) {
		this.reset();
	}
};

//Get the input and set the key for Player to be picked up by the Player.prototype.update function
Player.prototype.handleInput = function(key) {
	this.key = key;
};

//Defaults
avatarIndex = 0; //First avatar
gameGemIndex = 0; //First Gem
gameSpeedMultiplier = 1; //Medium

/* Objects */

//First, the enemies!
var allEnemies = [];

var tough = new Enemy();
allEnemies.push(tough);

var tougher = new Enemy();
allEnemies.push(tougher);

var toughest = new Enemy();
allEnemies.push(toughest);

var moreTough = new Enemy();
allEnemies.push(moreTough);

var theToughest = new Enemy();
allEnemies.push(theToughest);

//Next the player
var player = new Player();

//Last and quite not the least, the gem!
var gem = new Gem();

// This listens for key presses and sends the keys to the
// Player.handleInput() method
document.addEventListener('keyup', function(e) {
	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	player.handleInput(allowedKeys[e.keyCode]);
});

/* Helper Functions */
//This function is invoked when the user has digested the instructions. This function shows the avatar selection page.
//It is possible that this method is invoked when the user isn't satisfied with the avatar selection (hit the back on the difficulty selection page)
function showAvatarSelection() {
	document.getElementById('instructions').style.display = 'none';
	document.getElementById('avatarSelectionId').style.display = 'block';
	document.getElementById('gameDifficultyId').style.display = 'none';
	document.getElementById('summaryOfSelection').style.display = 'none';
	document.getElementById('stats').style.display = 'none';
	document.getElementById('gameOver').style.display = 'none';
}

//Okay, avatar's chosen. Set the value of the avatar image, make the first selection (avatar) to be true, update the player's avatar
//This function shows the difficulty selection page, and the chosen avatar.
//The user can choose to go back and change the avatar if needed.
function avatarClick(imgId, imgIndex) {
	avatarIndex = imgIndex;
	player.avatarImage();
	selections[0] = true;
	document.getElementById('chosenAvatar').src = avatarImage(imgIndex);
	document.getElementById('avatarSelectionId').style.display = 'none';
	document.getElementById('gameDifficultyId').style.display = 'block';
	document.getElementById('summaryOfSelection').style.display = 'none';
	document.getElementById('stats').style.display = 'none';
	document.getElementById('gameOver').style.display = 'none';
}

//Returns the avatar image for the given index
function avatarImage(imageIndex) {
	return avatarImages[imageIndex];
}


//The difficulty was chosen. Set the difficultyLevel variable. Based on the difficulty, set the game time, lives and the speed multiplier of the enemies
function difficultyClick(buttonID, level) {
	difficultyLevel = level;
	switch (level) {
		case 'Easy':
			gameMinutes = easy.minutes;
			gameLives = easy.lives;
			gameSpeedMultiplier = 0.6; //Slower
			break;

		case 'Medium':
			gameMinutes = medium.minutes;
			gameLives = medium.lives;
			gameSpeedMultiplier = 1; //Moderate
			break;

		case 'Hard':
			gameMinutes = hard.minutes;
			gameLives = hard.lives;
			gameSpeedMultiplier = 1.4; //Faster
	}

	//Choosing only a gem (not a heart or star) for the very first time
	gameGemIndex = Math.floor(Math.random() * 3);
	gamePointsPerGem = possibleGemPoints[gameGemIndex];

	//The second selection is also completed
	selections[1] = true;

	//Show the Avatar and difficulty selections
	document.getElementById('chosenAvatarInDiff').src = avatarImage(avatarIndex);

	//Hide the old pages and show the summary
	document.getElementById('gameDifficultyId').style.display = 'none';
	document.getElementById('summaryOfSelection').style.display = 'block';

	//Remove any old difficulty level selection message
	var myNode = document.getElementById('chosenDifficultyId');
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}

	//Add the new difficulty level selection message
	var newHeading = document.createElement('h2');
	newHeading.innerHTML = 'You are playing difficulty level: ' + difficultyLevel;
	document.getElementById('chosenDifficultyId').appendChild(newHeading);
	document.getElementById('gameOver').style.display = 'none';
}

//Now the selections are complete, show the summary of selections
function showDifficultySelection() {
	//Hide other sections
	document.getElementById('chosenAvatar').src = avatarImage(avatarIndex);
	document.getElementById('avatarSelectionId').style.display = 'none';
	document.getElementById('gameDifficultyId').style.display = 'block';
	document.getElementById('summaryOfSelection').style.display = 'none';
	document.getElementById('stats').style.display = 'none';
	document.getElementById('gameOver').style.display = 'none';

	var myNode = document.getElementById('chosenDifficultyId');
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
}

//Method to start the game
function startClick() {
	//Show the stats on the top of the game area
	document.getElementById('avatarSelectionId').style.display = 'none';
	document.getElementById('gameDifficultyId').style.display = 'none';
	document.getElementById('summaryOfSelection').style.display = 'none';
	document.getElementById('stats').style.display = 'block';
	document.getElementById('gameOver').style.display = 'none';

	//Update lives, timer and points
	document.getElementById('livesText').innerHTML = 'Lives: ' + gameLives;
	document.getElementById('pointsText').innerHTML = 'Points: ' + totalPoints;
	document.getElementById('timerText').innerHTML = 'Timer: ' + gameMinutes +
		': 00 mins';

	//If the selections are ready, start countdown and game
	if ((selections[0] === true) && (selections[1] === true)) {
		isGameOn = true;
		countdown(gameMinutes);
	} else {
		//One selection is missing
		if (selections[0] === true) {
			alert('Please select the difficulty');
		} else {
			alert('Please select the avatar');
		}
	}
}

//Method to start the countdown
function countdown(minutes) {
	var seconds = 60;
	var mins = minutes;

	//Function to keep a track of ticking of time
	function tick() {
		if (isGameOn) {
			var counter = document.getElementById('timerText');
			var currentMinutes = mins - 1; //Reduce the minutes by 1
			seconds--; //Reduce the seconds by 1

			//Update the timer text on the HTML page
			counter.innerHTML = 'Timer: ' + currentMinutes.toString() + ':' + (seconds <
				10 ? '0' : '') + String(seconds) + ' mins';
			if (seconds > 0) {
				setTimeout(tick, 1000); //There's still time. Keep ticking
			} else {
				//1 Minute is completed
				if (mins > 1) {
					//There's still more minutes left for the game. Recurse with the current number of minutes
					setTimeout(function() {
						countdown(mins - 1);
					}, 1000);
				}
			}

			//No time left. Stop the game
			if ((currentMinutes === 0) && (seconds === 0)) {
				stopGame();
			}
		}
	}
	tick(); //Call tick
}

//Method to stop the game
function stopGame() {
	//Reseting values
	gameMinutes = 0;
	gameGemIndex = 0;
	avatarIndex = 0;
	gameSpeedMultiplier = 1;
	gameLives = 3;

	//Game is not on
	isGameOn = false;

	//Hide the game canvas
	toggleCanvas(false);

	//Update the HTML page with the total points and display the summary of the game
	document.getElementById('pointsSummary').innerHTML = totalPoints;
	document.getElementById('gameOver').style.display = 'block';
	document.getElementById('stats').style.display = 'none';
}