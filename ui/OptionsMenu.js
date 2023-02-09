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
			<h2>accretion disk params:</h2>
			enabled: <input type="checkbox" id="accretion-disk-checkbox"><br>
			width: <input type="range" id="accretion-disk-width-input" min="0" max="2" step="0.01">:<span id="accretion-disk-width-span"></span><br>
			height: <input type="range" id="accretion-disk-height-input" min="0" max="2" step="0.01">:<span id="accretion-disk-height-span"></span><br>
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

		this._currentDistance = 0;
		/** @type {HTMLSpanElement} */
		this._currentDistanceSpan = this.shadowRoot.getElementById("current-distance-span");

		/** @type {HTMLInputElement} */
		// @ts-ignore
		this._accretionDiskCheckbox = this.shadowRoot.getElementById("accretion-disk-checkbox");
		/** @type {((accretionDiskEnabled:boolean)=>void)[]} */
		this._accretionDiskStatusChangeCallbacks = [];
		this._accretionDiskCheckbox.addEventListener("input",e=>{
			this._accretionDiskStatusChangeCallbacks.forEach(callback=>callback(this._accretionDiskCheckbox.checked));
		});

		/** @type {HTMLInputElement} */
		// @ts-ignore
		this._accretionDiskWidthInput = this.shadowRoot.getElementById("accretion-disk-width-input");
		/** @type {HTMLSpanElement} */
		this._accretionDiskWidthSpan = this.shadowRoot.getElementById("accretion-disk-width-span");
		/** @type {((accretionDiskWidth:number)=>void)[]} */
		this._accretionDiskWidthChangeCallbacks = [];
		this._accretionDiskWidthInput.addEventListener("input",e=>{
			this._accretionDiskWidthSpan.textContent = Math.round(100*parseFloat(this._accretionDiskWidthInput.value))+"%";
			this._accretionDiskWidthChangeCallbacks.forEach(callback=>callback(parseFloat(this._accretionDiskWidthInput.value)));
		});

		/** @type {HTMLInputElement} */
		// @ts-ignore
		this._accretionDiskHeightInput = this.shadowRoot.getElementById("accretion-disk-height-input");
		/** @type {HTMLSpanElement} */
		this._accretionDiskHeightSpan = this.shadowRoot.getElementById("accretion-disk-height-span");
		/** @type {((accretionDiskHeight:number)=>void)[]} */
		this._accretionDiskHeightChangeCallbacks = [];
		this._accretionDiskHeightInput.addEventListener("input",e=>{
			this._accretionDiskHeightSpan.textContent = Math.round(100*parseFloat(this._accretionDiskHeightInput.value))+"%";
			this._accretionDiskHeightChangeCallbacks.forEach(callback=>callback(parseFloat(this._accretionDiskHeightInput.value)));
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

	get accretionDiskWidth(){
		return parseFloat(this._accretionDiskWidthInput.value);
	}

	set accretionDiskWidth(accretionDiskWidth){
		this._accretionDiskWidthInput.value = accretionDiskWidth.toString();
		this._accretionDiskWidthSpan.textContent = Math.round(100*parseFloat(this._accretionDiskWidthInput.value))+"%";
		this._accretionDiskWidthChangeCallbacks.forEach(callback=>callback(parseFloat(this._accretionDiskWidthInput.value)));
	}

	/**
	 * Calls the given function whenever the accretion disk width setting changes, and once immediately.
	 * @param {(accretionDiskWidth:number)=>void} callback
	 */
	onAccretionDiskWidthChange(callback){
		this._accretionDiskWidthChangeCallbacks.push(callback);
		callback(parseFloat(this._accretionDiskWidthInput.value));
	}

	get accretionDiskEnabled(){
		return this._accretionDiskCheckbox.checked;
	}

	set accretionDiskEnabled(accretionDiskEnabled){
		this._accretionDiskCheckbox.checked = accretionDiskEnabled;
	}

	/**
	 * Calls the given function whenever the accretion is enabled or disabled, and once immediately.
	 * @param {(accretionDiskEnabled:boolean)=>void} callback
	 */
	onAccretionDiskStatusChange(callback){
		this._accretionDiskStatusChangeCallbacks.push(callback);
		callback(this._accretionDiskCheckbox.checked);
	}

	get accretionDiskHeight(){
		return parseFloat(this._accretionDiskHeightInput.value);
	}

	set accretionDiskHeight(accretionDiskHeight){
		this._accretionDiskHeightInput.value = accretionDiskHeight.toString();
		this._accretionDiskHeightSpan.textContent = Math.round(100*parseFloat(this._accretionDiskHeightInput.value))+"%";
		this._accretionDiskHeightChangeCallbacks.forEach(callback=>callback(parseFloat(this._accretionDiskHeightInput.value)));
	}

	/**
	 * Calls the given function whenever the accretion disk height setting changes, and once immediately.
	 * @param {(accretionDiskHeight:number)=>void} callback
	 */
	onAccretionDiskHeightChange(callback){
		this._accretionDiskHeightChangeCallbacks.push(callback);
		callback(parseFloat(this._accretionDiskHeightInput.value));
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