class Animation {
    constructor(animation, props) {
        this.name = animation
        this.props = props

        this.container = props.container || null

        this.start = props.start ? props.start : 0
        this.end = props.end ? props.end : 100
        this.duration = props.duration ? props.duration : 1
        this.normalizedProgress = 0
        this.hasStarted = false
        this.progressEnded = false
        this.progress = 0

        if(!this.container) {
            console.error('Container is required for animation:', animation);
            return;
        }

        this.container.addEventListener(this.props.events.onUpdate, (e) => {
            this.updateTimeline(e.detail.progress);
        });

        return this
    }

    onUpdate() {
        if(this.progress === 0){
            this.hasStarted = false;
        }

        this.progressEnded = this.progress === 1 ? 1 : (this.progress === 0 ? 0 : false);
        if(this.props.onUpdate) this.props.onUpdate.bind(this)();
    }

    onStart (){
        this.hasStarted = true;
        if(this.props.onStart) this.props.onStart.bind(this)();
    }

    onComplete(){
        if(this.props.onComplete) this.props.onComplete.bind(this)();
    }

    updateTimeline(progress) {
        const { start, end, duration } = this;

        // Cache de valores calculados
        if (!this._cachedUnits) {
            this._cachedUnits = {
                startUnit: start * 0.01,
                endUnit: end * 0.01
            };
        }
        
        const { startUnit, endUnit } = this._cachedUnits;
        const baseProgress = this.props.normalizedProgress(startUnit, endUnit, progress);

        let adjustedProgress;
        if (duration !== 1) {
        adjustedProgress = Math.pow(baseProgress, duration);
        } else {
        adjustedProgress = baseProgress;
        }

        adjustedProgress = Math.max(0, Math.min(1, adjustedProgress));

        this.progress = baseProgress;
        this.normalizedProgress = adjustedProgress;

        if (this.progress > 0 && !this.hasStarted) {
            this.onStart();
        }

        this.onUpdate();

        if (progress === 1) {
            this.onComplete();
        }
    }
}

export default class Timeline {
    constructor(parent) {
        this.parent = parent; // Referencia a la instancia padre
        this.elements = parent.elements;
        this.customEvents = parent.customEvents;
        this.normalizedProgress = parent.normalizedProgress;
    }

    add(name, props) {
        if(!name) {
            console.error('Animation name is required');
            return;
        }
        
        if(!props) {
            console.error('Animation props are required');
            return;
        }

        return new Animation(name, {
            ...props, 
            normalizedProgress: this.normalizedProgress,
            container: this.elements.container, 
            events : this.customEvents
        });
    }
}