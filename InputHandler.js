/**
 * Handles inputs on a given element and manages pointer lock.
 */
export default class InputHandler {
    /**
     * Contructs an InputHandler monitoring a given element.
     * @param {HTMLElement} targetElement
     */
	constructor(targetElement){
		this.target = targetElement;
		this.target.tabIndex = -1;
		this.target.style.pointerEvents = "none";
		this.keys = {w:false,a:false,s:false,d:false,space:false,shift:false};
		this._hasPointerLock = false;
        this._deltaX = 0;
        this._deltaY = 0;
		document.addEventListener("keydown",(e)=>{
			if (this._hasPointerLock){
				this.keys.w = this.keys.w||e.key=="w"||e.key=="W";
				this.keys.a = this.keys.a||e.key=="a"||e.key=="A";
				this.keys.s = this.keys.s||e.key=="s"||e.key=="S";
				this.keys.d = this.keys.d||e.key=="d"||e.key=="D";
				this.keys.space = this.keys.space||e.key==" ";
				this.keys.shift = this.keys.shift||e.key=="Shift";
			}
		});
		document.addEventListener("keyup",(e)=>{
			this.keys.w = this.keys.w&&!(e.key=="w"||e.key=="W");
			this.keys.a = this.keys.a&&!(e.key=="a"||e.key=="A");
			this.keys.s = this.keys.s&&!(e.key=="s"||e.key=="S");
			this.keys.d = this.keys.d&&!(e.key=="d"||e.key=="D");
            this.keys.space = this.keys.space&&!(e.key==" ");
            this.keys.shift = this.keys.shift&&!(e.key=="Shift");
		});
		document.addEventListener("pointerlockchange",()=>{
			let element = document.pointerLockElement;
			while(element&&element.shadowRoot&&element.shadowRoot.pointerLockElement){
				element = element.shadowRoot.pointerLockElement;
			}
			if (element==this.target){
				this._hasPointerLock = true;
			}else{
				this._hasPointerLock = false;
				this.keys = {w:false,a:false,s:false,d:false,space:false,shift:false};
			}
		});
		this.target.addEventListener("mousedown",e=>{
			if (this._hasPointerLock&&e.button==2){
				this.exitPointerLock();
				document.addEventListener("contextmenu",e=>{
					e.preventDefault();
				},{once:true});
			}
		});
        this.target.addEventListener("mousemove",e=>{
            if (this._hasPointerLock){
                this._deltaX += e.movementX;
                this._deltaY += e.movementY;
            }
        });
	}

	requestPointerLock(){
		this.target.requestPointerLock();
	}

	exitPointerLock(){
		document.exitPointerLock();
	}

    /**
     * Returns the accumulated mouse movement since the last time this method was called.
     */
    getMouseDeltaX(){
        let deltaX = this._deltaX;
        this._deltaX = 0;
        return deltaX;
    }

    /**
     * Returns the accumulated mouse movement since the last time this method was called.
     */
    getMouseDeltaY(){
        let deltaY = this._deltaY;
        this._deltaY = 0;
        return deltaY;
    }
}