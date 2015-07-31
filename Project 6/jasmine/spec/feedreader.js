/* feedreader.js
 *
 * This is the spec file that Jasmine will read and contains
 * all of the tests that will be run against your application.
 */
$(function() {
    //Test case to check that all the values are defined
    describe('RSS Feeds', function() {
        it('are defined', function() {
            expect(allFeeds).toBeDefined();
            expect(allFeeds.length).not.toBe(0);
        });


        it('should be that urls are defined', function() {
            for (var i = 0; i < allFeeds.length; i++) {
                expect(allFeeds[i].url).toBeDefined();
                expect(allFeeds[i].url).not.toBe(0);
            }
        });

        it('should be that names are defined', function() {
            for (var i = 0; i < allFeeds.length; i++) {
                expect(allFeeds[i].name).toBeDefined();
                expect(allFeeds[i].name).not.toBe(0);
            }
        });

        afterEach(function(done) {
            loadFeed(0, function() {
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
            var menuClass = bodyElement.hasClass('menu-hidden');
            expect(menuClass).toBe(true);
        });

        it('should be that hidden state of menu toggles', function() {
            var selectMenu = $('.menu-icon-link');
            selectMenu.click();
            expect(bodyElement.hasClass('menu-hidden')).toBe(false);
            selectMenu.click();
            expect(bodyElement.hasClass('menu-hidden')).toBe(true);
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    /* Initial Entries */
    //Test case to check that loadFeed does get called
    describe('Initial Entries', function() {

        beforeEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });

        it('should call loadFeed and complete its work', function(done) {
            var feed = $('.feed').find('.entry');
            expect(feed.length).not.toBe(0);
            done();
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    /* New Feed Selection */
    //Test case to check that when a new feed is selected, the content is changed
    describe('New Feed Selection', function() {
        var feedLength, text, title;
        beforeEach(function(done) {
            loadFeed(0, function() {
                text = $('.feed').text();
                title = $('h1').text();
                loadFeed(1, function() {
                    done();
                });
            });
        });

        it('should change content', function(done) {
            expect($('.feed').text()).not.toBe(text);
            done();
        });

        it('should change title', function(done) {
            expect($('h1').text()).not.toBe(title);
            done();
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    /* New test cases */
    //Test case to check that the individual feeds to link to other pages
    describe('Check links', function() {
        var title = $('h1').text();
        beforeEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });

        it('should display another page and not the feed page', function() {
            $('.feed a').click();
            expect($('h1').text()).not.toBe(title);
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    //Test case to check the menu item 'Udacity blog'
    describe('Check Udacity blog', function() {
        var title = $('h1').text();
        beforeEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });

        it('should not show a subtitle for Udacity blog feeds', function() {
            expect($('.feed article p').text()).toBe("");
        });

        it('should be that urls are URLs', function() {
            var feedURLs = document.getElementsByClassName('entry-link');
            for (var i = 0; i < feedURLs.length; i++) {
                expect(feedURLs[i].href).toContain('http');
            }
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    //Test case to check the menu item 'CSS Tricks'
    describe('Check CSS Tricks', function() {
        var title = $('h1').text();
        beforeEach(function(done) {
            loadFeed(0, function() {
                loadFeed(1, function() {
                    done();
                });
            });
        });

        it('should show a subtitle for CSS tricks feeds', function() {
            expect($('.feed article p').text()).not.toBe("");
        });

        it('should be that urls are URLs', function() {
            var feedURLs = document.getElementsByClassName('entry-link');
            for (var i = 0; i < feedURLs.length; i++) {
                expect(feedURLs[i].href).toContain('http');
            }
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    //Test case to check the menu item 'HTML5 Rocks'
    describe('Check HTML5 Rocks', function() {
        var title = $('h1').text();
        beforeEach(function(done) {
            loadFeed(0, function() {
                loadFeed(1, function() {
                    loadFeed(2, function() {
                        done();
                    });
                });
            });
        });

        it('should not show a subtitle for HTML5 Rocks feeds', function() {
            expect($('.feed article p').text()).toBe("");
        });

        it('should be that urls are URLs', function() {
            var feedURLs = document.getElementsByClassName('entry-link');
            for (var i = 0; i < feedURLs.length; i++) {
                expect(feedURLs[i].href).toContain('http');
            }
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    //Test case to check the menu item 'Linear Digressions'
    describe('Check Linear Digressions', function() {
        var title = $('h1').text();
        beforeEach(function(done) {
            loadFeed(0, function() {
                loadFeed(1, function() {
                    loadFeed(2, function() {
                        loadFeed(3, function() {
                            done();
                        });
                    });
                });
            });
        });

        it('should show a subtitle for Linear Digressions feeds', function() {
            expect($('.feed article p').text()).not.toBe("");
        });

        it('should be that urls are URLs', function() {
            var feedURLs = document.getElementsByClassName('entry-link');
            for (var i = 0; i < feedURLs.length; i++) {
                expect(feedURLs[i].href).toContain('http');
            }
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    //Test case to check that the menu URL are links
    describe('RSS Feed URLs', function() {
        it('should be that urls are URLs', function() {
            for (var i = 0; i < allFeeds.length; i++) {
                expect(allFeeds[i].url).toContain('http');
            }
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    //Test case to check that the Menu names are title case
    describe('RSS Feed Names', function() {
        it('should be that names have first letter captilized', function() {
            for (var i = 0; i < allFeeds.length; i++) {
                expect(allFeeds[i].name.slice(0, 1)).toBe(allFeeds[i].name.slice(0, 1)
                    .toUpperCase());
            }
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    //Test case to check that the color of the header and the menu are as expected
    describe('Color check', function() {
        it('should be green color header', function() {
            var element = document.getElementsByClassName("header"),
                color = window.getComputedStyle(element[0], null).getPropertyValue(
                    "background");
            expect(color).toContain('rgb(76, 175, 80)');
        });

        it('should be green color menu', function() {
            $('.feed a').click();
            var element = document.getElementsByClassName("menu"),
                color = window.getComputedStyle(element[0], null).getPropertyValue(
                    "background");
            expect(color).toContain('rgb(76, 175, 80)');
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });

    //Test case for a future feature: signing up for email notifications
    describe('Email notification', function() {
        it('should be able to sign up for emails', function() {
            var email = $('#email').text();
            expect(email).toBe("Sign Up for Emails");
        });

        afterEach(function(done) {
            loadFeed(0, function() {
                done();
            });
        });
    });
});