/**
 * Enable scroll listener that will return native scroll events
 */
(function () {
    "use strict";

    //region Init and variables
    var availableCallbacks = {'onThumbClick': 'onThumbClick', 'onTopThumbClick': 'onTopThumbClick', 'onBottomThumbClick': 'onBottomThumbClick', 'onTrack': 'onTrack', 'onTrackClick': 'onTrackClick', 'onTrackDrag': 'onTrackDrag', 'onMouseWheel': 'onMouseWheel', 'onScrollStart': 'onScrollStart', 'onScrollEnd': 'onScrollEnd' };

    function ScrollListener(element) {
        this.element = element;
        return this;
    }

    ScrollListener.prototype.init = function () {

        this.scrollEndTimeout = null;
        this.scrollStartPosition = 0;

        this.calculateScrollPositions();
        this.bindEvents();

        return {
            listen: function (obj) {
                this.callBacks = obj;
            }.bind(this)
        };
    };

    ScrollListener.prototype.resetVariablesData = function () {
        this.scrollStartPosition = 0;
        this.wheelEvent = false;
    };
    //endregion

    //region Pub sub
    /**
     *
     * @param {String} event
     */
    ScrollListener.prototype.emit = function (event) {
        if (this.callBacks[event] && typeof this.callBacks[event] === "function") {
            this.callBacks[event]();
        }
    };
    //endregion

    //region First calculations
    /**
     * Each browser has its own thumb size.
     * TODO - get padding by browser type.
     * @returns {number}
     */
    ScrollListener.prototype.getScrollThumbSize = function () {
        return 18;
    };

    ScrollListener.prototype.calculateScrollPositions = function () {
        this.scrollPaddingSize = this.getScrollThumbSize();
        this.scrollThumbLeft = this.element.offsetLeft + this.element.offsetWidth;
        this.scrollThumbLeftTop = this.element.offsetTop;
        this.scrollThumbLeftBottom = this.element.offsetTop + this.element.offsetHeight;
    };
    //endregion

    //region Live calculations
    /**
     * Is the current event in the boundaries of the scroll thumb
     * @param event
     * @returns {boolean|string} - false if failed, and top and bottom string values
     */
    ScrollListener.prototype.getIsEventInThumbBounds = function (event) {
        var isOnLeft,
            isOnTop,
            isOnBottom;

        isOnLeft = event.screenX < this.scrollThumbLeft && event.screenX > this.scrollThumbLeft - this.scrollPaddingSize;
        if (!isOnLeft) {
            return false;
        }

        isOnTop = event.clientY > this.scrollThumbLeftTop && event.clientY < this.scrollThumbLeftTop + this.scrollPaddingSize;
        if (isOnTop) {
            return "top";
        }

        isOnBottom = event.clientY < this.scrollThumbLeftBottom && event.clientY > this.scrollThumbLeftBottom - this.scrollPaddingSize;
        if (isOnBottom) {
            return "bottom";
        }

        return false;
    };

    /**
     *
     */
    ScrollListener.prototype.scrollEndCallback = function () {

        // No need to calculate anything on wheel event
        if (this.wheelEvent) {
            this.resetVariablesData();
            return;
        }

        if (!this.scrollStartPosition) {
            this.resetVariablesData();
            return;
        }

        var eventPos = this.getIsEventInThumbBounds(this.scrollStartPosition);

        if (eventPos) {
            this.emit(availableCallbacks.onThumbClick);
            if (eventPos === "top") {
                this.emit(availableCallbacks.onTopThumbClick);
            } else {
                this.emit(availableCallbacks.onBottomThumbClick);
            }
        } else {
            this.emit(availableCallbacks.onTrack);
        }

        this.resetVariablesData();

    };
    //endregion

    //region Event Listeners
    /**
     *
     */
    ScrollListener.prototype.handleScrollEvent = function () {
        if (!this.wheelEvent) {
            this.emit(availableCallbacks.onScrollStart);
        }

        this.scrollEndCallback();

        // Enable end scroll event
        clearTimeout(this.scrollEndTimeout);
        this.scrollEndTimeout = setTimeout(function () {
            this.emit(availableCallbacks.onScrollEnd);
        }.bind(this), 150);
    };

    /**
     *
     * @param {MouseEvent} event - https://developer.mozilla.org/en/docs/Web/API/MouseEvent
     */
    ScrollListener.prototype.handleMouseDownEvent = function (event) {
        //this.scrollStartTimer = new Date().getTime();
        if (event.target === this.element) {
            this.scrollStartPosition = event;
        }
    };

    /**
     *
     * @param {MouseEvent} event - https://developer.mozilla.org/en/docs/Web/API/MouseEvent
     */
    ScrollListener.prototype.handleMouseUpEvent = function (event) {
        this.scrollEndCallback();
    };

    ScrollListener.prototype.handleWheelEvent = function () {
        //this.scrollEndTimer = new Date().getTime();
        this.emit(availableCallbacks.onMouseWheel);
        this.wheelEvent = true;
    };

    /**
     *
     */
    ScrollListener.prototype.bindEvents = function () {
        this.element.addEventListener("mousedown", this.handleMouseDownEvent.bind(this), false);
        this.element.addEventListener("mouseup", this.handleMouseUpEvent.bind(this), false);
        this.element.addEventListener("wheel", this.handleWheelEvent.bind(this), false);
        this.element.addEventListener("mousewheel", this.handleWheelEvent.bind(this), false);
        this.element.addEventListener("scroll", this.handleScrollEvent.bind(this), false);
    };
    //endregion

    //region Pass element and Listen

    /**
     *
     * @param {HTMLElement|String} d
     * @return {?HTMLElement}
     */
    function validatePassedParamAndReturnElement(d) {
        var el = null;
        if (!d) {
            return el;
        }
        try {

            if (typeof d === "string") {
                el = document.querySelector(d);
            }

            if (!el) {
                return null;
            }

            if (typeof el === "object" && el.nodeType === 1) {
                return el;
            }

            return null;

        } catch (e) {
            throw new Error('Error parsing element param');
        }

    }

    /**
     *
     * @param {HTMLElement|String} d
     */
    function init(d) {
        var el = validatePassedParamAndReturnElement(d);
        if (!el) {
            throw new Error('Error parsing element param');
        }

        return new ScrollListener(el).init();
    }

    window.ScrollElement = init;

    //endregion

}());