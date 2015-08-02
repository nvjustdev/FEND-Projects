/* feedreader.js
 *
 * This is the spec file that Jasmine will read and contains
 * all of the tests that will be run against your application.
 */
$(function() {
    //Test Suite: RSS Feeds
    //Goal: Test the RSS Feeds information
    describe('RSS Feeds', function() {

        //Test case to check that allFeeds is defined and that it does contain some values
        it('should be that allFeeds is defined', function() {
            expect(allFeeds).toBeDefined();//Checks if the element is defined
            expect(allFeeds.length).not.toBe(0);//Checks if the length is non-zero to confirm that it has elements
        });

        //Test case to check that the URLs are defined as expected and that they actually contain some information
        it('should be that urls are defined', function() {
            for (var i = 0; i < allFeeds.length; i++) {//Iterate thru every element of allFeeds
                expect(allFeeds[i].url).toBeDefined();//Checks if the element is defined
                expect(allFeeds[i].url.length).not.toBe(0);//Checks if the length is non-zero to confirm that it isn't ''
            }
        });

        //Test case to check that the name are defined as expected and that they actually contain some information
        it('should be that names are defined', function() {
            for (var i = 0; i < allFeeds.length; i++) {//Iterate thru every element of allFeeds
                expect(allFeeds[i].name).toBeDefined();//Checks if the element is defined
                expect(allFeeds[i].name.length).not.toBe(0);//Checks if the length is non-zero to confirm that it isn't ''
            }
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() { //Loads back the first feed
                done();
            });
        });
    });


    /* The menu */
    //Test case to check that the menu is hidden by default and shown when the appropriate link is clicked
    describe('The menu', function() {
        var bodyElement;

        beforeEach(function() {
            bodyElement = $('body');
        });

        it('should be that menu hidden by default', function() {
            var menuClass = bodyElement.hasClass('menu-hidden');//Checks if there's any element with class "menu-hidden"
            expect(menuClass).toBe(true);
        });

        it('should be that hidden state of menu toggles', function() {
            var selectMenu = $('.menu-icon-link');//The menu element
            selectMenu.click();//Show the menu by clicking once
            expect(bodyElement.hasClass('menu-hidden')).toBe(false);//Checks if there's any element with class "menu-hidden"
            selectMenu.click();//Hide the menu by clicking another time
            expect(bodyElement.hasClass('menu-hidden')).toBe(true);//Checks if there's any element with class "menu-hidden"
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    /* Initial Entries */
    //Test case to check that loadFeed does get called
    describe('Initial Entries', function() {

        beforeEach(function(done) {
            loadFeed(0, function() {//Loads the first feed
                done();
            });
        });

        it('should call loadFeed and complete its work', function(done) {
            var feed = $('.feed').find('.entry');
            expect(feed.length).not.toBe(0);//Checks if there is atleast one element with class "entry"
            done();
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    /* New Feed Selection */
    //Test case to check that when a new feed is selected, the content is changed
    describe('New Feed Selection', function() {
        var feedLength, text, title;
        beforeEach(function(done) {
            loadFeed(0, function() {//Loads the first feed
                text = $('.feed').text();//Stores the feed information
                title = $('h1').text();//Stores the title of the page
                loadFeed(1, function() {//Loads the second feed
                    done();
                });
            });
        });

        it('should change content', function(done) {
            expect($('.feed').text()).not.toBe(text);//Checks if the content changed
            done();
        });

        it('should change title', function(done) {
            expect($('h1').text()).not.toBe(title); //Checks if the title did change
            done();
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    /* New test cases */
    //Test case to check that the individual feeds to link to other pages
    describe('Check links', function() {
        var title = $('h1').text();//Stores the current title in a variable for comparison
        beforeEach(function(done) {
            loadFeed(0, function() {//Loads the first feed
                done();
            });
        });

        it('should display another page and not the feed page', function() {
            $('.feed a').click();//Clicks on the feed
            expect($('h1').text()).not.toBe(title);//Checks if the page title is still "Udacity Blog"
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    //Test case to check the menu item 'Udacity blog'
    describe('Check Udacity blog', function() {
        var title = $('h1').text();
        beforeEach(function(done) {
            loadFeed(0, function() {//Loads the first feed "Udacity blog"
                done();
            });
        });

        it('should not show a subtitle for Udacity blog feeds', function() {
            expect($('.feed article p').text()).toBe("");//Checks for the absence of a subtitle
        });

        it('should be that urls are URLs', function() {
            var feedURLs = document.getElementsByClassName('entry-link');
            for (var i = 0; i < feedURLs.length; i++) {//loops thorough all feeds and checks if urls have "http"
                expect(feedURLs[i].href).toContain('http');
            }
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    //Test case to check the menu item 'CSS Tricks'
    describe('Check CSS Tricks', function() {
        var title = $('h1').text();
        beforeEach(function(done) {
            loadFeed(1, function() {//Choosing "CSS Tricks" -- element at index 1 in allFeeds
                done();
            });
        });

        it('should show a subtitle for CSS tricks feeds', function() {
            expect($('.feed article p').text()).not.toBe("");//Checks for the presence of a subtitle
        });

        it('should be that urls are URLs', function() {
            var feedURLs = document.getElementsByClassName('entry-link');
            for (var i = 0; i < feedURLs.length; i++) {//loops thorough all feeds and checks if urls have "http"
                expect(feedURLs[i].href).toContain('http');
            }
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    //Test case to check the menu item 'HTML5 Rocks'
    describe('Check HTML5 Rocks', function() {
        var title = $('h1').text();
        beforeEach(function(done) {
            loadFeed(2, function() {//Choosing "HTML5 Rocks" -- element at index 2 in allFeeds
                done();
            });
        });

        it('should not show a subtitle for HTML5 Rocks feeds', function() {
            expect($('.feed article p').text()).toBe("");//Checks for the absence of a subtitle
        });

        it('should be that urls are URLs', function() {
            var feedURLs = document.getElementsByClassName('entry-link');
            for (var i = 0; i < feedURLs.length; i++) {//loops thorough all feeds and checks if urls have "http"
                expect(feedURLs[i].href).toContain('http');
            }
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    //Test case to check the menu item 'Linear Digressions'
    describe('Check Linear Digressions', function() {
        var title = $('h1').text();
        beforeEach(function(done) {
            loadFeed(3, function() {//Choosing "Linear Digressions" -- element at index 3 in allFeeds
                done();
            });
        });

        it('should show a subtitle for Linear Digressions feeds', function() {
            expect($('.feed article p').text()).not.toBe(""); //Checks for the presence of a subtitle
        });

        it('should be that urls are URLs', function() {
            var feedURLs = document.getElementsByClassName('entry-link');
            for (var i = 0; i < feedURLs.length; i++) {//loops thorough all feeds and checks if urls have "http"
                expect(feedURLs[i].href).toContain('http');
            }
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    //Test case to check that the menu URL are links
    //The test case loops through each allFeed url and confirms the presence of string "http"
    describe('RSS Feed URLs', function() {
        it('should be that urls are URLs', function() {
            for (var i = 0; i < allFeeds.length; i++) {//Loop through allFeed array
                expect(allFeeds[i].url).toContain('http');
            }
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    //Test case to check that the Menu names are title case
    //The test case loops through each allFeed name and confirms that it is in title case
    describe('RSS Feed Names', function() {
        it('should be that names have first letter captilized', function() {
            for (var i = 0; i < allFeeds.length; i++) {//Loop through allFeed array
                expect(allFeeds[i].name.slice(0, 1)).toBe(allFeeds[i].name.slice(0, 1)
                    .toUpperCase());
            }
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    //Test case to check that the color of the header and the menu are as expected
    //The test case confirms that the background color as specified in the css is seen
    describe('Color check', function() {
        it('should be green color header', function() {
            var element = document.getElementsByClassName("header"),
                color = window.getComputedStyle(element[0], null).getPropertyValue(
                    "background"); //Get the background color of the element
            expect(color).toContain('rgb(76, 175, 80)'); //Checks if the color is indeed #4caf50
        });

        it('should be green color menu', function() {
            $('.feed a').click();
            var element = document.getElementsByClassName("menu"),
                color = window.getComputedStyle(element[0], null).getPropertyValue(
                    "background");//Get the background color of the element
            expect(color).toContain('rgb(76, 175, 80)'); //Checks if the color is indeed #4caf50
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });

    //Test case for a future feature: signing up for email notifications
    describe('Email notification', function() {
        it('should be able to sign up for emails', function() {
            var email = $('#email').text();//Checks if there's an element called "Sign Up for Emails"
            expect(email).toBe("Sign Up for Emails");
        });

        //Cleaning up after the suite to bring back the original state
        afterEach(function(done) {
            loadFeed(0, function() {//Loads back the first feed
                done();
            });
        });
    });
});