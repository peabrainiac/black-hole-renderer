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
					width: 250px;
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
			mass: <input type="range" id="mass-input" min="0.05" max="1" step="0.01">:<span id="mass-span"></span>
			Schwarzschild radius: <span id="schwarzschild-radius-span"></span>
			<hr>
			<h2>simulation params:</h2>
			todo
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

}
customElements.define("options-menu",OptionsMenu);