/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (Mozilla, Waypoint) {
    'use strict';

    var $slideShow = $('.feature-carousel');
    var stickyFooterWaypoint;
    var videoCarouselWaypoint;
    var otherFeaturesWaypoint;

    function cutsTheMustard() {
        return 'querySelector' in document &&
               'querySelectorAll' in document &&
               'addEventListener' in window &&
               typeof window.matchMedia !== 'undefined' &&
               typeof HTMLMediaElement !== 'undefined';
    }

    function initNewsletterSignUp() {
        $('.button.sign-up').attr('role', 'button').on('click', function(e) {
            e.preventDefault();
            Mozilla.Modal.createModal(this, $('.newsletter-modal'));
        });
    }

    function initVideoCarousel() {
        $slideShow.cycle({
            fx: 'scrollHorz',
            log: false,
            slides: '> li',
            speed: 620,
            prev: '.feature-carousel-previous',
            next: '.feature-carousel-next',
        });

        $slideShow.cycle('pause');

        // remove controls attribute as videos auto-play on slide transition.
        $('.feature-carousel video').removeAttr('controls');

        // triggered just prior to a transition to a new slide.
        $slideShow.on('cycle-before', function(event, optionHash, outgoingSlideEl, incomingSlideEl) {
            var outgoingVideo = $(outgoingSlideEl).find('video')[0];
            var incomingVideo = $(incomingSlideEl).find('video')[0];

            // pause the outgoing video.
            if (outgoingVideo && !outgoingVideo.paused) {
                outgoingVideo.pause();
            }

            // reset the incoming video to the first frame.
            if (incomingVideo && incomingVideo.paused) {
                incomingVideo.currentTime = 0;
            }
        });

        // triggered after the slideshow has completed transitioning to the next slide.
        $slideShow.on('cycle-after', function(event, optionHash, outgoingSlideEl, incomingSlideEl) {
            var video = $(incomingSlideEl).find('video')[0];

            // play the incoming video
            if (video && video.paused) {
                playVideo(video);
            }
        });
    }

    function destroyVideoCarousel() {
        var videos = document.querySelectorAll('.feature-carousel video');
        var activeVideo = document.querySelector('.cycle-slide-active video');

        if (activeVideo) {
            activeVideo.pause();
        }

        $slideShow.cycle('destroy');

        // reinstate video controls so play can be initiated manually.
        for (var i = 0; i < videos.length; i++) {
            videos[i].setAttribute('controls', '');
        }
    }

    function initVideoCarouselWaypoints() {

        videoCarouselWaypoint = new Waypoint({
            element: document.querySelector('.feature-carousel-container'),
            offset: '50%',
            handler: function(direction) {
                var video = document.querySelector('.cycle-slide-active video');

                if (video) {
                    if (direction === 'down') {
                        playVideo(video);
                    } else {
                        video.pause();
                    }
                }
            }
        });

        otherFeaturesWaypoint = new Waypoint({
            element: document.querySelector('.other-features'),
            offset: 0,
            handler: function(direction) {
                var video = document.querySelector('.cycle-slide-active video');

                if (direction === 'down') {
                    playVideo(video);
                } else {
                    video.play();
                }
            }
        });
    }

    function playVideo(video) {
        if (video.readyState && video.readyState > 0) {
            video.play();
        }
    }

    function initMediaQueries() {
        var desktopWidth;

        desktopWidth = matchMedia('(min-width: 1000px)');

        if (desktopWidth.matches) {
            initVideoCarousel();
            initVideoCarouselWaypoints();
            initStickyFooter();
        }

        desktopWidth.addListener(function(mq) {
            if (mq.matches) {
                initVideoCarousel();
                initVideoCarouselWaypoints();
                initStickyFooter();
            } else {
                destroyVideoCarousel();
                destroyWaypoints();
            }
        });
    }

    function initStickyFooter() {
        stickyFooterWaypoint = new Waypoint.Sticky({
            element: document.querySelector('.sticky-footer'),
            offset: 'bottom-in-view'
        });
    }

    function destroyWaypoints() {
        if (stickyFooterWaypoint) {
            stickyFooterWaypoint.destroy();
        }

        if (videoCarouselWaypoint) {
            videoCarouselWaypoint.destroy();
        }

        if (otherFeaturesWaypoint) {
            otherFeaturesWaypoint.destroy();
        }
    }

    if (cutsTheMustard()) {
        document.querySelector('main').className = 'supports-videos';
        initMediaQueries();
    }

    initNewsletterSignUp();

})(window.Mozilla, window.Waypoint);
