/**
 * Simple fps counting custom element. Counts every call to `.update()`, and calculates the fps from that once a second.
 */
export default class FpsCounter extends HTMLElement {
	constructor(){
		super();
		this.attachShadow({mode:"open"});
		this.shadowRoot.innerHTML = /*html*/`
			<style>
				:host {
					display: block;
					position: absolute;
					right: 0;
					bottom: 0;
					padding: 3px;
					background: #00000080;
					color: #efefef;
				}
			</style>
			<span></span>
		`;
		this._span = this.shadowRoot.querySelector("span");
		this._lastUpdated = Date.now();
		this._framesSince = 0;
	}

	/**
	 * Tells the counter that a frame has been rendered. The displayed count doesn't actually update every time this method is called but only
	 * approximately once a second, to prevent the count from flickering between two different numbers.
	 */
	update(){
		this._framesSince++;
		if (Date.now()-this._lastUpdated>1000){
			this._span.innerText = `${Math.round(this._framesSince*1000/(Date.now()-this._lastUpdated))} fps`;
			this._lastUpdated = Date.now();
			this._framesSince = 0;
		}
	}
}
customElements.define("fps-counter",FpsCounter);