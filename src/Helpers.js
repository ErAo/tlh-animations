export default class Helpers {
    easing = {
        linear: (t) => t,
        easeIn: (t) => t * t,
        easeOut: (t) => t * (2 - t),
        easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        bounce: (t) => {
            if (t < 1/2.75) {
                return 7.5625 * t * t;
            } else if (t < 2/2.75) {
                return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
            } else if (t < 2.5/2.75) {
                return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
            } else {
                return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
            }
        }
    }

    getElementPosition(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
    }

    scrollTo (position, duration = 500, easing = 'linear') {
        const start = window.scrollY || window.pageYOffset;
        const getPosition = typeof position === 'number' ? position : this.getElementPosition(position).top;
        const change = getPosition - start;
        let startTime = null;

        if (duration <= 0) {
            window.scrollTo(0, getPosition);
            return;
        }

        const animateScroll = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const val = this.easing[easing](progress) * change + start;
            window.scrollTo(0, val);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    }
    
    // Selector helper
    selector = (target) => {
        if (typeof target === 'string') {
            return document.querySelectorAll(target);
        }
        return [target];
    }
};