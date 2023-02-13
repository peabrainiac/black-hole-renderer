# black hole renderer

A simple black hole renderer I wrote for a computer graphics course this semester (early 2023). Written in JS/WebGL, based on the [geodesic raytracing blog post](https://michaelmoroz.github.io/TracingGeodesics/) by [Mykhailo Moroz](https://github.com/MichaelMoroz), and one of [Jacob Bingham](https://github.com/Zi7ar21)'s [shaders](https://www.shadertoy.com/view/flcXW4) for the volumetric accretion disk.

The project can be run and viewed directly on [github pages](https://peabrainiac.github.io/black-hole-renderer), or alternatively hosted locally using a simple http server.

## status

So far I've only implemented simple Schwarzschild black holes together with an (definitely artistic and not physically based) accretion disk. I've also written code that allows the black hole and accretion disk to show up in the reflections of other objects; however, I haven't yet found the time to render those objects in the correct position around the black hole, so they're disabled by default for now. I've also originally planned this to work with rotating black holes as well (i.e. with the Kerr metric), but again haven't found the time to get everything to work properly with that yet. Another thing that I've been meaning to implement but haven't yet is parallel transport of the frame of reference of the camera along it's path through spacetime; because of the lack of this, images close to the black hole are currently rendered using a basis that's far from orthonormal, skewing the image as a result.

## used files

The starmap used as the background is an actual photo of the milky way from https://svs.gsfc.nasa.gov/4851, which I was pointed to in the first place by [this blog post](https://thelastpointer.wordpress.com/2017/06/18/milky-way-skybox/). The cow model and utah teapot model were taken from https://www.cs.cmu.edu/~kmcrane/Projects/ModelRepository/ and https://graphics.stanford.edu/courses/cs148-10-summer/as3/code/as3/teapot.obj respectively.