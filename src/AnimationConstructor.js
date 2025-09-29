class AnimationConstructor {
    constructor(container, props = {}) {
        this.elements = { // to store DOM elements
            container: container
        };

        this.customAnimations = props.customAnimations || {} // to define custom animations in child class

        this.scrollCords = { // to define where the animation starts and ends in relation to the container and viewport
            startAt: 0,
            endAt: 0
        }

        this._cachedVWValue = window.innerWidth; // to manage resize events

        this.progress = 0; // from 0 to 1
        this.previousProgress = 0; // to manage update event
        this.progressEnded = false; // to manage complete event
        this.interfaceReady = false; // to wait until the first scroll event
        this.hasStarted = false; // to manage start event

        this._lastScrollTime = 0; // to manage scroll events

        this.timeline = {} // to be defined in child class

        this.options = {
            start: 0, // 0 means when the top of the container hits the bottom of the viewport
            end: 0, // 0 means when the bottom of the container hits the bottom of the viewport
            markers: false, // show markers at start and end positions
            pin: false, // pin the container during the animation
            detectionMode: {
                start: 'top', // top, center, bottom
                end: 'bottom' // top, center, bottom
            }, 
            scrollDistance: 0, // this value will be calculated automatically if set to 0
            fullscreen: true, // if true, the animation will take the full height of the viewport * scrollDistance scaled
            ...this.getDataOptions(), // get options from data attributes
            ...props.options // override with props
        }

        this._eventDetailPool = {
            container,
            progress: 0,
            containerRect: null,
            scrollTop: 0,
            progressReverse: 0
        }
    }
}

export default AnimationConstructor;