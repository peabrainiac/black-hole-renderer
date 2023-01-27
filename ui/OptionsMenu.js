export default class OptionsMenu extends HTMLElement {
	constructor(){
		super();
		this.attachShadow({mode:"open"});
		this.shadowRoot.innerHTML = /*html*/`
			<style>
				:host {
					display: block;
					position: absolute;
					left: 0;
					top: 0;
					padding: 8px;
					background: #10101080;
					color: #efefef;
					box-shadow: 0 0 5px 2px #00000080;
					width: 275px;
					backdrop-filter: blur(10px);
				}
				:host([hidden]) {
					display: none;
				}
				input[type="range"] {
					vertical-align: middle;
				}
			</style>
			<h2>black hole params:</h2>
			mass: <input type="range" id="mass-input" min="0.05" max="1" step="0.01">:<span id="mass-span"></span><br>
			Schwarzschild radius: <span id="schwarzschild-radius-span"></span><br>
			current distance: <span id="current-distance-span"></span>
			<hr>
			<h2>simulation params:</h2>
			steps: <input type="range" id="steps-input" min="10" max="500" step="1">:<span id="steps-span"></span><br>
			step size: <input type="range" id="step-size-input" min="0.15" max="1.75" step="0.01">:<span id="step-size-span"></span>
		`;

		/** @type {HTMLInputElement} */
		// @ts-ignore
		this._massInput = this.shadowRoot.getElementById("mass-input");
		/** @type {HTMLSpanElement} */
		this._massSpan = this.shadowRoot.getElementById("mass-span");
		/** @type {HTMLSpanElement} */
		this._schwarzschildRadiusSpan = this.shadowRoot.getElementById("schwarzschild-radius-span");
		/** @type {((mass:number)=>void)[]} */
		this._massChangeCallbacks = [];
		this._massInput.addEventListener("input",e=>{
			this._massSpan.textContent = this._massInput.value;
			this._schwarzschildRadiusSpan.textContent = (2*parseFloat(this._massInput.value)).toString();
			this._massChangeCallbacks.forEach(callback=>callback(parseFloat(this._massInput.value)));
		});

		/** @type {HTMLInputElement} */
		// @ts-ignore
		this._stepsInput = this.shadowRoot.getElementById("steps-input");
		/** @type {HTMLSpanElement} */
		this._stepsSpan = this.shadowRoot.getElementById("steps-span");
		/** @type {((steps:number)=>void)[]} */
		this._stepsChangeCallbacks = [];
		this._stepsInput.addEventListener("input",e=>{
			this._stepsSpan.textContent = this._stepsInput.value;
			this._stepsChangeCallbacks.forEach(callback=>callback(parseInt(this._stepsInput.value)));
		});

		/** @type {HTMLInputElement} */
		// @ts-ignore
		this._stepSizeInput = this.shadowRoot.getElementById("step-size-input");
		/** @type {HTMLSpanElement} */
		this._stepSizeSpan = this.shadowRoot.getElementById("step-size-span");
		/** @type {((stepSize:number)=>void)[]} */
		this._stepSizeChangeCallbacks = [];
		this._stepSizeInput.addEventListener("input",e=>{
			this._stepSizeSpan.textContent = Math.round(100*parseFloat(this._stepSizeInput.value))+"%";
			this._stepSizeChangeCallbacks.forEach(callback=>callback(parseFloat(this._stepSizeInput.value)));
		});

		this._currentDistance = 0;
		/** @type {HTMLSpanElement} */
		this._currentDistanceSpan = this.shadowRoot.getElementById("current-distance-span");
	}

	get mass(){
		return parseFloat(this._massInput.value);
	}

	set mass(mass){
		this._massInput.value = mass.toString();
		this._massSpan.textContent = this._massInput.value;
		this._schwarzschildRadiusSpan.textContent = (2*parseFloat(this._massInput.value)).toString();
		this._massChangeCallbacks.forEach(callback=>callback(parseFloat(this._massInput.value)));
	}

	/**
	 * Calls the given function whenever the mass setting changes, and once immediately.
	 * @param {(mass:number)=>void} callback
	 */
	onMassChange(callback){
		this._massChangeCallbacks.push(callback);
		callback(parseFloat(this._massInput.value));
	}

	get steps(){
		return parseInt(this._stepsInput.value);
	}

	set steps(steps){
		this._stepsInput.value = steps.toString();
		this._stepsSpan.textContent = this._stepsInput.value;
		this._stepsChangeCallbacks.forEach(callback=>callback(parseInt(this._stepsInput.value)));
	}

	/**
	 * Calls the given function whenever the steps setting changes, and once immediately.
	 * @param {(steps:number)=>void} callback
	 */
	onStepsChange(callback){
		this._stepsChangeCallbacks.push(callback);
		callback(parseFloat(this._stepsInput.value));
	}

	get stepSize(){
		return parseFloat(this._stepSizeInput.value);
	}

	set stepSize(stepSize){
		this._stepSizeInput.value = stepSize.toString();
		this._stepSizeSpan.textContent = Math.round(100*parseFloat(this._stepSizeInput.value))+"%";
		this._stepSizeChangeCallbacks.forEach(callback=>callback(parseFloat(this._stepSizeInput.value)))
	}

	/**
	 * Calls the given function whenever the step size setting changes, and once immediately.
	 * @param {(stepSize:number)=>void} callback
	 */
	onStepSizeChange(callback){
		this._stepSizeChangeCallbacks.push(callback);
		callback(parseFloat(this._stepSizeInput.value));
	}

	get currentDistance(){
		return this._currentDistance;
	}

	set currentDistance(currentDistance){
		this._currentDistance = currentDistance;
		this._currentDistanceSpan.textContent = currentDistance.toPrecision(3);
	}
}
customElements.define("options-menu",OptionsMenu);