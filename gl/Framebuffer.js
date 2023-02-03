import Texture from "./Texture.js";

/**
 * Simple wrapper class that keeps track of a framebuffer and its attached textures.
 */
export default class Framebuffer {
	/**
	 * @param {WebGL2RenderingContext} gl
	 */
	constructor(gl,width=0,height=0,buffer=gl.createFramebuffer()){
		this._gl = gl;
		this._id = buffer;
		this._width = width;
		this._height = height;
		/** @type {Texture[]} */
		this._textures = [];
	}

	/**
	 * @param {GLenum} target
	 */
	bind(target=this._gl.FRAMEBUFFER,setViewport=true){
		this._gl.bindFramebuffer(target,this._id);
		if (setViewport){
			this._gl.viewport(0,0,this._width,this._height);
		}
	}

	/**
	 * @param {Texture} texture
	 * @param {GLenum} attachment
	 */
	attachTexture(texture,attachment){
		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER,this._id);
		this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER,attachment,this._gl.TEXTURE_2D,texture.id,0);
		texture.setSize(this._width,this._height);
		this._textures.push(texture);
	}
	
	/**
	 * @param {GLenum} format
	 */
	attachDepthBuffer(format=this._gl.DEPTH_COMPONENT16){
		this._depthBuffer = this._gl.createRenderbuffer();
		this._gl.bindRenderbuffer(this._gl.RENDERBUFFER,this._depthBuffer);
		this._gl.renderbufferStorage(this._gl.RENDERBUFFER,format,this._width,this._height);
		this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER,this._gl.DEPTH_ATTACHMENT,this._gl.RENDERBUFFER,this._depthBuffer);
		this._depthBufferFormat = format;
	}

	/**
	 * @param {number} width
	 * @param {number} height
	 */
	setSize(width,height){
		if (this._width!=width||this._height!=height){
			this._width = width;
			this._height = height;
			for (let texture of this._textures){
				texture.setSize(width,height);
			}
			if (this._depthBuffer){
				this._gl.bindRenderbuffer(this._gl.RENDERBUFFER,this._depthBuffer);
				this._gl.renderbufferStorage(this._gl.RENDERBUFFER,this._depthBufferFormat,this._width,this._height);
			}
		}
	}
	
	/**
	 * @param {number} attachment
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} a
	 */
	clearAttachment(attachment,r,g,b,a){
		this._gl.clearBufferfv(this._gl.COLOR,attachment,[r,g,b,a]);
	}

	delete(){
		this._gl.deleteFramebuffer(this._id);
	}
}