/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function ( object ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	var onDeviceOrientationChangeEvent = function ( event ) {

		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function () {

		scope.screenOrientation = window.orientation || 0;

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function () {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function ( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler );                               // orient the device

			quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation

		}

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};

	this.update = function () {

		if ( scope.enabled === false ) return;

		var alpha  = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) : 0; // Z
		var beta   = scope.deviceOrientation.beta  ? THREE.Math.degToRad( scope.deviceOrientation.beta  ) : 0; // X'
		var gamma  = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		var orient = scope.screenOrientation       ? THREE.Math.degToRad( scope.screenOrientation       ) : 0; // O

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );

	};

	this.dispose = function () {

		this.disconnect();

	};

	this.connect();

};
;/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CardboardEffect = function ( renderer ) {

	var _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

	var _scene = new THREE.Scene();

	var _stereo = new THREE.StereoCamera();
	_stereo.aspect = 0.5;

	var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

	var _renderTarget = new THREE.WebGLRenderTarget( 512, 512, _params );
	_renderTarget.scissorTest = true;

	// Distortion Mesh ported from:
	// https://github.com/borismus/webvr-boilerplate/blob/master/src/distortion/barrel-distortion-fragment.js

	var distortion = new THREE.Vector2( 0.441, 0.156 );

	var geometry = new THREE.PlaneBufferGeometry( 1, 1, 10, 20 ).removeAttribute( 'normal' ).toNonIndexed();

	var positions = geometry.attributes.position.array;
	var uvs = geometry.attributes.uv.array;

	// duplicate

	var positions2 = new Float32Array( positions.length * 2 );
	positions2.set( positions );
	positions2.set( positions, positions.length );

	var uvs2 = new Float32Array( uvs.length * 2 );
	uvs2.set( uvs );
	uvs2.set( uvs, uvs.length );

	var vector = new THREE.Vector2();
	var length = positions.length / 3;

	for ( var i = 0, l = positions2.length / 3; i < l; i ++ ) {

		vector.x = positions2[ i * 3 + 0 ];
		vector.y = positions2[ i * 3 + 1 ];

		var dot = vector.dot( vector );
		var scalar = 1.5 + ( distortion.x + distortion.y * dot ) * dot;

		var offset = i < length ? 0 : 1;

		positions2[ i * 3 + 0 ] = ( vector.x / scalar ) * 1.5 - 0.5 + offset;
		positions2[ i * 3 + 1 ] = ( vector.y / scalar ) * 3.0;

		uvs2[ i * 2 ] = ( uvs2[ i * 2 ] + offset ) * 0.5;

	}

	geometry.attributes.position.array = positions2;
	geometry.attributes.uv.array = uvs2;

	//

	// var material = new THREE.MeshBasicMaterial( { wireframe: true } );
	var material = new THREE.MeshBasicMaterial( { map: _renderTarget } );
	var mesh = new THREE.Mesh( geometry, material );
	_scene.add( mesh );

	//

	this.setSize = function ( width, height ) {

		_renderTarget.setSize( width, height );

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		_stereo.update( camera );

		var width = _renderTarget.width / 2;
		var height = _renderTarget.height;

		_renderTarget.scissor.set( 0, 0, width, height );
		_renderTarget.viewport.set( 0, 0, width, height );
		renderer.render( scene, _stereo.cameraL, _renderTarget );

		_renderTarget.scissor.set( width, 0, width, height );
		_renderTarget.viewport.set( width, 0, width, height );
		renderer.render( scene, _stereo.cameraR, _renderTarget );

		renderer.render( _scene, _camera );

	};

};
;/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// Include a performance.now polyfill
(function () {

	if ('performance' in window === false) {
		window.performance = {};
	}

	// IE 8
	Date.now = (Date.now || function () {
		return new Date().getTime();
	});

	if ('now' in window.performance === false) {
		var offset = window.performance.timing && window.performance.timing.navigationStart ? window.performance.timing.navigationStart
		                                                                                    : Date.now();

		window.performance.now = function () {
			return Date.now() - offset;
		};
	}

})();

var TWEEN = TWEEN || (function () {

	var _tweens = [];

	return {

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function (tween) {

			_tweens.push(tween);

		},

		remove: function (tween) {

			var i = _tweens.indexOf(tween);

			if (i !== -1) {
				_tweens.splice(i, 1);
			}

		},

		update: function (time) {

			if (_tweens.length === 0) {
				return false;
			}

			var i = 0;

			time = time !== undefined ? time : window.performance.now();

			while (i < _tweens.length) {

				if (_tweens[i].update(time)) {
					i++;
				} else {
					_tweens.splice(i, 1);
				}

			}

			return true;

		}
	};

})();

TWEEN.Tween = function (object) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for (var field in object) {
		_valuesStart[field] = parseFloat(object[field], 10);
	}

	this.to = function (properties, duration) {

		if (duration !== undefined) {
			_duration = duration;
		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function (time) {

		TWEEN.add(this);

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : window.performance.now();
		_startTime += _delayTime;

		for (var property in _valuesEnd) {

			// Check if an Array was provided as property value
			if (_valuesEnd[property] instanceof Array) {

				if (_valuesEnd[property].length === 0) {
					continue;
				}

				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

			}

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (_valuesStart[property] === undefined) {
				continue;
			}

			_valuesStart[property] = _object[property];

			if ((_valuesStart[property] instanceof Array) === false) {
				_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[property] = _valuesStart[property] || 0;

		}

		return this;

	};

	this.stop = function () {

		if (!_isPlaying) {
			return this;
		}

		TWEEN.remove(this);
		_isPlaying = false;

		if (_onStopCallback !== null) {
			_onStopCallback.call(_object);
		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
			_chainedTweens[i].stop();
		}

	};

	this.delay = function (amount) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function (times) {

		_repeat = times;
		return this;

	};

	this.yoyo = function (yoyo) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function (easing) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function (interpolation) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function (callback) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function (callback) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function (callback) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function (callback) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function (time) {

		var property;
		var elapsed;
		var value;

		if (time < _startTime) {
			return true;
		}

		if (_onStartCallbackFired === false) {

			if (_onStartCallback !== null) {
				_onStartCallback.call(_object);
			}

			_onStartCallbackFired = true;

		}

		elapsed = (time - _startTime) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		value = _easingFunction(elapsed);

		for (property in _valuesEnd) {

			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] === undefined) {
				continue;
			}

			var start = _valuesStart[property] || 0;
			var end = _valuesEnd[property];

			if (end instanceof Array) {

				_object[property] = _interpolationFunction(end, value);

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if (typeof (end) === 'string') {

					if (end.startsWith('+') || end.startsWith('-')) {
						end = start + parseFloat(end, 10);
					} else {
						end = parseFloat(end, 10);
					}
				}

				// Protect against non numeric properties.
				if (typeof (end) === 'number') {
					_object[property] = start + (end - start) * value;
				}

			}

		}

		if (_onUpdateCallback !== null) {
			_onUpdateCallback.call(_object, value);
		}

		if (elapsed === 1) {

			if (_repeat > 0) {

				if (isFinite(_repeat)) {
					_repeat--;
				}

				// Reassign starting values, restart by making startTime = now
				for (property in _valuesStartRepeat) {

					if (typeof (_valuesEnd[property]) === 'string') {
						_valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[property];

						_valuesStartRepeat[property] = _valuesEnd[property];
						_valuesEnd[property] = tmp;
					}

					_valuesStart[property] = _valuesStartRepeat[property];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if (_onCompleteCallback !== null) {
					_onCompleteCallback.call(_object);
				}

				for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					_chainedTweens[i].start(_startTime + _duration);
				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function (k) {

			return k;

		}

	},

	Quadratic: {

		In: function (k) {

			return k * k;

		},

		Out: function (k) {

			return k * (2 - k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k;
			}

			return - 0.5 * (--k * (k - 2) - 1);

		}

	},

	Cubic: {

		In: function (k) {

			return k * k * k;

		},

		Out: function (k) {

			return --k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k + 2);

		}

	},

	Quartic: {

		In: function (k) {

			return k * k * k * k;

		},

		Out: function (k) {

			return 1 - (--k * k * k * k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k;
			}

			return - 0.5 * ((k -= 2) * k * k * k - 2);

		}

	},

	Quintic: {

		In: function (k) {

			return k * k * k * k * k;

		},

		Out: function (k) {

			return --k * k * k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k * k * k + 2);

		}

	},

	Sinusoidal: {

		In: function (k) {

			return 1 - Math.cos(k * Math.PI / 2);

		},

		Out: function (k) {

			return Math.sin(k * Math.PI / 2);

		},

		InOut: function (k) {

			return 0.5 * (1 - Math.cos(Math.PI * k));

		}

	},

	Exponential: {

		In: function (k) {

			return k === 0 ? 0 : Math.pow(1024, k - 1);

		},

		Out: function (k) {

			return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if ((k *= 2) < 1) {
				return 0.5 * Math.pow(1024, k - 1);
			}

			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

		}

	},

	Circular: {

		In: function (k) {

			return 1 - Math.sqrt(1 - k * k);

		},

		Out: function (k) {

			return Math.sqrt(1 - (--k * k));

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			return - (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));

		},

		Out: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			return (a * Math.pow(2, - 10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);

		},

		InOut: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			if ((k *= 2) < 1) {
				return - 0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
			}

			return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

		}

	},

	Back: {

		In: function (k) {

			var s = 1.70158;

			return k * k * ((s + 1) * k - s);

		},

		Out: function (k) {

			var s = 1.70158;

			return --k * k * ((s + 1) * k + s) + 1;

		},

		InOut: function (k) {

			var s = 1.70158 * 1.525;

			if ((k *= 2) < 1) {
				return 0.5 * (k * k * ((s + 1) * k - s));
			}

			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

		}

	},

	Bounce: {

		In: function (k) {

			return 1 - TWEEN.Easing.Bounce.Out(1 - k);

		},

		Out: function (k) {

			if (k < (1 / 2.75)) {
				return 7.5625 * k * k;
			} else if (k < (2 / 2.75)) {
				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
			} else if (k < (2.5 / 2.75)) {
				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
			} else {
				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
			}

		},

		InOut: function (k) {

			if (k < 0.5) {
				return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
			}

			return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.Linear;

		if (k < 0) {
			return fn(v[0], v[1], f);
		}

		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}

		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

	},

	Bezier: function (v, k) {

		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = TWEEN.Interpolation.Utils.Bernstein;

		for (var i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;

	},

	CatmullRom: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.CatmullRom;

		if (v[0] === v[m]) {

			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}

			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

		} else {

			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

		}

	},

	Utils: {

		Linear: function (p0, p1, t) {

			return (p1 - p0) * t + p0;

		},

		Bernstein: function (n, i) {

			var fc = TWEEN.Interpolation.Utils.Factorial;

			return fc(n) / fc(i) / fc(n - i);

		},

		Factorial: (function () {

			var a = [1];

			return function (n) {

				var s = 1;

				if (a[n]) {
					return a[n];
				}

				for (var i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;
				return s;

			};

		})(),

		CatmullRom: function (p0, p1, p2, p3, t) {

			var v0 = (p2 - p0) * 0.5;
			var v1 = (p3 - p1) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

		}

	}

};

// UMD (Universal Module Definition)
(function (root) {

	if (typeof define === 'function' && define.amd) {

		// AMD
		define([], function () {
			return TWEEN;
		});

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {

		// Node.js
		module.exports = TWEEN;

	} else if (root !== undefined) {

		// Global variable
		root.TWEEN = TWEEN;

	}

})(this);
;/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/*global THREE, console */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the control orbits around
	// and where it pans with respect to.
	this.target = new THREE.Vector3();

	// center is old, deprecated; use "target" instead
	this.center = this.target;

	// This option actually enables dollying in and out; left as "zoom" for
	// backwards compatibility
	this.noZoom = false;
	this.zoomSpeed = 1.0;

	// Limits to how far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// Limits to how far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// Set to true to disable this control
	this.noRotate = false;
	this.rotateSpeed = 0.15;

	// Set to true to disable this control
	this.noPan = true;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// Momentum
  	this.momentumDampingFactor = 0.90;
  	this.momentumScalingFactor = 0.005;

  	// Fov
  	this.minFov = 30;
  	this.maxFov = 120;

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to disable use of the keys
	this.noKeys = false;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

	////////////
	// internals

	var scope = this;

	var EPS = 0.000001;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();
	var panOffset = new THREE.Vector3();

	var offset = new THREE.Vector3();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	var theta;
	var phi;
	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;
	var pan = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();
	var lastQuaternion = new THREE.Quaternion();

	var momentumLeft, momentumUp;
	var eventCurrent, eventPrevious;
	var momentumOn = false;

	var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

	var state = STATE.NONE;

	// for reset

	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	// so camera.up is the orbit axis

	var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
	var quatInverse = quat.clone().inverse();

	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	this.setLastQuaternion = function ( quaternion ) {
		lastQuaternion.copy( quaternion );
		scope.object.quaternion.copy( quaternion );
	};

	this.getLastPosition = function () {
		return lastPosition;
	}

	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	// pass in distance in world space to move left
	this.panLeft = function ( distance ) {

		var te = this.object.matrix.elements;

		// get X column of matrix
		panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
		panOffset.multiplyScalar( - distance );

		pan.add( panOffset );

	};

	// pass in distance in world space to move up
	this.panUp = function ( distance ) {

		var te = this.object.matrix.elements;

		// get Y column of matrix
		panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
		panOffset.multiplyScalar( distance );

		pan.add( panOffset );

	};

	// pass in x,y of change desired in pixel space,
	// right and down are positive
	this.pan = function ( deltaX, deltaY ) {

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			// perspective
			var position = scope.object.position;
			var offset = position.clone().sub( scope.target );
			var targetDistance = offset.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

			// we actually don't use screenWidth, since perspective camera is fixed to screen height
			scope.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
			scope.panUp( 2 * deltaY * targetDistance / element.clientHeight );

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			// orthographic
			scope.panLeft( deltaX * (scope.object.right - scope.object.left) / element.clientWidth );
			scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight );

		} else {

			// camera neither orthographic or perspective
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

		}

	};

	this.momentum = function(){
		
		if(!momentumOn) return;

		if(Math.abs(momentumUp + momentumLeft) < 10e-5){ momentumOn = false; return }

		momentumUp   *= this.momentumDampingFactor;
		momentumLeft *= this.momentumDampingFactor;

		thetaDelta -= this.momentumScalingFactor * momentumLeft;
		phiDelta   -= this.momentumScalingFactor * momentumUp;

	};

	this.dollyIn = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			scope.dispatchEvent( changeEvent );

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );

		}

	};

	this.dollyOut = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			scope.dispatchEvent( changeEvent );

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );

		}

	};

	this.update = function () {

		var position = this.object.position;

		offset.copy( position ).sub( this.target );

		// rotate offset to "y-axis-is-up" space
		offset.applyQuaternion( quat );

		// angle from z-axis around y-axis

		theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate && state === STATE.NONE ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		this.momentum();

		theta += thetaDelta;
		phi += phiDelta;

		// restrict theta to be between desired limits
		theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, theta ) );

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

		// move target to panned location
		this.target.add( pan );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		// rotate offset back to "camera-up-vector-is-up" space
		offset.applyQuaternion( quatInverse );

		position.copy( this.target ).add( offset );

		this.object.lookAt( this.target );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;
		pan.set( 0, 0, 0 );

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8

		if ( lastPosition.distanceToSquared( this.object.position ) > EPS
		    || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );
			lastQuaternion.copy (this.object.quaternion );

		}

	};


	this.reset = function () {

		state = STATE.NONE;

		this.target.copy( this.target0 );
		this.object.position.copy( this.position0 );
		this.object.zoom = this.zoom0;

		this.object.updateProjectionMatrix();
		this.dispatchEvent( changeEvent );

		this.update();

	};

	this.getPolarAngle = function () {

		return phi;

	};

	this.getAzimuthalAngle = function () {

		return theta

	};

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function onMouseDown( event ) {

		momentumOn = false;

   		momentumLeft = momentumUp = 0;

		if ( scope.enabled === false ) return;
		event.preventDefault();

		if ( event.button === scope.mouseButtons.ORBIT ) {
			if ( scope.noRotate === true ) return;

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === scope.mouseButtons.ZOOM ) {
			if ( scope.noZoom === true ) return;

			state = STATE.DOLLY;

			dollyStart.set( event.clientX, event.clientY );

		} else if ( event.button === scope.mouseButtons.PAN ) {
			if ( scope.noPan === true ) return;

			state = STATE.PAN;

			panStart.set( event.clientX, event.clientY );

		}

		if ( state !== STATE.NONE ) {
			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			scope.dispatchEvent( startEvent );
		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( state === STATE.ROTATE ) {

			if ( scope.noRotate === true ) return;

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			// rotating across whole screen goes 360 degrees around
			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

			// rotating up and down along whole screen attempts to go 360, but limited to 180
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

			rotateStart.copy( rotateEnd );

			if( eventPrevious ){
				momentumLeft = event.clientX - eventPrevious.clientX;
				momentumUp = event.clientY - eventPrevious.clientY;
			}

			eventPrevious = event;

		} else if ( state === STATE.DOLLY ) {

			if ( scope.noZoom === true ) return;

			dollyEnd.set( event.clientX, event.clientY );
			dollyDelta.subVectors( dollyEnd, dollyStart );

			if ( dollyDelta.y > 0 ) {

				scope.dollyIn();

			} else if ( dollyDelta.y < 0 ) {

				scope.dollyOut();

			}

			dollyStart.copy( dollyEnd );

		} else if ( state === STATE.PAN ) {

			if ( scope.noPan === true ) return;

			panEnd.set( event.clientX, event.clientY );
			panDelta.subVectors( panEnd, panStart );

			scope.pan( panDelta.x, panDelta.y );

			panStart.copy( panEnd );

		}

		if ( state !== STATE.NONE ) scope.update();

	}

	function onMouseUp( /* event */ ) {

		momentumOn = true;

		eventPrevious = undefined;

		if ( scope.enabled === false ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		scope.dispatchEvent( endEvent );
		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.noZoom === true || state !== STATE.NONE ) return;

		event.preventDefault();
		event.stopPropagation();

		var delta = 0;

		if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail !== undefined ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			//scope.dollyOut();
			scope.object.fov = ( scope.object.fov < scope.maxFov ) 
				? scope.object.fov + 1
				: scope.maxFov;
			scope.object.updateProjectionMatrix();

		} else if ( delta < 0 ) {

			//scope.dollyIn();
			scope.object.fov = ( scope.object.fov > scope.minFov ) 
				? scope.object.fov - 1
				: scope.minFov;
			scope.object.updateProjectionMatrix();

		}

		scope.update();
		scope.dispatchEvent( startEvent );
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.noKeys === true || scope.noPan === true ) return;

		switch ( event.keyCode ) {

			case scope.keys.UP:
				scope.pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				scope.pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				scope.pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				scope.pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function touchstart( event ) {

		momentumOn = false;

		momentumLeft = momentumUp = 0;

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.noRotate === true ) return;

				state = STATE.TOUCH_ROTATE;

				rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.noZoom === true ) return;

				state = STATE.TOUCH_DOLLY;

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );
				//dollyStart.set( 0, distance );
				break;

			case 3: // three-fingered touch: pan

				if ( scope.noPan === true ) return;

				state = STATE.TOUCH_PAN;

				panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) scope.dispatchEvent( startEvent );

	}

	function touchmove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.noRotate === true ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return;

				rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				rotateDelta.subVectors( rotateEnd, rotateStart );

				// rotating across whole screen goes 360 degrees around
				scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
				// rotating up and down along whole screen attempts to go 360, but limited to 180
				scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

				rotateStart.copy( rotateEnd );

				if( eventPrevious ){
					momentumLeft = event.touches[ 0 ].pageX - eventPrevious.pageX;
					momentumUp = event.touches[ 0 ].pageY - eventPrevious.pageY;
				}

				eventPrevious = {
					pageX: event.touches[ 0 ].pageX,
					pageY: event.touches[ 0 ].pageY,
				};

				scope.update();
				break;

			case 2: // two-fingered touch: dolly

				if ( scope.noZoom === true ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return;

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );

				/*dollyEnd.set( 0, distance );
				dollyDelta.subVectors( dollyEnd, dollyStart );

				if ( dollyDelta.y > 0 ) {

					scope.dollyOut();

				} else if ( dollyDelta.y < 0 ) {

					scope.dollyIn();

				}

				dollyStart.copy( dollyEnd );*/

				if ( event.scale < 1 ) {

					scope.object.fov = ( scope.object.fov < scope.maxFov ) 
						? scope.object.fov + 1
						: scope.maxFov;
					scope.object.updateProjectionMatrix();

				} else if ( event.scale > 1 ) {

					scope.object.fov = ( scope.object.fov > scope.minFov ) 
						? scope.object.fov - 1
						: scope.minFov;
					scope.object.updateProjectionMatrix();

				}

				//console.log(distance, event);

				scope.update();
				break;

			case 3: // three-fingered touch: pan

				if ( scope.noPan === true ) return;
				if ( state !== STATE.TOUCH_PAN ) return;

				panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				panDelta.subVectors( panEnd, panStart );

				scope.pan( panDelta.x, panDelta.y );

				panStart.copy( panEnd );

				scope.update();
				break;

			default:

				state = STATE.NONE;

		}

	}

	function touchend( /* event */ ) {

		momentumOn = true;

		eventPrevious = undefined;

		if ( scope.enabled === false ) return;

		scope.dispatchEvent( endEvent );
		state = STATE.NONE;

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start
	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;;var GSVPANO = GSVPANO || {};
GSVPANO.PanoLoader = function (parameters) {

	'use strict';

	var _parameters = parameters || {},
		_location,
		_zoom,
		_panoId,
		_panoClient = new google.maps.StreetViewService(),
		_count = 0,
		_total = 0,
		_canvas = [],
		_ctx = [],
		_wc = 0,
		_hc = 0,
		result = null,
		rotation = 0,
		copyright = '',
		onSizeChange = null,
		onPanoramaLoad = null;

	var levelsW = [ 1, 2, 4, 7, 13, 26 ],
		levelsH = [ 1, 1, 2, 4, 7, 13 ];

	var widths = [ 416, 832, 1664, 3328, 6656, 13312 ],
		heights = [ 416, 416, 832, 1664, 3328, 6656 ];

	var gl = null;
	try{
		var canvas = document.createElement( 'canvas' );
	    gl = canvas.getContext('experimental-webgl');
	    if(gl == null){
	        gl = canvas.getContext('webgl');
	    }
	}
	catch(error){}

	var maxW = 1024,
		maxH = 1024;

	if( gl ) {
		var maxTexSize = Math.max( gl.getParameter(gl.MAX_TEXTURE_SIZE), 6656 );
		//alert( 'MAX_TEXTURE_SIZE ' + maxTexSize );
		maxW = maxH = maxTexSize;
	}
		
	this.setProgress = function (loaded, total) {
	
		if (this.onProgress) {
			this.onProgress({loaded: loaded, total: total});
		}
		
	};

	this.throwError = function (message) {
	
		if (this.onError) {
			this.onError(message);
		} else {
			console.error(message);
		}
		
	};

	this.adaptTextureToZoom = function () {
	
		var w = levelsW[ _zoom ] * 416,
			h = levelsH[ _zoom ] * 416;

		w = widths [ _zoom ];
		h = heights[ _zoom ];

		_wc = Math.ceil( w / maxW );
		_hc = Math.ceil( h / maxH );

		_canvas = []; _ctx = [];

		var ptr = 0;
		for( var y = 0; y < _hc; y++ ) {
			for( var x = 0; x < _wc; x++ ) {
				var c = document.createElement('canvas');//c.style.height='200px';document.body.insertBefore(c, document.body.children[0]);
				if( x < ( _wc - 1 ) ) c.width = maxW; else c.width = w - ( maxW * x );
				if( y < ( _hc - 1 ) ) c.height = maxH; else c.height = h - ( maxH * y );
				//console.log( 'New canvas of ' + c.width + 'x' + c.height );
				_canvas.push( c );
				_ctx.push( c.getContext('2d') );
				ptr++;
			}
		}

		//console.log( _canvas );

	};

	this.composeFromTile = function (x, y, texture) {
	
		x *= 512;
		y *= 512;
		var px = Math.floor( x / maxW ), py = Math.floor( y / maxH );

		x -= px * maxW;
		y -= py * maxH;

		_ctx[ py * _wc + px ].drawImage(texture, 0, 0, texture.width, texture.height, x, y, 512, 512 );
		this.progress();
		
	}; 

	this.progress = function() {

		_count++;
		
		var p = Math.round(_count * 100 / _total);
		this.setProgress(_count, _total);
		
		if (_count === _total) {
			this.canvas = _canvas;
			this.panoId = _panoId;
			this.zoom = _zoom;
			if (this.onPanoramaLoad) {
				this.onPanoramaLoad(_canvas[0]);
			}
		}
	}

	this.loadFromId = function( id ) {

		_panoId = id;
		this.composePanorama();

	};

	this.composePanorama = function () {
	
		this.setProgress(0, 1);
		//console.log('Loading panorama for zoom ' + _zoom + '...');
		
		var w = levelsW[ _zoom ],
			h = levelsH[ _zoom ],
			self = this,
			url,
			x,
			y;

			//console.log( w, h, w * 512, h * 512 );
			
		_count = 0;
		_total = w * h;

		var self = this;
		for( var y = 0; y < h; y++ ) {
			for( var x = 0; x < w; x++ ) {
				var url = 'https://cbks0.googleapis.com/cbk?output=tile&cb_client=maps_photos.ugc&v=4&gl=US&zoom=' + _zoom + '&x=' + x + '&y=' + y + '&panoid=' + _panoId;

				( function( x, y ) { 
					if( _parameters.useWebGL ) {
						var texture = THREE.ImageUtils.loadTexture( url, null, function() {
							//console.log( 'loaded ' + url );
							self.composeFromTile( x, y, texture );
						} );
					} else {
						var img = new Image();
						img.addEventListener( 'load', function() {
							self.composeFromTile( x, y, this );			
						} );
						img.crossOrigin = '';
						img.src = url;
					}
				} )( x, y );
			}
		}
		
	};
	
	this.load = function ( panoid ) {
	
		//console.log('Load for', location);
		var self = this;

		//var url = 'https://maps.google.com/cbk?output=json&hl=x-local&ll=' + location.lat() + ',' + location.lng() + '&cb_client=maps_sv&v=3';
		//url = 'https://cbks1.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=polygon&it=1%3A1&rank=closest&ll=' + location.lat() + ',' + location.lng() + '&radius=350';
		//url = 'https://cbks1.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=json&ll=' + location.lat() + ',' + location.lng();
		var url = 'https://cbks0.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=json&panoid=' + panoid;

		/*var http_request = new XMLHttpRequest();
		http_request.withCredentials = true;
		http_request.open( "GET", url, true );
		http_request.onreadystatechange = function () {
			if ( http_request.readyState == 4 && http_request.status == 200 ) {
				var data = JSON.parse( http_request.responseText );
				self.loadPano( location, data.Location.panoId );
				//self.loadPano( location, data.result[ 0 ].id );
			}
		};
		http_request.send(null);*/
		self.loadPano( panoid );

	};

	this.loadPano = function( id ) {

		//console.log( 'Load ' + id );
		var self = this;
		_panoClient.getPanoramaById( id, function (result, status) {
			if (status === google.maps.StreetViewStatus.OK) {
				self.result = result;
				if( self.onPanoramaData ) self.onPanoramaData( result );
				//var h = google.maps.geometry.spherical.computeHeading(location, result.location.latLng);
				//rotation = (result.tiles.centerHeading - h) * Math.PI / 180.0;
				copyright = result.copyright;
				self.copyright = result.copyright;
				_panoId = result.location.pano;
				self.location = location;
				self.composePanorama();
			} else {
				if( self.onNoPanoramaData ) self.onNoPanoramaData( status );
				self.throwError('Could not retrieve panorama for the following reason: ' + status);
			}
		});
		
	};
	
	this.setZoom = function( z ) {
		_zoom = z;
		//console.log( z );
		this.adaptTextureToZoom();
	};

	this.setZoom( _parameters.zoom || 1 );

};; /** The Bend modifier lets you bend the current selection up to 90 degrees about a single axis,
 * producing a uniform bend in an object's geometry.
 * You can control the angle and direction of the bend on any of three axes.
 * The geometry has to have rather large number of polygons!
 * options:
 * 	 direction - deformation direction (in local coordinates!). 
 * 	 axis - deformation axis (in local coordinates!). Vector of direction and axis are perpendicular.
 * 	 angle - deformation angle.
 * @author Vildanov Almaz / alvild@gmail.com
 * The algorithm of a bend is based on the chain line cosh: y = 1/b * cosh(b*x) - 1/b. It can be used only in three.js.
 */

THREE.BendModifier = function () {

};

THREE.BendModifier.prototype = {

    constructor: THREE.BendModifier,

    set: function ( direction, axis, angle ) {
        this.direction = new THREE.Vector3(); this.direction.copy( direction );
		this.axis = new THREE.Vector3(); this.axis.copy( axis );
        this.angle = angle;
        return this
    },

	_sign: function (a) {
        return 0 > a ? -1 : 0 < a ? 1 : 0
    },

	_cosh: function( x )  {
		return ( Math.exp( x ) + Math.exp( -x ) ) / 2;
	},

	_sinhInverse: function( x )  {
			return  Math.log( Math.abs( x ) + Math.sqrt( x * x + 1 ) );
	},

    modify: function ( geometry ) {

		var thirdAxis = new THREE.Vector3();  thirdAxis.crossVectors( this.direction, this.axis );

		// P - matrices of the change-of-coordinates
		var P = new THREE.Matrix4();
		P.set ( thirdAxis.x, thirdAxis.y, thirdAxis.z, 0, 
			this.direction.x, this.direction.y, this.direction.z, 0, 
			this.axis.x, this.axis.y, this.axis.z, 0, 
			0, 0, 0, 1 ).transpose();

		var InverseP =  new THREE.Matrix3().getInverse( P );
		var newVertices = []; var oldVertices = []; var anglesBetweenOldandNewVertices = [];

		var meshGeometryBoundingBoxMaxx = 0; var meshGeometryBoundingBoxMinx = 0;
		var meshGeometryBoundingBoxMaxy = 0; var meshGeometryBoundingBoxMiny = 0;

		for (var i = 0; i < geometry.vertices.length; i++)  {

			newVertices[i] = new THREE.Vector3(); newVertices[i].copy( geometry.vertices[i] ).applyMatrix3( InverseP );
			if ( newVertices[i].x > meshGeometryBoundingBoxMaxx ) { meshGeometryBoundingBoxMaxx = newVertices[i].x; }
			if ( newVertices[i].x < meshGeometryBoundingBoxMinx ) { meshGeometryBoundingBoxMinx = newVertices[i].x; }
			if ( newVertices[i].y > meshGeometryBoundingBoxMaxy ) { meshGeometryBoundingBoxMaxy = newVertices[i].y; }
			if ( newVertices[i].y < meshGeometryBoundingBoxMiny ) { meshGeometryBoundingBoxMiny = newVertices[i].y; }

		}

		var meshWidthold =  meshGeometryBoundingBoxMaxx - meshGeometryBoundingBoxMinx;
		var meshDepth =  meshGeometryBoundingBoxMaxy - meshGeometryBoundingBoxMiny;
		var ParamB = 2 * this._sinhInverse( Math.tan( this.angle ) ) / meshWidthold;
		var oldMiddlex = (meshGeometryBoundingBoxMaxx + meshGeometryBoundingBoxMinx) / 2;
		var oldMiddley = (meshGeometryBoundingBoxMaxy + meshGeometryBoundingBoxMiny) / 2;

		for (var i = 0; i < geometry.vertices.length; i++ )  {

			oldVertices[i] = new THREE.Vector3(); oldVertices[i].copy( newVertices[i] );
			newVertices[i].x = this._sign( newVertices[i].x - oldMiddlex ) * 1 / ParamB * this._sinhInverse( ( newVertices[i].x - oldMiddlex ) * ParamB );

		}

		var meshWidth = 2 / ParamB * this._sinhInverse( meshWidthold / 2 * ParamB );

		var NewParamB = 2 * this._sinhInverse( Math.tan( this.angle ) ) / meshWidth;

		var rightEdgePos = new THREE.Vector3( meshWidth / 2, -meshDepth / 2, 0 );
		rightEdgePos.y = 1 / NewParamB * this._cosh( NewParamB * rightEdgePos.x ) - 1 / NewParamB - meshDepth / 2;

		var bendCenter = new THREE.Vector3( 0, rightEdgePos.y  + rightEdgePos.x / Math.tan( this.angle ), 0 );

		for ( var i = 0; i < geometry.vertices.length; i++ )  {

			var x0 = this._sign( oldVertices[i].x - oldMiddlex ) * 1 / ParamB * this._sinhInverse( ( oldVertices[i].x - oldMiddlex ) * ParamB );
			var y0 = 1 / NewParamB * this._cosh( NewParamB * x0 ) - 1 / NewParamB;

			var k = new THREE.Vector3( bendCenter.x - x0, bendCenter.y - ( y0 - meshDepth / 2 ), bendCenter.z ).normalize();

			var Q = new THREE.Vector3();
			Q.addVectors( new THREE.Vector3( x0, y0 - meshDepth / 2, oldVertices[i].z ), k.multiplyScalar( oldVertices[i].y + meshDepth / 2 ) );
			newVertices[i].x = Q.x;  newVertices[i].y = Q.y;

		}	

		var middle = oldMiddlex * meshWidth / meshWidthold;

		for ( var i = 0; i < geometry.vertices.length; i++ )  {

			var O = new THREE.Vector3( oldMiddlex, oldMiddley, oldVertices[i].z );
			var p = new THREE.Vector3(); p.subVectors( oldVertices[i], O );
			var q = new THREE.Vector3(); q.subVectors( newVertices[i], O );

			anglesBetweenOldandNewVertices[i] = Math.acos( 1 / this._cosh( ParamB * newVertices[i].x ) )  * this._sign( newVertices[i].x );

			newVertices[i].x = newVertices[i].x + middle;
			geometry.vertices[i].copy( newVertices[i].applyMatrix4( P ) );

		}

		geometry.computeFaceNormals();
		geometry.verticesNeedUpdate = true;
		geometry.normalsNeedUpdate = true;

		// compute Vertex Normals
		var fvNames = [ 'a', 'b', 'c', 'd' ];

		for ( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

			var face = geometry.faces[ f ];
			if ( face.vertexNormals === undefined ) {
				continue;
			}
			for ( var v = 0, vl = face.vertexNormals.length; v < vl; v ++ ) {

				var angle = anglesBetweenOldandNewVertices[ face[ fvNames[ v ] ] ];
				var x = this.axis.x,
					y = this.axis.y,
					z = this.axis.z;

				var rotateMatrix = new THREE.Matrix3();
				rotateMatrix.set ( Math.cos(angle) + (1-Math.cos(angle))*x*x, (1-Math.cos(angle))*x*y - Math.sin(angle)*z, (1-Math.cos(angle))*x*z + Math.sin(angle)*y,
								(1-Math.cos(angle))*y*x + Math.sin(angle)*z, Math.cos(angle) + (1-Math.cos(angle))*y*y, (1-Math.cos(angle))*y*z - Math.sin(angle)*x,
								(1-Math.cos(angle))*z*x - Math.sin(angle)*y, (1-Math.cos(angle))*z*y + Math.sin(angle)*x, Math.cos(angle) + (1-Math.cos(angle))*z*z );

				face.vertexNormals[ v ].applyMatrix3( rotateMatrix );

				}

			}
		// end compute Vertex Normals			

		return this			
    }	
};/**
 * @author pchen66
 * @namespace PANOLENS
 */

window.PANOLENS = {};
;(function(){

	'use strict';

	/**
	 * Data Image
	 * @memberOf PANOLENS
	 * @enum {string}
	 */
	PANOLENS.DataImage = {

		Info: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEzLDlIMTFWN0gxM00xMywxN0gxMVYxMUgxM00xMiwyQTEwLDEwIDAgMCwwIDIsMTJBMTAsMTAgMCAwLDAgMTIsMjJBMTAsMTAgMCAwLDAgMjIsMTJBMTAsMTAgMCAwLDAgMTIsMloiIC8+PC9zdmc+',
		Arrow: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyLDIyQTEwLDEwIDAgMCwxIDIsMTJBMTAsMTAgMCAwLDEgMTIsMkExMCwxMCAwIDAsMSAyMiwxMkExMCwxMCAwIDAsMSAxMiwyMk0xMiw3TDcsMTJIMTBWMTZIMTRWMTJIMTdMMTIsN1oiIC8+PC9zdmc+',
		FullscreenEnter: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICAgIDxwYXRoIGQ9Ik03IDE0SDV2NWg1di0ySDd2LTN6bS0yLTRoMlY3aDNWNUg1djV6bTEyIDdoLTN2Mmg1di01aC0ydjN6TTE0IDV2MmgzdjNoMlY1aC01eiIvPgo8L3N2Zz4=',
		FullscreenLeave: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTE0LDE0SDE5VjE2SDE2VjE5SDE0VjE0TTUsMTRIMTBWMTlIOFYxNkg1VjE0TTgsNUgxMFYxMEg1VjhIOFY1TTE5LDhWMTBIMTRWNUgxNlY4SDE5WiIgLz48L3N2Zz4=',
		Orbit: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDYwIDYwIiBoZWlnaHQ9IjY0cHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA2MCA2MCIgd2lkdGg9IjY0cHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIGZpbGw9IiNmZmYiPjxnPjxnPjxwb2x5Z29uIHBvaW50cz0iNTYsMjUgNTMuNDM5LDI1IDU2LjY0MSwyOSA1MCwyOSA1MCwzMSA1Ni42MzksMzEgNTMuNDM5LDM1IDU2LDM1IDYwLDI5Ljk5OSAgICAiLz48cG9seWdvbiBwb2ludHM9IjQsMzUgNi41NjEsMzUgMy4zNTksMzEgMTAsMzEgMTAsMjkgMy4zNjEsMjkgNi41NjEsMjUgNCwyNSAwLDMwLjAwMSAgICAiLz48cG9seWdvbiBwb2ludHM9IjM1LDU2IDM1LDUzLjQzOCAzMSw1Ni42NCAzMSw1MCAyOSw1MCAyOSw1Ni42MzkgMjUsNTMuNDM4IDI1LDU2IDMwLjAwMiw2MCAgICAiLz48cG9seWdvbiBwb2ludHM9IjI1LDQgMjUsNi41NjIgMjksMy4zNTkgMjksMTAgMzEsMTAgMzEsMy4zNiAzNSw2LjU2MiAzNSw0IDI5Ljk5OCwwICAgICIvPjxnPjxwYXRoIGQ9Ik0zOC4wOTgsNDAuMTUyQzM3LjkyNCwyOC4xNjIsMzUuOTgyLDIzLDMwLDIzcy03LjkyNCw1LjE2Mi04LjA5OCwxNy4xNTJDMTguOTIsMzcuNzY5LDE3LDM0LjEwNiwxNywzMCAgICAgIGMwLTcuMTY5LDUuODMtMTMsMTMtMTNzMTMsNS44MzEsMTMsMTNDNDMsMzQuMTA2LDQxLjA4LDM3Ljc2OSwzOC4wOTgsNDAuMTUyIE0yOS45OCwzNC45ODhjLTYuMDE2LDAtNS4xMjctNy4zMS01LjEyNy03LjMxICAgICAgczEuMDI3LTIuMzE2LDUuMTI3LTIuMzE2YzQuMTAyLDAsNS4xNywyLjMxNiw1LjE3LDIuMzE2UzM1Ljk5NiwzNC45ODgsMjkuOTgsMzQuOTg4IE0zMCwxNWMtOC4yNzEsMC0xNSw2LjcyOS0xNSwxNSAgICAgIGMwLDguMjcxLDYuNzI5LDE1LDE1LDE1czE1LTYuNzI5LDE1LTE1QzQ1LDIxLjcyOSwzOC4yNzEsMTUsMzAsMTUiLz48L2c+PC9nPjwvZz48L3N2Zz4=', 
		Gyro: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNjRweCIgaGVpZ2h0PSI2NHB4IiB2aWV3Qm94PSIxMjAgMTIwIDI2MCAyNjAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwMCA1MDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xOTUuNiwyNjAuMWMxLjksMi43LDUuMSw0LjYsOC42LDQuNmM0LjQsMCw4LjctMy40LDguNy04LjRjMC00LjgtNC04LjUtOS4xLTguNWMtMS45LDAtMy44LDAuNS01LjYsMS4zDQoJCQl2LTUuM2w4LjctMTAuM2gtMTUuNXYtOGgyOC4ydjUuM2wtOC40LDEwLjNjNi40LDIuNSwxMC43LDgsMTAuNywxNWMwLDkuOC03LjcsMTYuNC0xNy4zLDE2LjRjLTUuOCwwLTExLjMtMi42LTE1LjQtNy4yDQoJCQlMMTk1LjYsMjYwLjF6Ii8+DQoJCTxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yNTMuOSwyMjUuNmwtOC43LDE0LjhoMC42YzguOCwwLDE2LjIsNi43LDE2LjIsMTZjMCw5LTcuNSwxNi4zLTE2LjUsMTYuM2MtOC43LDAtMTctNi4yLTE3LTE1LjgNCgkJCWMwLTQuNiwyLjEtOC43LDQuNi0xMi44bDEwLjktMTguNEgyNTMuOXogTTIzNy4xLDI1Ni44YzAsNC40LDMuNyw3LjksOC4yLDcuOWM0LjYsMCw3LjgtMy42LDcuOC04LjFjMC00LjQtMy4zLTguMy04LjMtOC4zDQoJCQljLTEuNywwLTMuMiwwLjMtNSwxLjFDMjM4LjcsMjUxLjIsMjM3LjEsMjUzLjcsMjM3LjEsMjU2Ljh6Ii8+DQoJCTxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yODQuNiwyMjVjMTEuOSwwLDE2LjIsMTAuNywxNi4yLDIzLjljMCwxMy4yLTQuNCwyMy45LTE2LjIsMjMuOWMtMTEuOSwwLTE2LjItMTAuNy0xNi4yLTIzLjkNCgkJCUMyNjguMywyMzUuNiwyNzIuNywyMjUsMjg0LjYsMjI1eiBNMjg0LjYsMjMyLjljLTUuNCwwLTcuMyw3LjItNy4zLDE1LjljMCw4LjcsMS45LDE1LjksNy4zLDE1LjljNS40LDAsNy4zLTcuMiw3LjMtMTUuOQ0KCQkJQzI5MS44LDI0MC4xLDI4OS45LDIzMi45LDI4NC42LDIzMi45eiIvPg0KCQk8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMzE2LjQsMjIxLjZjNCwwLDcuMywzLjIsNy4zLDcuM2MwLDQtMy4yLDcuMy03LjMsNy4zYy00LDAtNy4zLTMuMi03LjMtNy4zDQoJCQlDMzA5LjEsMjI0LjksMzEyLjMsMjIxLjYsMzE2LjQsMjIxLjZ6IE0zMTYuNCwyMzAuOWMxLjEsMCwyLTAuOSwyLTJjMC0xLjEtMC45LTItMi0yYy0xLjEsMC0yLDAuOS0yLDINCgkJCUMzMTQuNCwyMzAuMSwzMTUuMywyMzAuOSwzMTYuNCwyMzAuOXoiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yNTAuNSwzNzYuNWMtNzAsMC0xMjctNTctMTI3LTEyN3M1Ny0xMjcsMTI3LTEyN2MyOC44LDAsNTYsOS40LDc4LjYsMjcuMmwtNy43LDkuOA0KCQkJYy0yMC40LTE2LTQ0LjktMjQuNS03MC44LTI0LjVDMTg3LjMsMTM1LDEzNiwxODYuMywxMzYsMjQ5LjVTMTg3LjMsMzY0LDI1MC41LDM2NGM2My4yLDAsMTE0LjUtNTEuNCwxMTQuNS0xMTQuNQ0KCQkJYzAtMjYuNy05LjQtNTIuNy0yNi41LTczLjNsOS42LThjMTguOSwyMi43LDI5LjQsNTEuNiwyOS40LDgxLjJDMzc3LjUsMzE5LjUsMzIwLjUsMzc2LjUsMjUwLjUsMzc2LjV6Ii8+DQoJCTxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iMzMxLjgsMTYwLjEgMzM1LjgsMTk4LjggMzY5LjcsMTcyLjYgCQkiLz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4NCg==',
		VideoPlay: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTgsNS4xNFYxOS4xNEwxOSwxMi4xNEw4LDUuMTRaIiAvPjwvc3ZnPg==',
		VideoPause: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTE0LDE5LjE0SDE4VjUuMTRIMTRNNiwxOS4xNEgxMFY1LjE0SDZWMTkuMTRaIiAvPjwvc3ZnPg==',
		Cardboard: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMjAuNzQgNkgzLjIxQzIuNTUgNiAyIDYuNTcgMiA3LjI4djEwLjQ0YzAgLjcuNTUgMS4yOCAxLjIzIDEuMjhoNC43OWMuNTIgMCAuOTYtLjMzIDEuMTQtLjc5bDEuNC0zLjQ4Yy4yMy0uNTkuNzktMS4wMSAxLjQ0LTEuMDFzMS4yMS40MiAxLjQ1IDEuMDFsMS4zOSAzLjQ4Yy4xOS40Ni42My43OSAxLjExLjc5aDQuNzljLjcxIDAgMS4yNi0uNTcgMS4yNi0xLjI4VjcuMjhjMC0uNy0uNTUtMS4yOC0xLjI2LTEuMjh6TTcuNSAxNC42MmMtMS4xNyAwLTIuMTMtLjk1LTIuMTMtMi4xMiAwLTEuMTcuOTYtMi4xMyAyLjEzLTIuMTMgMS4xOCAwIDIuMTIuOTYgMi4xMiAyLjEzcy0uOTUgMi4xMi0yLjEyIDIuMTJ6bTkgMGMtMS4xNyAwLTIuMTMtLjk1LTIuMTMtMi4xMiAwLTEuMTcuOTYtMi4xMyAyLjEzLTIuMTNzMi4xMi45NiAyLjEyIDIuMTMtLjk1IDIuMTItMi4xMiAyLjEyeiIvPgogICAgPHBhdGggZmlsbD0ibm9uZSIgZD0iTTAgMGgyNHYyNEgwVjB6Ii8+Cjwvc3ZnPgo=',
		WhiteTile: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIABAMAAAAGVsnJAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAACRQTFRFAAAAAAAABgYGBwcHHh4eKysrx8fHy8vLzMzM7OzsAAAABgYG+q7SZgAAAAp0Uk5TAP7+/v7+/v7+/iJx/a8AAAOwSURBVHja7d0hbsNAEAVQo6SFI6XEcALDcgNLvUBvEBQVhpkWVYWlhSsVFS7t5QIshRt695lEASZP+8c7a1kzDL1fz+/zyuvzp6FbvoddrL6uDd1yGZ5eXldeb18N3fIx7A+58prmhm65DfvDcd0952lu6JabFbD/zVprZj1lzcys+fj9z8xTZtbT8rv8yWlu6BYAIgAAAAAAAAAAAABAM6QXEAEAAAAAAAAAgJ2gnaAIiIA3Q2qAGgAAAAAAAAAAAAAAAAAAAAAAAAAAQJsADkVFAAAAAAA8Bj0GRUAEREAEREAEREAEREAEAAAAAAAAAAB2gnaCIiACPplRA9QANUAERAAAAEVQERQBERCBVlfAcZ3aeZobusUKMGBhV6KUElHGKBERJR6/fxExRkQZl9/lT8S1oVsuhqyYMmPKjCkzvfcCpsxohrwY0Q06EAEAAAAAAAAAAACgGdILiAAAAAAAAAAAwE7QTlAERMCbITVADQAAAAAAAAAAAAAAAAAAAAAAAAAAwKmwQ1ERAAAAAACPQY9BERABERABERABERABERABAAAAAAAAAICdoJ2gCIiAT2bUADVADRABEQAAQBFUBEVABERgEyvAlJm+V4ApM6bMmDJjyowpM6bMdN0LmDKjGfJiRDfoQAQAAAAAAAAAAACAZkgvIAIAAAAAAAAAADtBO0EREAFvhtQANQAAAAAAAAAAAAAAAAAAAAAAAAAAAKfCDkVFAAAAAAA8Bj0GRUAEREAEREAEREAEREAEAAAAAAAAAAB2gnaCIiACPplRA9QANUAERAAAAEVQERQBERCBTawAU2b6XgGmzJgyY8qMKTOmzJgy03UvYMqMZsiLEd2gAxEAAAAAAAAAAAAAmiG9gAgAAAAAAAAAAOwE7QRFQAS8GVID1AAAAAAAAAAAAAAAAAAAAAAAAAAAAJwKOxQVAQAAAADwGPQYFAEREAEREAEREAEREAERAAAAAAAAAADYCdoJioAI+GRGDVAD1AAREAEAABRBRVAEREAENrECTJnpewWYMmPKjCkzpsyYMmPKTNe9gCkzmiEvRnSDDkQAAAAAAAAAAAAAaIb0AiIAAAAAAAAAALATtBMUARHwZkgNUAMAAAAAAAAAAAAAAAAAAAAAAAAAAHAq7FBUBAAAAADAY9BjUAREQAREQAREQAREQAREAAAAAAAAAABgJ2gnKAIi4JMZNUANUANEQAQAAFAEFUEREAER2MQKMGWm7xVgyowpM50PWen9ugNGXz1XaocAFgAAAABJRU5ErkJggg=='
	
	};

})();;(function(){

	'use strict';

	/**
	 * Modes
	 * @memberOf PANOLENS
	 * @enum {number}
	 */
	PANOLENS.Modes = {

		/** Current viewer state is unknown */
		UNKNOWN: 0,

		/** Current viewer state is normal */
		NORMAL: 1,

		/** Current viewer state is in vr mode*/
		VR: 2

	};

})();;(function(){
	
	'use strict';

	/**
	 * Utility
	 * @namespace PANOLENS.Utils
	 * @memberOf PANOLENS
	 * @type {object}
	 */
	PANOLENS.Utils = {};

})();;(function(){
	
	'use strict';

	/**
	 * Image loader with progress based on {@link https://github.com/mrdoob/three.js/blob/master/src/loaders/ImageLoader.js}
	 * @memberOf PANOLENS.Utils
	 * @namespace
	 */
	PANOLENS.Utils.ImageLoader = {};

	/**
	 * Load an image with XMLHttpRequest to provide progress checking
	 * @param  {string}   url        - An image url
	 * @param  {function} onLoad     - On load callback
	 * @param  {function} onProgress - In progress callback
	 * @param  {function} onError    - On error callback
	 * @return {HTMLImageElement}    - DOM image element
	 */
	PANOLENS.Utils.ImageLoader.checkDataURL = function ( url ) {
		return !!url.match( /^\s*data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i );
	};

	PANOLENS.Utils.ImageLoader.load = function ( url, onLoad, onProgress, onError ) {

		var cached, request, arrayBufferView, blob, urlCreator, image;
		
		// Cached
		cached = THREE.Cache.get( url );

		if ( cached !== undefined ) {

			if ( onLoad ) {

				setTimeout( function () {

					onLoad( cached );

				}, 0 );

			}

			return cached;

		}
		
		// Construct a new XMLHttpRequest
		urlCreator = window.URL || window.webkitURL;
		image = document.createElement( 'img' );
		
		// Add to cache
		THREE.Cache.add( url, image );

		function onImageLoaded () {

			onLoad && onLoad( image );

		}

		if ( this.checkDataURL( url ) ) {

			image.addEventListener( 'load', onImageLoaded, false );
			image.src = url;
			return image;
		}

		image.crossOrigin = this.crossOrigin !== undefined ? this.crossOrigin : '';

		request = new XMLHttpRequest();
		request.responseType = 'arraybuffer';
		request.open( 'GET', url, true );
		request.onprogress = function ( event ) {

		    if ( event.lengthComputable ) {

		      onProgress && onProgress( { loaded: event.loaded, total: event.total } );

		    }

		};
		request.onloadend = function( event ) {

		    arrayBufferView = new Uint8Array( this.response );
		    blob = new Blob( [ arrayBufferView ] );
		    
		    image.addEventListener( 'load', onImageLoaded, false );
			image.src = urlCreator.createObjectURL( blob );

		};

		request.send(null);

	};

	// Enable cache
	THREE.Cache.enabled = true;

})();;(function(){
	
	'use strict';

	/**
	 * Texture loader based on {@link https://github.com/mrdoob/three.js/blob/master/src/loaders/TextureLoader.js}
	 * @memberOf PANOLENS.Utils
	 * @namespace
	 */
	PANOLENS.Utils.TextureLoader = {};

	/**
	 * Load image texture
	 * @param  {string}   url        - An image url
	 * @param  {function} onLoad     - On load callback
	 * @param  {function} onProgress - In progress callback
	 * @param  {function} onError    - On error callback
	 * @return {THREE.Texture}   	 - Image texture
	 */
	PANOLENS.Utils.TextureLoader.load = function ( url, onLoad, onProgress, onError ) {

		var texture = new THREE.Texture(); 

		PANOLENS.Utils.ImageLoader.load( url, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

			onLoad && onLoad( texture );

		}, onProgress, onError );

		return texture;

	};

})();;(function(){
	
	'use strict';

	/**
	 * Cube Texture Loader based on {@link https://github.com/mrdoob/three.js/blob/master/src/loaders/CubeTextureLoader.js}
	 * @memberOf PANOLENS.Utils
	 * @namespace
	 */
	PANOLENS.Utils.CubeTextureLoader = {};

	/**
	 * Load 6 images as a cube texture
	 * @param  {array}   urls        - Array with 6 image urls
	 * @param  {function} onLoad     - On load callback
	 * @param  {function} onProgress - In progress callback
	 * @param  {function} onError    - On error callback
	 * @return {THREE.CubeTexture}   - Cube texture
	 */
	PANOLENS.Utils.CubeTextureLoader.load = function ( urls, onLoad, onProgress, onError ) {

		var texture, loaded, progress, all, loadings;

		texture = new THREE.CubeTexture( [] );

		loaded = 0;
		progress = {};
		all = {};

		urls.map( function ( url, index ) {

			PANOLENS.Utils.ImageLoader.load( url, function ( image ) {

				texture.images[ index ] = image;

				loaded++;

				if ( loaded === 6 ) {

					texture.needsUpdate = true;

					onLoad && onLoad( texture );

				}

			}, function ( event ) {

				progress[ index ] = { loaded: event.loaded, total: event.total };

				all.loaded = 0;
				all.total = 0;
				loadings = 0;

				for ( var i in progress ) {

					loadings++;
					all.loaded += progress[ i ].loaded;
					all.total += progress[ i ].total;

				}

				if ( loadings < 6 ) {

					all.total = all.total / loadings * 6;

				}

				onProgress && onProgress( all );

			}, onError );

		} );

		return texture;

	};

})();;( function () {

	'use strict';

	/**
	 * Skeleton panorama derived from THREE.Mesh
	 * @constructor
	 * @param {THREE.Geometry} geometry - The geometry for this panorama
	 * @param {THREE.Material} material - The material for this panorama
	 */
	PANOLENS.Panorama = function ( geometry, material ) {

		THREE.Mesh.call( this );

		this.type = 'panorama';

		this.ImageQualityLow = 1;
		this.ImageQualityFair = 2;
		this.ImageQualityMedium = 3;
		this.ImageQualityHigh = 4;
		this.ImageQualitySuperHigh = 5;

		this.animationDuration = 500;

		this.defaultInfospotSize = 350;

		this.loaded = false;

		this.linkedSpots = [];

		this.isInfospotVisible = false;
		
		this.linkingImageURL = undefined;
		this.linkingImageScale = undefined;

		this.geometry = geometry;

		this.material = material;
		this.material.side = THREE.DoubleSide;
		this.material.visible = false;

		this.scale.x *= -1;

		this.orbitRadius = ( geometry.parameter && geometry.parameter.radius ) 
			? geometry.parameter.radius
			: 100;

		this.addEventListener( 'load', this.fadeIn.bind( this ) );

	}

	PANOLENS.Panorama.prototype = Object.create( THREE.Mesh.prototype );

	PANOLENS.Panorama.prototype.constructor = PANOLENS.Panorama;

	/**
	 * Adding an object
	 * To counter the scale.x = -1, it will automatically add an 
	 * empty object with inverted scale on x
	 * @param {THREE.Object3D} object - The object to be added
	 */
	PANOLENS.Panorama.prototype.add = function ( object ) {

		var invertedObject;

		if ( arguments.length > 1 ) {

			for ( var i = 0; i < arguments.length; i ++ ) {

				this.add( arguments[ i ] );

			}

			return this;

		}

		// In case of infospots
		if ( object instanceof PANOLENS.Infospot ) {

			invertedObject = object;

		} else {

			// Counter scale.x = -1 effect
			invertedObject = new THREE.Object3D();
			invertedObject.scale.x = -1;
			invertedObject.add( object );

		}

		THREE.Object3D.prototype.add.call( this, invertedObject );

	};

	PANOLENS.Panorama.prototype.load = function () {

		this.onLoad();
		
	};

	/**
	 * This will be called when panorama is loaded
	 * @fires PANOLENS.Panorama#load
	 */
	PANOLENS.Panorama.prototype.onLoad = function () {

		this.toggleInfospotVisibility( true );

		this.loaded = true;

		/**
		 * Load panorama event
		 * @type {object}
		 * @event PANOLENS.Panorama#load
		 */
		this.dispatchEvent( { type: 'load' } );

	};

	/**
	 * This will be called when panorama is in progress
	 * @fires PANOLENS.Panorama#progress
	 */
	PANOLENS.Panorama.prototype.onProgress = function ( progress ) {

		/**
		 * Loading panorama progress event
		 * @type {object}
		 * @event PANOLENS.Panorama#progress
	 	 * @property {object} progress - The progress object containing loaded and total amount
		 */
		this.dispatchEvent( { type: 'progress', progress: progress } );

	};

	/**
	 * This will be called when panorama loading has error
	 * @fires PANOLENS.Panorama#error
	 */
	PANOLENS.Panorama.prototype.onError = function () {

		/**
		 * Loading panorama error event
		 * @type {object}
		 * @event PANOLENS.Panorama#error
		 */
		this.dispatchEvent( { type: 'error' } );

	};

	/**
	 * Get zoom level based on window width
	 * @return {number} zoom level indicating image quality
	 */
	PANOLENS.Panorama.prototype.getZoomLevel = function () {

		var zoomLevel;

		if ( window.innerWidth <= 800 ) {

			zoomLevel = this.ImageQualityFair;

		} else if ( window.innerWidth > 800 &&  window.innerWidth <= 1280 ) {

			zoomLevel = this.ImageQualityMedium;

		} else if ( window.innerWidth > 1280 && window.innerWidth <= 1920 ) {

			zoomLevel = this.ImageQualityHigh;

		} else if ( window.innerWidth > 1920 ) {

			zoomLevel = this.ImageQualitySuperHigh;

		} else {

			zoomLevel = this.ImageQualityLow;

		}

		return zoomLevel;

	};

	/**
	 * Update texture of a panorama
	 * @param {THREE.Texture} texture - Texture to be updated
	 */
	PANOLENS.Panorama.prototype.updateTexture = function ( texture ) {

		this.material.map = texture;

		this.material.needsUpdate = true;

	};

	/**
	 * Toggle visibility of infospots in this panorama
	 * @param  {boolean} isVisible - Visibility of infospots
	 * @param  {number} delay - Delay in milliseconds to change visibility
	 */
	PANOLENS.Panorama.prototype.toggleInfospotVisibility = function ( isVisible, delay ) {

		delay = ( delay !== undefined ) ? delay : 0;

		var scope, visible;

		scope = this;
		visible = ( isVisible !== undefined ) ? isVisible : ( this.isInfospotVisible ? false : true );

		this.traverse( function ( object ) {

			if ( object instanceof PANOLENS.Infospot ) {

				visible ? object.show( delay ) : object.hide( delay );

			}

		} );

		this.isInfospotVisible = visible;

	};

	/**
	 * Set image of this panorama's linking infospot
	 * @param {string} url   - Url to the image asset
	 * @param {number} scale - Scale factor of the infospot
	 */
	PANOLENS.Panorama.prototype.setLinkingImage = function ( url, scale ) {

		this.linkingImageURL = url;
		this.linkingImageScale = scale;

	};

	/**
	 * Link two panorama bidirectionally by attaching infospot on each other
	 * @param  {PANOLENS.Panorama} pano  - The panorama to be linked to
	 * @param  {boolean} ended - If this linking is the second / last iteration
	 */
	PANOLENS.Panorama.prototype.link = function ( pano, ended ) {

		var scope = this, spot, raycaster, intersect, point;

		this.visible = true;

		raycaster = new THREE.Raycaster();
		raycaster.set( this.position, pano.position.clone().sub( this.position ).normalize() );
		intersect = raycaster.intersectObject( this );

		if ( intersect.length > 0 ) {

			point = intersect[ intersect.length - 1 ].point.clone().multiplyScalar( 0.99 );

		} else {

			console.warn( 'Panoramas should be at different position' );
			return;

		}

		spot = new PANOLENS.Infospot( 
			pano.linkingImageScale !== undefined ? pano.linkingImageScale : this.defaultInfospotSize, 
			pano.linkingImageURL !== undefined ? pano.linkingImageURL : PANOLENS.DataImage.Arrow 
		);
        spot.position.copy( point );
        spot.toPanorama = pano;
        spot.addEventListener( 'click', function () {

        	/**
        	 * Viewer handler event
        	 * @type {object}
        	 * @event PANOLENS.Panorama#panolens-viewer-handler
        	 * @property {string} method - Viewer function name
        	 * @property {*} data - The argument to be passed into the method
        	 */
        	scope.dispatchEvent( { type : 'panolens-viewer-handler', method: 'setPanorama', data: pano } );

        } );

        this.linkedSpots.push( spot );

        this.add( spot );

        this.visible = false;

        if ( !ended ) {

        	pano.link( this, true );

        }

	};

	PANOLENS.Panorama.prototype.reset = function () {

		this.children.length = 0;	

	};

	/**
	 * Start fading in animation
	 */
	PANOLENS.Panorama.prototype.fadeIn = function () {

		new TWEEN.Tween( this.material )
		.to( { opacity: 1 }, this.animationDuration )
		.easing( TWEEN.Easing.Quartic.Out )
		.start();

	};

	/**
	 * Start fading out animation
	 */
	PANOLENS.Panorama.prototype.fadeOut = function () {

		new TWEEN.Tween( this.material )
		.to( { opacity: 0 }, this.animationDuration )
		.easing( TWEEN.Easing.Quartic.Out )
		.start();

	};

	/**
	 * This will be called when entering a panorama 
	 * @fires PANOLENS.Panorama#enter
	 * @fires PANOLENS.Panorama#enter-animation-start
	 */
	PANOLENS.Panorama.prototype.onEnter = function () {

		new TWEEN.Tween( this )
		.to( {}, this.animationDuration )
		.easing( TWEEN.Easing.Quartic.Out )
		.onStart( function () {

			/**
			 * Enter panorama and animation starting event
			 * @event PANOLENS.Panorama#enter-animation-start
			 * @type {object} 
			 */
			this.dispatchEvent( { type: 'enter-animation-start' } );

			if ( this.loaded ) {

				this.fadeIn();
				this.toggleInfospotVisibility( true, this.animationDuration );

			} else {

				this.load();

			}

			this.visible = true;
			this.material.visible = true;
		} )
		.delay( this.animationDuration )
		.start();

		/**
		 * Enter panorama event
		 * @event PANOLENS.Panorama#enter
		 * @type {object} 
		 */
		this.dispatchEvent( { type: 'enter' } );

	};

	/**
	 * This will be called when leaving a panorama
	 * @fires PANOLENS.Panorama#leave
	 */
	PANOLENS.Panorama.prototype.onLeave = function () {

		new TWEEN.Tween( this )
		.to( {}, this.animationDuration )
		.easing( TWEEN.Easing.Quartic.Out )
		.onStart( function () {

			this.fadeOut();
			this.toggleInfospotVisibility( false );

		} )
		.onComplete( function () {

			this.visible = false;
			this.material.visible = true;

		} )
		.start();

		/**
		 * Leave panorama event
		 * @event PANOLENS.Panorama#leave
		 * @type {object} 
		 */
		this.dispatchEvent( { type: 'leave' } );

	};

} )();;(function(){
	
	'use strict';
	
	/**
	 * Equirectangular based image panorama
	 * @constructor
	 * @param {string} image - Image url or HTMLImageElement
	 * @param {number} [radius=5000] - Radius of panorama
	 */
	PANOLENS.ImagePanorama = function ( image, radius ) {

		radius = radius || 5000;

		var geometry = new THREE.SphereGeometry( radius, 60, 40 ),
			material = new THREE.MeshBasicMaterial( { opacity: 0, transparent: true } );

		PANOLENS.Panorama.call( this, geometry, material );

		this.src = image;

	}

	PANOLENS.ImagePanorama.prototype = Object.create( PANOLENS.Panorama.prototype );

	PANOLENS.ImagePanorama.prototype.constructor = PANOLENS.ImagePanorama;

	/**
	 * Load image asset
	 * @param  {*} src - Url or image element
	 */
	PANOLENS.ImagePanorama.prototype.load = function ( src ) {

		src = src || this.src;

		if ( !src ) { 

			console.warn( 'Image source undefined' );

			return; 

		} else if ( typeof src === 'string' ) {

			PANOLENS.Utils.TextureLoader.load( src, this.onLoad.bind( this ), this.onProgress.bind( this ), this.onError.bind( this ) );

		} else if ( src instanceof HTMLImageElement ) {

			this.onLoad( new THREE.Texture( src ) );

		}

		
	};

	/**
	 * This will be called when image is loaded
	 * @param  {THREE.Texture} texture - Texture to be updated
	 */
	PANOLENS.ImagePanorama.prototype.onLoad = function ( texture ) {

		texture.minFilter = texture.maxFilter = THREE.LinearFilter;

		texture.needsUpdate = true;

		this.updateTexture( texture );

		PANOLENS.Panorama.prototype.onLoad.call( this );
		
	};

	PANOLENS.ImagePanorama.prototype.reset = function () {

		PANOLENS.Panorama.prototype.reset.call( this );

	};

})();;(function(){

	'use strict';
	
	/**
	 * Google streetview panorama
	 * 
	 * [How to get Panorama ID]{@link http://stackoverflow.com/questions/29916149/google-maps-streetview-how-to-get-panorama-id}
	 * @constructor
	 * @param {string} panoId - Panorama id from Google Streetview 
	 * @param {number} [radius=5000] - The minimum radius for this panoram
	 */
	PANOLENS.GoogleStreetviewPanorama = function ( panoId, radius ) {

		PANOLENS.ImagePanorama.call( this, undefined, radius );

		this.panoId = panoId;

		this.gsvLoader = undefined;

		this.setupGoogleMapAPI();

	}

	PANOLENS.GoogleStreetviewPanorama.prototype = Object.create( PANOLENS.ImagePanorama.prototype );

	PANOLENS.GoogleStreetviewPanorama.constructor = PANOLENS.GoogleStreetviewPanorama;

	/**
	 * Load Google Street View by panorama id
	 * @param {string} panoId - Gogogle Street View panorama id
	 */
	PANOLENS.GoogleStreetviewPanorama.prototype.load = function ( panoId ) {

		panoId = ( panoId || this.panoId ) || {};

		if ( panoId && this.gsvLoader ) {

			this.loadGSVLoader( panoId );

		} else {

			this.gsvLoader = {};

		}

	};

	/**
	 * Setup Google Map API
	 */
	PANOLENS.GoogleStreetviewPanorama.prototype.setupGoogleMapAPI = function () {

		var script = document.createElement( 'script' );
		script.src = 'https://maps.googleapis.com/maps/api/js';
		script.onreadystatechange = this.setGSVLoader.bind( this );
    	script.onload = this.setGSVLoader.bind( this );

		document.getElementsByTagName('head')[0].appendChild( script );

	};

	/**
	 * Set GSV Loader
	 */
	PANOLENS.GoogleStreetviewPanorama.prototype.setGSVLoader = function () {

		this.gsvLoader = new GSVPANO.PanoLoader();

		if ( this.gsvLoader === {} ) {

			this.load();

		}

	};

	/**
	 * Get GSV Loader
	 * @return {object} GSV Loader instance
	 */
	PANOLENS.GoogleStreetviewPanorama.prototype.getGSVLoader = function () {

		return this.gsvLoader;

	};

	/**
	 * Load GSV Loader
	 * @param  {string} panoId - Gogogle Street View panorama id
	 */
	PANOLENS.GoogleStreetviewPanorama.prototype.loadGSVLoader = function ( panoId ) {

		this.gsvLoader.onProgress = this.onProgress.bind( this );

		this.gsvLoader.onPanoramaLoad = this.onLoad.bind( this );

		this.gsvLoader.setZoom( this.getZoomLevel() );

		this.gsvLoader.load( panoId );

		this.gsvLoader.loaded = true;
	};

	/**
	 * This will be called when panorama is loaded
	 * @param  {HTMLCanvasElement} canvas - Canvas where the tiles have been drawn
	 */
	PANOLENS.GoogleStreetviewPanorama.prototype.onLoad = function ( canvas ) {

		if ( !this.gsvLoader ) { return; }

		PANOLENS.ImagePanorama.prototype.onLoad.call( this, new THREE.Texture( canvas ) );

	};

	PANOLENS.GoogleStreetviewPanorama.prototype.reset = function () {

		this.gsvLoader = undefined;

		PANOLENS.ImagePanorama.prototype.reset.call( this );

	};

})();;(function(){
	
	'use strict';
	
	/**
	 * Cubemap-based panorama
	 * @constructor
	 * @param {array} images - An array of cubetexture containing six images
	 * @param {number} [edgeLength=10000] - The length of cube's edge
	 */
	PANOLENS.CubePanorama = function ( images, edgeLength ){

		var shader, geometry, material;

		this.images = images || [];
		this.orbitRadius = edgeLength / 2;

		edgeLength = edgeLength || 10000;
		shader = JSON.parse( JSON.stringify( THREE.ShaderLib[ 'cube' ] ) );

		geometry = new THREE.BoxGeometry( edgeLength, edgeLength, edgeLength );
		material = new THREE.ShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			side: THREE.BackSide

		} );

		PANOLENS.Panorama.call( this, geometry, material );

	}

	PANOLENS.CubePanorama.prototype = Object.create( PANOLENS.Panorama.prototype );

	PANOLENS.CubePanorama.prototype.constructor = PANOLENS.CubePanorama;

	/**
	 * Load 6 images and bind listeners
	 */
	PANOLENS.CubePanorama.prototype.load = function () {

		PANOLENS.Utils.CubeTextureLoader.load( 	

			this.images, 

			this.onLoad.bind( this ), 
			this.onProgress.bind( this ), 
			this.onError.bind( this ) 

		);

	};

	/**
	 * This will be called when 6 textures are ready
	 * @param  {THREE.CubeTexture} texture - Cube texture
	 */
	PANOLENS.CubePanorama.prototype.onLoad = function ( texture ) {
		
		this.material.uniforms[ 'tCube' ].value = texture;

		PANOLENS.Panorama.prototype.onLoad.call( this );

	};

})();;(function(){

	'use strict';

	/**
	 * Basic panorama with 6 faces tile images
	 * @constructor
	 * @param {number} [edgeLength=10000] - The length of cube's edge
	 */
	PANOLENS.BasicPanorama = function ( edgeLength ) {
		
		var tile = PANOLENS.DataImage.WhiteTile;

		PANOLENS.CubePanorama.call( this, [ tile, tile, tile, tile, tile, tile ], edgeLength );

	}

	PANOLENS.BasicPanorama.prototype = Object.create( PANOLENS.CubePanorama.prototype );

	PANOLENS.BasicPanorama.prototype.constructor = PANOLENS.BasicPanorama;

})();;(function(){

	'use strict';

	/**
	 * Video Panorama
	 * @constructor
	 * @param {string} src - Equirectangular video url
	 * @param {object} [options] - Option for video settings
	 * @param {HTMLElement} [options.videoElement] - HTML5 video element contains the video
	 * @param {HTMLCanvasElement} [options.videoCanvas] - HTML5 canvas element for drawing the video
	 * @param {boolean} [options.muted=false] - Mute the video or not
	 * @param {boolean} [options.loop=true] - Specify if the video should loop in the end
	 * @param {number} [radius=5000] - The minimum radius for this panoram
	 */
	PANOLENS.VideoPanorama = function ( src, options, radius ) {

		radius = radius || 5000;

		var geometry = new THREE.SphereGeometry( radius, 60, 40 ),
			material = new THREE.MeshBasicMaterial( { opacity: 0, transparent: true } );

		PANOLENS.Panorama.call( this, geometry, material );

		this.src = src;
		this.options = options;

		this.videoElement = undefined;
		this.videoCanvas = undefined;
		this.videoRenderObject = undefined;

		this.videoFramerate = 30;

		this.isIOS = /iPhone|iPad|iPod/i.test( navigator.userAgent );

		this.addEventListener( 'leave', this.pauseVideo.bind( this ) );
		this.addEventListener( 'leave', this.resetVideo.bind( this ) );
		this.addEventListener( 'video-toggle', this.toggleVideo.bind( this ) );
		this.addEventListener( 'video-time', this.setVideoCurrentTime.bind( this ) );

	}

	PANOLENS.VideoPanorama.prototype = Object.create( PANOLENS.Panorama.prototype );

	PANOLENS.VideoPanorama.constructor = PANOLENS.VideoPanorama;

	/**
	 * [load description]
	 * @param  {string} src     - The video url
	 * @param  {object} options - Option object containing videoElement and videoCanvas
	 * @fires  PANOLENS.Panorama#panolens-viewer-handler
	 */
	PANOLENS.VideoPanorama.prototype.load = function ( src, options ) {

		var scope = this;

		src = ( src || this.src ) || '';
		options = ( options || this.options ) || {};

		this.videoElement = options.videoElement || document.createElement( 'video' );
		this.videoCanvas = options.videoCanvas || document.createElement( 'canvas' );
		
		this.videoElement.muted = options.muted || false;
		this.videoElement.loop = ( options.loop !== undefined ) ? options.loop : true;
		this.videoElement.src =  src;
		this.videoElement.load();

		this.videoElement.onloadeddata = function(){

			scope.setVideoTexture( scope.videoElement, scope.videoCanvas );

			scope.onLoad();

		}

		this.videoElement.ontimeupdate = function ( event ) {

			/**
			 * Viewer handler event
			 * @type {object}
			 * @property {string} method - 'onVideoUpdate'
			 * @property {number} data - The percentage of video progress. Range from 0.0 to 1.0
			 */
			scope.dispatchEvent( { type: 'panolens-viewer-handler', method: 'onVideoUpdate', data: this.currentTime / this.duration } );

		};

	};

	/**
	 * Set video texture
	 * @param {HTMLVideoElement} video  - The html5 video element
	 * @param {HTMLCanvasElement} canvas - The canvas for video to be drawn on
	 * @fires PANOLENS.Panorama#panolens-viewer-handler
	 */
	PANOLENS.VideoPanorama.prototype.setVideoTexture = function ( video, canvas ) {

		var videoTexture, videoRenderObject, videoContext, scene, updateCallback;

		if ( !video || !canvas ) return;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		videoContext = canvas.getContext('2d');

		videoTexture = new THREE.Texture( canvas );
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.maxFilter = THREE.LinearFilter;

		videoRenderObject = {

			video : video,
			videoContext : videoContext,
			videoTexture: videoTexture,
			target : this

		};

		if ( this.isIOS ){
			
			videoRenderObject.fps = this.videoFramerate;
			videoRenderObject.lastTime = Date.now();
			videoRenderObject.video.pano_paused = true;
			videoRenderObject.video.play = function(){

				videoRenderObject.lastTime = Date.now();
				this.pano_paused = false;

			};
			videoRenderObject.video.pause = function(){

				this.pano_paused = true;

			};
			updateCallback = function () {

				if ( this.video.pano_paused ) { return; }

				var time = Date.now();
			    var elapsed = ( time - this.lastTime ) / 1000;

			    if ( this.video && elapsed >= ( ( 1000 / this.fps ) / 1000 ) ) {
			    	if ( this.video.currentTime + elapsed >= this.video.duration ) {
			    		this.video.currentTime = 0;
			    	} else {
			    		this.video.currentTime = this.video.currentTime + elapsed;
			    	}
			        this.videoContext.drawImage( this.video, 0, 0, this.video.videoWidth, this.video.videoHeight );
		        	this.videoTexture.needsUpdate = true;
			        this.lastTime = time;
			    }

			};

		} else {

			updateCallback = function () {

				if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ) {

					this.videoContext.drawImage( this.video, 0, 0 );

					if ( this.videoTexture ) {

						this.videoTexture.needsUpdate = true;

					}

				}

			};

		}

		// Draw the first frame
		videoContext.drawImage( video, 0, 0 );
		videoTexture.needsUpdate = true;

		this.updateTexture( videoTexture );

		this.videoRenderObject = videoRenderObject;

		// Notify Viewer to render object
		/**
		 * Viewer handler event
		 * @type {object}
		 * @event PANOLENS.Panorama#panolens-viewer-handler
		 * @property {string} method - 'addUpdateCallback'
		 * @property {*} data - The callback function to update video
		 */
		this.dispatchEvent( { type: 'panolens-viewer-handler', method: 'addUpdateCallback', data: updateCallback.bind( videoRenderObject ) } );
		
	};

	PANOLENS.VideoPanorama.prototype.reset = function () {

		this.videoElement = undefined;

		this.videoCanvas = undefined;	

		PANOLENS.Panorama.prototype.reset.call( this );

	};

	/**
	 * Check if video is paused
	 * @return {boolean} - is video paused or not
	 */
	PANOLENS.VideoPanorama.prototype.isVideoPaused = function () {

		return ( this.isIOS ) 
			? this.videoRenderObject.video.pano_paused 
			: this.videoRenderObject.video.paused;

	};

	/**
	 * Toggle video to play or pause
	 */
	PANOLENS.VideoPanorama.prototype.toggleVideo = function () {

		if ( this.videoRenderObject && this.videoRenderObject.video ) {

			if ( this.isVideoPaused() ) {

				this.videoRenderObject.video.play();

			} else {

				this.videoRenderObject.video.pause();

			}

		}

	};

	/**
	 * Set video currentTime
	 * @param {object} event - Event contains percentage. Range from 0.0 to 1.0
	 */
	PANOLENS.VideoPanorama.prototype.setVideoCurrentTime = function ( event ) {

		if ( this.videoRenderObject && this.videoRenderObject.video && event.percentage !== 1 ) {

			this.videoRenderObject.video.currentTime = this.videoRenderObject.video.duration * event.percentage;

		}

	};

	/**
	 * Play video
	 */
	PANOLENS.VideoPanorama.prototype.playVideo = function () {

		if ( this.videoRenderObject && this.videoRenderObject.video && this.isVideoPaused() ) {

			this.videoRenderObject.video.play();

		}

	};

	/**
	 * Pause video
	 */
	PANOLENS.VideoPanorama.prototype.pauseVideo = function () {

		if ( this.videoRenderObject && this.videoRenderObject.video && !this.isVideoPaused() ) {

			this.videoRenderObject.video.pause();

		}

	};

	/**
	 * Reset video at stating point
	 */
	PANOLENS.VideoPanorama.prototype.resetVideo = function () {

		if ( this.videoRenderObject && this.videoRenderObject.video ) {

			this.setVideoCurrentTime( { percentage: 0 } );

		}

	};

})();;(function(){

	'use strict';

	/**
	 * Empty panorama
	 * @constructor
	 * @param {number} [radius=5000] - Radius of panorama
	 */
	PANOLENS.EmptyPanorama = function ( radius ) {

		radius = radius || 5000;

		var geometry = new THREE.Geometry(),
			material = new THREE.MeshBasicMaterial( { 
				color: 0x000000, opacity: 1, transparent: true 
			} );

		PANOLENS.Panorama.call( this, geometry, material );

	}

	PANOLENS.EmptyPanorama.prototype = Object.create( PANOLENS.Panorama.prototype );

	PANOLENS.EmptyPanorama.prototype.constructor = PANOLENS.EmptyPanorama;

})();;( function () {
	
	/**
	 * Creates a tile with bent capability
	 * @constructor
	 * @param {number}  [width=10]                      				- Width along the X axis
	 * @param {number}  [height=5]                      				- Height along the Y axis
	 * @param {number}  [widthSegments=20]              				- Width segments
	 * @param {number}  [heightSegments=20]             				- Height segments
	 * @param {THREE.Vector3} [forceDirection=THREE.Vector3( 0, 0, 1 )] - Force direction
	 * @param {THREE.Vector3} [forceAxis=THREE.Vector3( 0, 1, 0 )] 		- Along this axis
	 * @param {number} [forceAngle=Math.PI/12] 							- Angle to bend in radians
	 */
	PANOLENS.Tile = function ( width, height, widthSegments, heightSegments, forceDirection, forceAxis, forceAngle ) {

		var scope = this;

		this.parameters = {
			width: width,
			height: height,
			widthSegments: widthSegments,
			heightSegments: heightSegments,
			forceDirection: forceDirection,
			forceAxis: forceAxis,
			forceAngle: forceAngle
		};

		width = width || 10;
		height = height || 5;
		widthSegments = widthSegments || 1;
		heightSegments = heightSegments || 1;
		forceDirection = forceDirection || new THREE.Vector3( 0, 0, 1 );
		forceAxis = forceAxis || new THREE.Vector3( 0, 1, 0 );
		forceAngle = forceAngle !== undefined ? forceAngle : 0;

		THREE.Mesh.call( this, 
			new THREE.PlaneGeometry( width, height, widthSegments, heightSegments ),
			new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true } )
		);

		this.entity = undefined;

		this.animationDuration = 500;
		this.animationFadeOut = undefined;
		this.animationFadeIn = undefined;
		this.animationTranslation = undefined;
		this.tweens = {};

		if ( forceAngle !== 0 ) {

			this.bend( forceDirection, forceAxis, forceAngle );

		}
		
	}

	PANOLENS.Tile.prototype = Object.create( THREE.Mesh.prototype );

	PANOLENS.Tile.prototype.constructor = PANOLENS.Tile;

	PANOLENS.Tile.prototype.clone = function (){

		var parameters = this.parameters, tile;

		tile = new PANOLENS.Tile(
			parameters.width,
			parameters.height,
			parameters.widthSegments,
			parameters.heightSegments,
			parameters.forceDirection,
			parameters.forceAxis,
			parameters.forceAngle
		);

		tile.setEntity( this.entity );
		tile.material = this.material.clone();

		return tile;

	};

	/**
	 * Bend panel with direction, axis, and angle
	 * @param  {THREE.Vector3} direction - Force direction
	 * @param  {THREE.Vector3} axis - Along this axis
	 * @param  {number} angle - Angle to bend in radians
	 */
	PANOLENS.Tile.prototype.bend = function ( direction, axis, angle ) {

		var modifier = new THREE.BendModifier();

		modifier.set( direction, axis, angle ).modify( this.geometry );

	};

	/**
	 * Create a tween object for animation
	 * based on - {@link https://github.com/tweenjs/tween.js}
	 * @param  {string} name       - Name of the tween animation
	 * @param  {object} object     - Object to be tweened
	 * @param  {object} toState    - Final state of the object's properties
	 * @param  {number} duration   - Tweening duration
	 * @param  {TWEEN.Easing} easing     - Easing function
	 * @param  {number} delay      - Animation delay time
	 * @param  {Function} onStart    - On start function
	 * @param  {Function} onUpdate   - On update function
	 * @param  {Function} onComplete - On complete function
	 * @return {TWEEN.Tween}         - Tween object
	 */
	PANOLENS.Tile.prototype.tween = function ( name, object, toState, duration, easing, delay, onStart, onUpdate, onComplete ) {

		object = object || this;
    	toState = toState || {};
    	duration = duration || this.animationDuration;
    	easing = easing || TWEEN.Easing.Exponential.Out;
    	delay = delay !== undefined ? delay : 0;
    	onStart = onStart ? onStart : null;
    	onUpdate = onUpdate ? onUpdate : null;
    	onComplete = onComplete ? onComplete : null;

    	if ( !this.tweens[name] ) {
    		this.tweens[name] = new TWEEN.Tween( object )
    			.to( toState, duration )
	        	.easing( easing )
	        	.delay( delay )
	        	.onStart( onStart )
	        	.onUpdate( onUpdate )
	        	.onComplete( onComplete );
    	}

    	return this.tweens[name];

    };

    /**
     * Short-hand for displaying a single ripple effect
     * by duplicating itself and fadeout
     * @param  {number} scale    - The duplicated self fadeout scale
     * @param  {number} duration - Effect duration
     * @param  {TWEEN.Easing} easing   - Easing function
     */
    PANOLENS.Tile.prototype.ripple = function ( scale, duration, easing ) {

    	scale = scale || 2;
    	duration = duration || 200;
    	easing = easing || TWEEN.Easing.Cubic.Out;

    	var scope = this, ripple = this.clone();

        new TWEEN.Tween( ripple.scale )
        .to({x: scale, y: scale}, duration )
        .easing( easing )
        .start();

        new TWEEN.Tween( ripple.material )
        .to({opacity: 0}, duration )
        .easing( easing )
        .onComplete(function(){
            scope.remove( ripple );
            ripple.geometry.dispose();
            ripple.material.dispose();
        })
        .start();

        this.add( ripple );

    };

    /**
	 * Set entity if multiple objects are considered as one entity
	 * @param {object} entity - Entity represents whole group structure
	 */
	PANOLENS.Tile.prototype.setEntity = function ( entity ) {

		this.entity = entity;

	};

} )();;(function(){
	
	'use strict';

    /**
     * Group consists of tile array
     * @constructor
     * @param {array}  tileArray         - Tile array of PANOLENS.Tile 
     * @param {number} verticalGap       - Vertical gap between each tile
     * @param {number} depthGap          - Depth gap between each tile
     * @param {number} animationDuration - Animation duration
     * @param {number} offset            - Offset index
     */
	PANOLENS.TileGroup = function ( tileArray, verticalGap, depthGap, animationDuration, offset ) {

		var scope = this, textureLoader;

		THREE.Object3D.call( this );

		this.tileArray = tileArray || [];
		this.offset = offset !== undefined ? offset : 0;
		this.v_gap = verticalGap !== undefined ? verticalGap : 6;
		this.d_gap = depthGap !== undefined ? depthGap : 2;
		this.animationDuration = animationDuration !== undefined ? animationDuration : 200;
		this.animationEasing = TWEEN.Easing.Exponential.Out;
		this.visibleDelta = 2;

		this.tileArray.map( function ( tile, index ) {

			if ( tile.image ) {

				PANOLENS.Utils.TextureLoader.load( tile.image, scope.setTexture.bind( tile ) );

			}

			tile.position.set( 0, index * -scope.v_gap, index * -scope.d_gap );
			tile.originalPosition = tile.position.clone();
			tile.setEntity( scope );
			scope.add( tile );

		} );

		this.updateVisbility();

	}

	PANOLENS.TileGroup.prototype = Object.create( THREE.Object3D.prototype );

	PANOLENS.TileGroup.prototype.constructor = PANOLENS.TileGroup;

    /**
     * Update corresponding tile textures
     * @param  {array} imageArray - Image array with index to index image update
     */
	PANOLENS.TileGroup.prototype.updateTexture = function ( imageArray ) {

		var scope = this;

		imageArray = imageArray || [];
		this.children.map( function ( child, index ) {
			if ( child instanceof PANOLENS.Tile && imageArray[index] ) {
				PANOLENS.Utils.TextureLoader.load( imageArray[index], scope.setTexture.bind( child ) );
	    		if ( child.outline ) {
	    			child.outline.material.visible = true;
	    		}
			}
		} );

	};

    /**
     * Update all tile textures and hide the remaining ones
     * @param  {array} imageArray - Image array with index to index image update
     */
	PANOLENS.TileGroup.prototype.updateAllTexture = function ( imageArray ) {

		this.updateTexture( imageArray );

		if ( imageArray.length < this.children.length ) {
			for ( var i = imageArray.length; i < this.children.length; i++ ) {
				if ( this.children[i] instanceof PANOLENS.Tile ) {
					this.children[i].material.visible = false;
					if ( this.children[i].outline ) {
						this.children[i].outline.material.visible = false;
					}
				}
			}
		}

	}

    /**
     * Set individual texture
     * @param {THREE.Texture} texture - Texture to be updated
     */
	PANOLENS.TileGroup.prototype.setTexture = function ( texture ) {

        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        this.material.visible = true;
        this.material.map = texture;
        this.material.needsUpdate = true;

    };

    /**
     * Update visibility
     */
    PANOLENS.TileGroup.prototype.updateVisbility = function () {

    	this.children[this.offset].visible = true;
    	new TWEEN.Tween( this.children[this.offset].material )
		.to( { opacity: 1 }, this.animationDuration )
		.easing( this.animationEasing )
		.start();
    	
    	if ( this.children[this.offset].outline ) {

    		this.children[this.offset].outline.visible = true;

    	}

    	// Backward
    	for ( var i = this.offset - 1; i >= 0 ; i-- ) {

    		if ( this.tileArray.indexOf(this.children[i]) === -1 ) { continue; }

    		if ( this.offset - i <= this.visibleDelta ) {

    			this.children[i].visible = true;
    			new TWEEN.Tween( this.children[i].material )
    			.to( { opacity: 1 / ( this.offset - i ) * 0.5 }, this.animationDuration )
    			.easing( this.animationEasing )
    			.start();

    		} else {

    			this.children[i].visible = false;

    		}

    		this.children[i].outline && (this.children[i].outline.visible = false);

    	}

    	// Forward
    	for ( var i = this.offset + 1; i < this.children.length ; i++ ) {

    		if ( this.tileArray.indexOf(this.children[i]) === -1 ) { continue; }

    		if ( i - this.offset <= this.visibleDelta ) {

    			this.children[i].visible = true;
    			new TWEEN.Tween( this.children[i].material )
    			.to( { opacity: 1 / ( i - this.offset ) * 0.5 }, this.animationDuration )
    			.easing( this.animationEasing )
    			.start();

    		} else {

    			this.children[i].visible = false;

    		}

    		this.children[i].outline && (this.children[i].outline.visible = false);

    	}

    };

    /**
     * Scroll up
     * @param  {number} duration - Scroll up duration
     */
    PANOLENS.TileGroup.prototype.scrollUp = function ( duration ) {

    	var tiles = this.tileArray, offset;

    	duration = duration !== undefined ? duration : this.animationDuration;

    	offset = this.offset + 1;

    	if ( this.offset < tiles.length - 1 && tiles[ this.offset + 1 ].material.visible ) {

    		for ( var i = tiles.length - 1; i >= 0; i-- ) {
	    		
    			new TWEEN.Tween( tiles[i].position )
    			.to({ y: ( i - offset ) * -this.v_gap,
    				  z: Math.abs( i - offset ) * -this.d_gap }, duration )
    			.easing( this.animationEasing )
    			.start();
	    		
	    	}

	    	this.offset ++;
	    	this.updateVisbility();
	    	this.dispatchEvent( { type: 'scroll', direction: 'up' } );

    	}

    };

    /**
     * Scroll down 
     * @param  {number} duration - Scroll up duration
     */
    PANOLENS.TileGroup.prototype.scrollDown = function ( duration ) {

    	var tiles = this.tileArray, offset;

    	duration = duration !== undefined ? duration : this.animationDuration;

    	offset = this.offset - 1;

    	if ( this.offset > 0 && tiles[ this.offset - 1 ].material.visible ) {

    		for ( var i = 0; i < tiles.length; i++ ) {

	    		new TWEEN.Tween( tiles[i].position )
    			.to({ y: ( i - offset ) * -this.v_gap,
    				  z: Math.abs( i - offset ) * -this.d_gap }, duration )
    			.easing( this.animationEasing )
    			.start();
	    		
	    	}

	    	this.offset --;
	    	this.updateVisbility();
	    	this.dispatchEvent( { type: 'scroll', direction: 'down' } );

    	}

    };

    PANOLENS.TileGroup.prototype.reset = function () {

    	this.tileArray.map( function ( child, index ) {

    		child.position.copy( child.originalPosition );

    	} );

    	this.offset = 0;
    	this.updateVisbility();

    };

    /**
     * Get current index
     * @return {number} Index of the group. Range from 0 to this.tileArray.length
     */
    PANOLENS.TileGroup.prototype.getIndex = function () {

    	return this.offset;

    };

    /**
     * Get visible tile counts
     * @return {number} Number of visible tiles
     */
    PANOLENS.TileGroup.prototype.getTileCount = function () {

    	var count = 0;

    	this.tileArray.map( function ( tile ) {

    		if ( tile.material.visible ) {

    			count ++;

    		}

    	} );

    	return count;

    };

})();;(function(){
	
	'use strict';

	var sharedFont, sharedTexture;
	var pendingQueue = [];

	/**
	 * Sprite text based on {@link https://github.com/Jam3/three-bmfont-text}
	 * @constructor
	 * @param {string} text     - Text to be displayed
	 * @param {number} maxWidth	- Max width
	 * @param {number} color    - Color in hexadecimal
	 * @param {number} opacity  - Text opacity
	 * @param {object} options  - Options to create text geometry
	 */
	PANOLENS.SpriteText = function ( text, maxWidth, color, opacity, options ) {

		THREE.Object3D.call( this );

		this.text = text || '';
		this.maxWidth = maxWidth || 2000;
		this.color = color || 0xffffff;
		this.opacity = opacity !== undefined ? opacity : 1;
		this.options = options || {};

		this.animationDuration = 500;
		this.animationFadeOut = undefined;
		this.animationFadeIn = undefined;
		this.tweens = {};

		this.addText( text );

	}

	PANOLENS.SpriteText.prototype = Object.create( THREE.Object3D.prototype );

	PANOLENS.SpriteText.prototype.constructor = PANOLENS.SpriteText;

	// Reference function will be overwritten by Bmfont.js
	PANOLENS.SpriteText.prototype.generateTextGeometry = function () {};
	PANOLENS.SpriteText.prototype.generateSDFShader = function () {};

	/**
	 * Set BMFont
	 * @param {Function} callback - Callback after font is loaded
	 * @param {object}   font     - The font to be loaded
	 * @param {THREE.Texture}   texture  - Font texture
	 */
	PANOLENS.SpriteText.prototype.setBMFont = function ( callback, font, texture ) {

		texture.needsUpdate = true;
	  	texture.minFilter = THREE.LinearMipMapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.generateMipmaps = true;
		texture.anisotropy = 8;

		sharedFont = font;
		sharedTexture = texture;

		for ( var i = pendingQueue.length - 1; i >= 0; i-- ) {
			pendingQueue[ i ].target.addText( pendingQueue[ i ].text );
		}

		while ( pendingQueue.length > 0 ) {
			pendingQueue.pop();
		}

		callback && callback();

	};

	/**
	 * Add text mesh
	 * @param {string} text - Text to be displayed
	 */
	PANOLENS.SpriteText.prototype.addText = function ( text ) {

		if ( !sharedFont || !sharedTexture ) {
			pendingQueue.push( { target: this, text: text } );
			return;
		}

		var textAnchor = new THREE.Object3D();

		this.options.text = text;
		this.options.font = sharedFont;
		this.options.width = this.maxWidth;

		var geometry = this.generateTextGeometry( this.options );
		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		var material = new THREE.RawShaderMaterial(this.generateSDFShader({
		    map: sharedTexture,
		    side: THREE.DoubleSide,
		    transparent: true,
		    color: this.color,
		    opacity: this.opacity
		}));

		var layout = geometry.layout;
		var textMesh = new THREE.Mesh( geometry, material );

		textMesh.entity = this;
		textMesh.position.x = -layout.width / 2;
		textMesh.position.y = layout.height * 1.035;

		textAnchor.scale.x = textAnchor.scale.y = -0.05;
		textAnchor.add( textMesh );

		this.mesh = textMesh;
		this.add( textAnchor );

	};

	/**
	 * Update text geometry
	 * @param  {object} options - Geometry options based on
	 *  https://github.com/Jam3/three-bmfont-text#geometry--createtextopt
	 */
	PANOLENS.SpriteText.prototype.update = function ( options ) {

		var mesh;

		options = options || {};

		mesh = this.mesh;

		mesh.geometry.update( options );
		mesh.position.x = -mesh.geometry.layout.width / 2;
		mesh.position.y = mesh.geometry.layout.height * 1.035;

	};

	/**
	 * Create a tween object for animation
	 * based on - {@link https://github.com/tweenjs/tween.js}
	 * @param  {string} name       - Name of the tween animation
	 * @param  {object} object     - Object to be tweened
	 * @param  {object} toState    - Final state of the object's properties
	 * @param  {number} duration   - Tweening duration
	 * @param  {TWEEN.Easing} easing     - Easing function
	 * @param  {number} delay      - Animation delay time
	 * @param  {Function} onStart    - On start function
	 * @param  {Function} onUpdate   - On update function
	 * @param  {Function} onComplete - On complete function
	 * @return {TWEEN.Tween}         - Tween object
	 */
	PANOLENS.SpriteText.prototype.tween = function ( name, object, toState, duration, easing, delay, onStart, onUpdate, onComplete ) {

		object = object || this;
		toState = toState || {};
		duration = duration || this.animationDuration;
		easing = easing || TWEEN.Easing.Exponential.Out;
		delay = delay !== undefined ? delay : 0;
		onStart = onStart ? onStart : null;
		onUpdate = onUpdate ? onUpdate : null;
		onComplete = onComplete ? onComplete : null;

		if ( !this.tweens[name] ) {
			this.tweens[name] = new TWEEN.Tween( object )
				.to( toState, duration )
	        	.easing( easing )
	        	.delay( delay )
	        	.onStart( onStart )
	        	.onUpdate( onUpdate )
	        	.onComplete( onComplete );
		}

		return this.tweens[name];

	};

	/**
	 * Get geometry layout
	 * @return {object} Text geometry layout 
	 */
	PANOLENS.SpriteText.prototype.getLayout = function () {

		return this.mesh && this.mesh.geometry && this.mesh.geometry.layout || {};

	};

	/**
	 * Set entity if multiple objects are considered as one entity
	 * @param {object} entity - Entity represents whole group structure
	 */
	PANOLENS.SpriteText.prototype.setEntity = function ( entity ) {

		this.entity = entity;

	};

})();;(function () {
	
	/**
	 * Widget for controls
	 * @constructor
	 * @param {HTMLElement} container - A domElement where default control widget will be attached to
	 */
	PANOLENS.Widget = function ( container ) {

		THREE.EventDispatcher.call( this );

		this.container = container || document.body;

		this.barElement;
		this.fullscreenElement;
		this.navigationElement;
		this.vrElement;
		this.videoElement;

	}

	PANOLENS.Widget.prototype = Object.create( THREE.EventDispatcher.prototype );

	PANOLENS.Widget.prototype.constructor = PANOLENS.Widget;

	/**
	 * Add control bar
	 */
	PANOLENS.Widget.prototype.addControlBar = function () {

		if ( !this.container ) {

			console.warn( 'Widget container not set' ); 
			return; 
		}

		var scope = this, bar, styleTranslate, styleOpacity;

		bar = document.createElement( 'div' );
		bar.style.width = '100%';
		bar.style.height = '44px';
		bar.style.float = 'left';
		bar.style.transform = bar.style.webkitTransform = bar.style.msTransform = 'translateY(-100%)';
		bar.style.background = 'rgba( 0, 0, 0, 0.3 )';
		bar.style.transition = 'all 0.5s ease';
		bar.isHidden = false;
		bar.toggle = function () {
			bar.isHidden = !bar.isHidden;
			styleTranslate = bar.isHidden ? 'translateY(0)' : 'translateY(-100%)';
			styleOpacity = bar.isHidden ? 0 : 1;
			bar.style.transform = bar.style.webkitTransform = bar.style.msTransform = styleTranslate;
			bar.style.opacity = styleOpacity;
		};

		this.container.appendChild( bar );

		// Event listener
		this.addEventListener( 'control-bar-toggle', bar.toggle );

		this.barElement = bar;

	};

	/**
	 * Add buttons on top of control bar
	 * @param {string} name - The control button name to be created
	 */
	PANOLENS.Widget.prototype.addControlButton = function ( name ) {

		this.fullscreenElement = name === 'fullscreen' ? this.createFullscreenButton() : this.fullscreenElement;
		this.navigationElement = name === 'navigation' ? this.createCameraControlButton() : this.navigationElement;
		this.vrElement = name === 'vr' ? this.createVRButton() : this.vrElement;
		this.videoElement = name === 'video' ? this.createVideoControl() : this.videoElement;

		// Add Control Items
		this.fullscreenElement && this.barElement.appendChild( this.fullscreenElement );
		this.navigationElement && this.barElement.appendChild( this.navigationElement );
		this.vrElement && this.barElement.appendChild( this.vrElement );
		this.videoElement && this.barElement.appendChild( this.videoElement );

	};

	/**
	 * Create VR button
	 * @return {HTMLSpanElement} - The dom element icon for VR effect
	 * @fires PANOLENS.Widget#panolens-viewer-handler
	 */
	PANOLENS.Widget.prototype.createVRButton = function () {

		var scope = this, item;

		function onTap () {

			/**
			 * Viewer handler event
			 * @type {object}
			 * @property {string} method - 'toggleVR' function call on PANOLENS.Viewer
			 */
			scope.dispatchEvent( { type: 'panolens-viewer-handler', method: 'toggleVR' } );

		}

		item = this.createCustomItem( { 

			style : { 

				backgroundImage : 'url("' + PANOLENS.DataImage.Cardboard + '")' 

			},

			onTap : onTap

		} );

		return item;

	}

	/**
	 * Create Fullscreen button
	 * @return {HTMLSpanElement} - The dom element icon for fullscreen
	 * @fires PANOLENS.Widget#panolens-viewer-handler
	 */
	PANOLENS.Widget.prototype.createFullscreenButton = function () {

		var scope = this, item, isFullscreen = false;

		// Don't create button if no support
		if ( !document.fullscreenEnabled       && 
			 !document.webkitFullscreenEnabled &&
			 !document.mozFullScreenEnabled    &&
			 !document.msFullscreenEnabled ) {
			return;
		}

		function onTap () {

			if ( !isFullscreen ) {
			    scope.container.requestFullscreen && scope.container.requestFullscreen();
			    scope.container.msRequestFullscreen && scope.container.msRequestFullscreen();
			    scope.container.mozRequestFullScreen && scope.container.mozRequestFullScreen();
			    scope.container.webkitRequestFullscreen && scope.container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				isFullscreen = true;
				attachInfospotsToContainer();
			} else {
			    document.exitFullscreen && document.exitFullscreen();
			    document.msExitFullscreen && document.msExitFullscreen();
			    document.mozCancelFullScreen && document.mozCancelFullScreen();
			    document.webkitExitFullscreen && document.webkitExitFullscreen();
				isFullscreen = false;
			}

			this.style.backgroundImage = ( isFullscreen ) 
				? 'url("' + PANOLENS.DataImage.FullscreenLeave + '")' 
				: 'url("' + PANOLENS.DataImage.FullscreenEnter + '")';

			/**
			 * Viewer handler event
			 * @type {object}
			 * @property {string} method - 'toggleFullscreen' function call on PANOLENS.Viewer
			 */
			scope.dispatchEvent( { type: 'panolens-viewer-handler', method: 'toggleFullscreen', data: isFullscreen } );

		}

		// Attach infospot to container when fullscreen
		function attachInfospotsToContainer () {

			var infospotElements = document.querySelectorAll( '.panolens-infospot' );

			for ( var i = 0; i < infospotElements.length; i++ ) {

				if ( infospotElements[ i ].parentElement !== scope.container ) {

					scope.container.appendChild( infospotElements[ i ] );

				}
				
			}

		}

		item = this.createCustomItem( { 

			style : { 

				backgroundImage : 'url("' + PANOLENS.DataImage.FullscreenEnter + '")' 

			},

			onTap : onTap

		} );

		return item;

	};

	/**
	 * Create camera control button
	 * @return {HTMLSpanElement} - The dom element icon for camera navigation
	 * @fires PANOLENS.Widget#panolens-viewer-handler
	 */
	PANOLENS.Widget.prototype.createCameraControlButton = function () {

		var scope = this, item;

		function onTap(){

			/**
			 * Viewer handler event
			 * @type {object}
			 * @property {string} method - 'toggleNextControl' function call on PANOLENS.Viewer
			 */
			scope.dispatchEvent( { type: 'panolens-viewer-handler', method: 'toggleNextControl' } );

			this.controlName = ( this.controlName === 'orbit' ) ? 'device-orientation' : 'orbit';

			this.style.backgroundImage = 'url("' + ( this.controlName === 'orbit' 
				? PANOLENS.DataImage.Gyro 
				: PANOLENS.DataImage.Orbit ) + '")';

		}

		item = this.createCustomItem( {

			style: {

				backgroundImage: 'url("' + PANOLENS.DataImage.Gyro + '")'

			},

			onTap : onTap

		} );

		item.controlName = 'orbit';

		return item;

	};

	/**
	 * Create video control container
	 * @return {HTMLSpanElement} - The dom element icon for video control
	 */
	PANOLENS.Widget.prototype.createVideoControl = function () {

		var item;

		item = document.createElement( 'span' );
		item.style.display = 'none';
		item.show = function () { 

			item.style.display = '';

		};

		item.hide = function () { 

			item.style.display = 'none';
			item.controlButton.paused = true;
			item.controlButton.update();
			item.seekBar.setProgress( 0 );
		};

		item.controlButton = this.createVideoControlButton();
		item.seekBar = this.createVideoControlSeekbar();
		
		item.appendChild( item.controlButton );
		item.appendChild( item.seekBar );

		this.addEventListener( 'video-control-show', item.show );
		this.addEventListener( 'video-control-hide', item.hide )

		return item;

	};

	/**
	 * Create video control button
	 * @return {HTMLSpanElement} - The dom element icon for video control
	 * @fires PANOLENS.Widget#panolens-viewer-handler
	 */
	PANOLENS.Widget.prototype.createVideoControlButton = function () {

		var scope = this, item;

		function onTap () {

			/**
			 * Viewer handler event
			 * @type {object}
			 * @property {string} method - 'toggleVideoPlay' function call on PANOLENS.Viewer
			 */
			scope.dispatchEvent( { type: 'panolens-viewer-handler', method: 'toggleVideoPlay' } );

			this.paused = !this.paused;

			item.update();

		};

		item = this.createCustomItem( { 

			style : { 

				float : 'left',
				backgroundImage : 'url("' + PANOLENS.DataImage.VideoPlay + '")'

			},

			onTap : onTap

		} );

		item.paused = true;

		item.update = function () {

			this.style.backgroundImage = 'url("' + ( this.paused 
				? PANOLENS.DataImage.VideoPlay 
				: PANOLENS.DataImage.VideoPause ) + '")';

		};

		return item;

	};

	/**
	 * Create video seekbar
	 * @return {HTMLSpanElement} - The dom element icon for video seekbar
	 * @fires PANOLENS.Widget#panolens-viewer-handler
	 */
	PANOLENS.Widget.prototype.createVideoControlSeekbar = function () {

		var scope = this, item, progressElement, progressElementControl,
			isDragging = false, mouseX, percentageNow, percentageNext;

		progressElement = document.createElement( 'div' );
		progressElement.style.width = '0%';
		progressElement.style.height = '100%';
		progressElement.style.backgroundColor = '#fff';

		progressElementControl = document.createElement( 'div' );
		progressElementControl.style.float = 'right';
		progressElementControl.style.width = '14px';
		progressElementControl.style.height = '14px';
		progressElementControl.style.transform = 'translate(7px, -5px)';
		progressElementControl.style.borderRadius = '50%';
		progressElementControl.style.backgroundColor = '#ddd';

		progressElementControl.addEventListener( 'mousedown', onMouseDown, false );
		progressElementControl.addEventListener( 'touchstart', onMouseDown, false );

		function onMouseDown ( event ) {

			event.stopPropagation();
			
			isDragging = true;
			
			mouseX = event.clientX || ( event.changedTouches && event.changedTouches[0].clientX );

			percentageNow = parseInt( progressElement.style.width ) / 100;

			scope.container.addEventListener( 'mousemove', onVideoControlDrag, false );
			scope.container.addEventListener( 'mouseup', onVideoControlStop, false );
			scope.container.addEventListener( 'touchmove', onVideoControlDrag, false );
			scope.container.addEventListener( 'touchend', onVideoControlStop, false );

		}

		function onVideoControlDrag ( event ) {

			var clientX;

			if( isDragging ){

				clientX = event.clientX || ( event.changedTouches && event.changedTouches[0].clientX );
				
				percentageNext = ( clientX - mouseX ) / item.clientWidth;

				percentageNext = percentageNow + percentageNext;

				percentageNext = percentageNext > 1 ? 1 : ( ( percentageNext < 0 ) ? 0 : percentageNext );

				item.setProgress ( percentageNext );

				/**
				 * Viewer handler event
				 * @type {object}
				 * @property {string} method - 'setVideoCurrentTime' function call on PANOLENS.Viewer
				 * @property {number} data - Percentage of current video. Range from 0.0 to 1.0
				 */
				scope.dispatchEvent( { type: 'panolens-viewer-handler', method: 'setVideoCurrentTime', data: percentageNext } );

			}

		}

		function onVideoControlStop ( event ) {

			event.stopPropagation();

			isDragging = false;

			scope.container.removeEventListener( 'mousemove', onVideoControlDrag, false );
			scope.container.removeEventListener( 'mouseup', onVideoControlStop, false );
			scope.container.removeEventListener( 'touchmove', onVideoControlDrag, false );
			scope.container.removeEventListener( 'touchend', onVideoControlStop, false );

		}

		function onTap ( event ) {

			var percentage;

			if ( event.target === progressElementControl ) { return; }

			percentage = ( event.changedTouches && event.changedTouches.length > 0 )
				? ( event.changedTouches[0].pageX - event.target.getBoundingClientRect().left ) / this.clientWidth
				: event.offsetX / this.clientWidth;

			/**
			 * Viewer handler event
			 * @type {object}
			 * @property {string} method - 'setVideoCurrentTime' function call on PANOLENS.Viewer
			 * @property {number} data - Percentage of current video. Range from 0.0 to 1.0
			 */
			scope.dispatchEvent( { type: 'panolens-viewer-handler', method: 'setVideoCurrentTime', data: percentage } );

			item.setProgress( event.offsetX / this.clientWidth );

		};

		progressElement.appendChild( progressElementControl );

		item = this.createCustomItem( {

			style : { 

				float : 'left',
				width : '30%',
				height : '4px',
				marginTop : '20px',
				backgroundColor : 'rgba(188,188,188,0.8)'

			},

			onTap : onTap

		} );

		item.appendChild( progressElement );

		item.setProgress = function( percentage ) {

			progressElement.style.width = percentage * 100 + '%';

		};		

		this.addEventListener( 'video-update', function ( event ) { 

			item.setProgress( event.percentage ); 

		} );

		return item;

	};

	/**
	 * Create custom item element
	 * @return {HTMLSpanElement} - The dom element icon
	 */
	PANOLENS.Widget.prototype.createCustomItem = function ( options ) {

		options = options || {};

		var item = options.element || document.createElement( 'span' );

		item.style.cursor = 'pointer';
		item.style.float = 'right';
		item.style.width = '44px';
		item.style.height = '100%';
		item.style.backgroundSize = '60%';
		item.style.backgroundRepeat = 'no-repeat';
		item.style.backgroundPosition = 'center';

		item.addEventListener('mouseenter', function(e) {
			item.style.filter = item.style.webkitFilter = 'drop-shadow(0 0 5px rgba(255,255,255,1))';
		});
		item.addEventListener('mouseleave', function(e) {
			item.style.filter = item.style.webkitFilter = '';
		});

		item = this.mergeStyleOptions( item, options.style );

		if ( options.onTap ) {
			[ 'click', 'touchend' ].forEach( function( event ) {
				item.addEventListener( event, options.onTap, false );
			} );
		}
		
		return item;

	};

	/**
	 * Merge item css style
	 * @param  {HTMLDOMElement} element - The element to be merged with style
	 * @param  {object} options - The style options
	 * @return {HTMLDOMElement} - The same element with merged styles
	 */
	PANOLENS.Widget.prototype.mergeStyleOptions = function ( element, options ) {

		options = options || {};

		for ( var property in options ){

			if ( options.hasOwnProperty( property ) ) {

				element.style[ property ] = options[ property ];

			}

		}

		return element;

	};

})();;( function () {

	/**
	 * Information spot attached to panorama
	 * @constructor
	 * @param {number} [scale=1] - Infospot scale
	 * @param {imageSrc} [imageSrc=PANOLENS.DataImage.Info] - Image overlay info
	 * @param {HTMLElement} [container=document.body] - The dom element contains infospot elements
	 */
	PANOLENS.Infospot = function ( scale, imageSrc, container ) {
		
		var scope = this, ratio, startScale, endScale, duration;

		scale = scale || 1;
		imageSrc = imageSrc || PANOLENS.DataImage.Info;
		duration = 500;

		THREE.Sprite.call( this );

		this.type = 'infospot';

		this.isHovering = false;
		this.visible = false;

		this.element;
		this.toPanorama;

		this.scale.set( scale, scale, 1 );
		this.rotation.y = Math.PI;

		this.container = container || document.body;

		PANOLENS.Utils.TextureLoader.load( imageSrc, postLoad );		

		function postLoad ( texture ) {
			
			scope.material.side = THREE.DoubleSide;
			scope.material.map = texture;
			scope.material.depthTest = false;

			ratio = texture.image.width / texture.image.height;

			scope.scale.set( ratio * scale, scale, 1 );

			startScale = scope.scale.clone();
			endScale = scope.scale.clone().multiplyScalar( 1.3 );
			endScale.z = 1;

			scope.scaleUpAnimation = new TWEEN.Tween( scope.scale )
				.to( { x: endScale.x, y: endScale.y }, duration )
				.easing( TWEEN.Easing.Elastic.Out );

			scope.scaleDownAnimation = new TWEEN.Tween( scope.scale )
				.to( { x: startScale.x, y: startScale.y }, duration )
				.easing( TWEEN.Easing.Elastic.Out );

		}

		function show () {

			this.visible = true;

		}

		function hide () {

			this.visible = false;

		}

		// Add show and hide animations
		this.showAnimation = new TWEEN.Tween( this.material )
			.to( { opacity: 1 }, duration )
			.onStart( show.bind( this ) )
			.easing( TWEEN.Easing.Quartic.Out );

		this.hideAnimation = new TWEEN.Tween( this.material )
			.to( { opacity: 0 }, duration )
			.onComplete( hide.bind( this ) )
			.easing( TWEEN.Easing.Quartic.Out );

		// Attach event listeners
		this.addEventListener( 'click', this.onClick );
		this.addEventListener( 'hover', this.onHover );
		this.addEventListener( 'hoverenter', this.onHoverStart );
		this.addEventListener( 'hoverleave', this.onHoverEnd );

	}

	PANOLENS.Infospot.prototype = Object.create( THREE.Sprite.prototype );

	/**
	 * This will be called by a click event
	 * Translate and lock the hovering element if any
	 * @param  {object} event - Event containing mouseEvent with clientX and clientY
	 */
	PANOLENS.Infospot.prototype.onClick = function ( event ) {

		if ( this.element ) {

			this.translateElement( event.mouseEvent.clientX, event.mouseEvent.clientY );

			// Lock element
			this.lockHoverElement();

		}

	};

	/**
	 * This will be called by a mouse hover event
	 * Translate the hovering element if any
	 * @param  {object} event - Event containing mouseEvent with clientX and clientY
	 */
	PANOLENS.Infospot.prototype.onHover = function ( event ) {

		if ( this.element && !this.element.locked ) {

			this.translateElement( event.mouseEvent.clientX, event.mouseEvent.clientY );

		}

	};

	/**
	 * This will be called on a mouse hover start
	 * Sets cursor style to 'pointer', display the element and scale up the infospot
	 */
	PANOLENS.Infospot.prototype.onHoverStart = function() {

		this.isHovering = true;
		this.container.style.cursor = 'pointer';
		this.scaleDownAnimation.stop();
		this.scaleUpAnimation.start();

		if ( this.element ) {

			this.element.style.display = 'block';

		}

	};

	/**
	 * This will be called on a mouse hover end
	 * Sets cursor style to 'default', hide the element and scale down the infospot
	 */
	PANOLENS.Infospot.prototype.onHoverEnd = function() {

		this.isHovering = false;
		this.container.style.cursor = 'default';
		this.scaleUpAnimation.stop();
		this.scaleDownAnimation.start();

		if ( this.element ) {

			this.element.style.display = 'none';
			this.unlockHoverElement();

		}

	};

	/**
	 * Translate the hovering element by css transform
	 * @param  {number} x - X position on the window screen
	 * @param  {number} y - Y position on the window screen
	 */
	PANOLENS.Infospot.prototype.translateElement = function ( x, y ) {

		var left, top;

		this.element.style.display = 'block';

		left = x - this.element.clientWidth / 2;
		top = y - this.element.clientHeight - 30;

		this.element.style.webkitTransform =
		this.element.style.msTransform =
		this.element.style.transform = 'translate(' + left + 'px, ' + top + 'px)';

	};

	/**
	 * Set hovering text content
	 * @param {string} text - Text to be displayed
	 */
	PANOLENS.Infospot.prototype.setText = function ( text ) {

		if ( this.element ) {

			this.element.textContent = text;

		}

	};

	/**
	 * Add hovering text element
	 * @param {string} text - Text to be displayed
	 */
	PANOLENS.Infospot.prototype.addHoverText = function ( text ) {

		if ( !this.element ) {

			this.element = document.createElement( 'div' );

			this.element.style.display = 'none';
			this.element.style.color = '#fff';
			this.element.style.top = 0;
			this.element.style.maxWidth = '50%';
			this.element.style.maxHeight = '50%';
			this.element.style.textShadow = '0 0 3px #000000';
			this.element.style.fontFamily = '"Trebuchet MS", Helvetica, sans-serif';
			this.element.style.position = 'fixed';
			this.element.classList.add( 'panolens-infospot' );

			this.container.appendChild( this.element );

		}

		this.setText( text );

	};

	/**
	 * Add hovering element by cloning an element
	 * @param {HTMLDOMElement} el - Element to be cloned and displayed
	 */
	PANOLENS.Infospot.prototype.addHoverElement = function ( el ) {

		if ( !this.element ) { 

			this.element = el.cloneNode( true );
			this.element.style.display = 'none';
			this.element.style.top = 0;
			this.element.style.position = 'fixed';
			this.element.classList.add( 'panolens-infospot' );

			this.container.appendChild( this.element );

		}

	};

	/**
	 * Remove hovering element
	 */
	PANOLENS.Infospot.prototype.removeHoverElement = function () {

		if ( this.element ) { 

			this.container.removeChild( this.element );

			this.element = undefined;

		}

	};

	/**
	 * Lock hovering element
	 */
	PANOLENS.Infospot.prototype.lockHoverElement = function () {

		if ( this.element ) { 

			this.element.locked = true;

		}

	};

	/**
	 * Unlock hovering element
	 */
	PANOLENS.Infospot.prototype.unlockHoverElement = function () {

		if ( this.element ) { 

			this.element.locked = false;

		}

	};

	/**
	 * Show infospot
	 * @param  {number} [delay=0] - Delay time to show
	 */
	PANOLENS.Infospot.prototype.show = function ( delay ) {

		delay = delay || 0;

		this.hideAnimation && this.hideAnimation.stop();
		this.showAnimation && this.showAnimation.delay( delay ).start();

	};

	/**
	 * Hide infospot
	 * @param  {number} [delay=0] - Delay time to hide
	 */
	PANOLENS.Infospot.prototype.hide = function ( delay ) {

		delay = delay || 0;

		this.showAnimation && this.showAnimation.stop();
		this.hideAnimation && this.hideAnimation.delay( delay ).start();
		
	};

} )();( function () {

	'use strict';

	/**
	 * Viewer contains pre-defined scene, camera and renderer
	 * @constructor
	 * @param {object} [options] - Use custom or default config options
	 * @param {HTMLElement} [options.container] - A HTMLElement to host the canvas
	 * @param {THREE.Scene} [options.scene=THREE.Scene] - A THREE.Scene which contains panorama and 3D objects
	 * @param {THREE.Camera} [options.camera=THREE.PerspectiveCamera] - A THREE.Camera to view the scene
	 * @param {THREE.WebGLRenderer} [options.renderer=THREE.WebGLRenderer] - A THREE.WebGLRenderer to render canvas
	 * @param {boolean} [options.controlBar=true] - Show/hide control bar on the bottom of the container
	 * @param {array}   [options.controlButtons=[]] - Button names to mount on controlBar if controlBar exists, Defaults to ['fullscreen', 'navigation', 'vr', 'video']
	 * @param {boolean} [options.autoHideControlBar=false] - Auto hide control bar when click on non-active area
	 * @param {boolean} [options.autoHideInfospot=false] - Auto hide infospots when click on non-active area
	 * @param {boolean} [options.horizontalView=false] - Allow only horizontal camera control
	 * @param {number}  [options.clickTolerance=10] - Distance tolerance to tigger click / tap event
	 * @param {number}  [options.cameraFov=60] - Camera field of view value
	 * @param {boolean} [options.reverseDragging=false] - Reverse dragging direction
	 */
	PANOLENS.Viewer = function ( options ) {

		THREE.EventDispatcher.call( this );
		
		if ( !THREE ) {

			console.error('Three.JS not found');

			return;
		}

		options = options || {};
		options.controlBar = options.controlBar !== undefined ? options.controlBar : true;
		options.controlButtons = options.controlButtons || [ 'fullscreen', 'navigation', 'vr', 'video' ];
		options.autoHideControlBar = options.autoHideControlBar !== undefined ? options.autoHideControlBar : false;
		options.autoHideInfospot = options.autoHideInfospot !== undefined ? options.autoHideInfospot : true;
		options.horizontalView = options.horizontalView !== undefined ? options.horizontalView : false;
		options.clickTolerance = options.clickTolerance || 10;
		options.cameraFov = options.cameraFov || 60;
		options.reverseDragging = options.reverseDragging || false;
		
		this.options = options;
		this.container;

		// Container
		if ( options.container ) {

			this.container = options.container;

		} else {

			this.container = document.createElement( 'div' );
			this.container.style.width = window.innerWidth + 'px';
			this.container.style.height = window.innerHeight + 'px';
			document.body.appendChild( this.container );

			// For matching body's width and height dynamically on the next tick to 
			// avoid 0 height in the beginning
			setTimeout( function () {
				this.container.style.width = '100%';
				this.container.style.height = '100%';
			}.bind( this ), 0 );

		}

		this.camera = options.camera || new THREE.PerspectiveCamera( this.options.cameraFov, this.container.clientWidth / this.container.clientHeight, 1, 10000 );
		this.scene = options.scene || new THREE.Scene();
		this.renderer = options.renderer || new THREE.WebGLRenderer( { alpha: true, antialias: true } );
		this.effect;

		this.mode = PANOLENS.Modes.NORMAL;

		this.OrbitControls;
		this.DeviceOrientationControls;

		this.controls;
		this.panorama;
		this.widget;
		
		this.hoverObject;
		this.infospot;
		this.pressEntityObject;
		this.pressObject;

		this.raycaster = new THREE.Raycaster();
		this.userMouse = new THREE.Vector2();
		this.updateCallbacks = [];
		this.DEBUG = false;

		// Renderer
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
		this.renderer.setClearColor( 0x000000, 1 );

		// Append Renderer Element to container
		this.renderer.domElement.classList.add( 'panolens-canvas' );
		this.renderer.domElement.style.display = 'block';
		this.container.appendChild( this.renderer.domElement );

		// Camera Controls
		this.OrbitControls = new THREE.OrbitControls( this.camera, this.container );
		this.OrbitControls.name = 'orbit';
		this.OrbitControls.minDistance = 1;
		this.OrbitControls.noPan = true;
		this.DeviceOrientationControls = new THREE.DeviceOrientationControls( this.camera );
		this.DeviceOrientationControls.name = 'device-orientation';

		// Cardboard effect
        this.effect = new THREE.CardboardEffect( this.renderer );
        this.effect.setSize( this.container.clientWidth, this.container.clientHeight );

		this.controls = [ this.OrbitControls, this.DeviceOrientationControls ];
		this.control = this.OrbitControls;
		
		// Lock horizontal view
		if ( this.options.horizontalView ) {
			this.OrbitControls.minPolarAngle = Math.PI / 2;
			this.OrbitControls.maxPolarAngle = Math.PI / 2;
		}

		// Add Control UI
		if ( this.options.controlBar !== false ) {
			this.addDefaultControlBar( this.options.controlButtons );
		}

		// Reverse dragging direction
		if ( this.options.reverseDragging ) {
			this.reverseDraggingDirection();
		}
		
		// Mouse / Touch Event
		this.container.addEventListener( 'mousedown', this.onMouseDown.bind( this ), true );
		this.container.addEventListener( 'mousemove', this.onMouseMove.bind( this ), true );
		this.container.addEventListener( 'mouseup', this.onMouseUp.bind( this ), true );
		this.container.addEventListener( 'touchstart', this.onMouseDown.bind( this ), true );
		this.container.addEventListener( 'touchend', this.onMouseUp.bind( this ), true );

		// Resize Event
		window.addEventListener( 'resize', this.onWindowResize.bind( this ), true );

		// Keyboard Event
		window.addEventListener( 'keydown', this.onKeyDown.bind( this ), true );
		window.addEventListener( 'keyup', this.onKeyUp.bind( this ), true );

		// Animate
		this.animate.call( this );

	}

	PANOLENS.Viewer.prototype = Object.create( THREE.EventDispatcher.prototype );

	PANOLENS.Viewer.prototype.constructor = PANOLENS.Viewer;

	/**
	 * Adding an object
	 * Automatically hookup with panolens-viewer-handler listener
	 * to communicate with viewer method
	 * @param {THREE.Object3D} object - The object to be added
	 */
	PANOLENS.Viewer.prototype.add = function ( object ) {

		if ( arguments.length > 1 ) {

			for ( var i = 0; i < arguments.length; i ++ ) {

				this.add( arguments[ i ] );

			}

			return this;

		}

		this.scene.add( object );

		// All object added to scene has 'panolens-viewer-handler' event to handle viewer communication
		if ( object.addEventListener ) {

			object.addEventListener( 'panolens-viewer-handler', this.eventHandler.bind( this ) );

		}

		// Hookup default panorama event listeners
		if ( object.type === 'panorama' ) {

			this.addPanoramaEventListener( object );

			if ( !this.panorama ) {

				this.setPanorama( object );

			}

		}

	};

	/**
	 * Add default control bar
	 * @param {array} array - The control buttons array
	 */
	PANOLENS.Viewer.prototype.addDefaultControlBar = function ( array ) {

		var scope = this;

		if ( this.widget ) {

			console.warn( 'Default control bar exists' );
			return;

		}

		this.widget = new PANOLENS.Widget( this.container );
		this.widget.addEventListener( 'panolens-viewer-handler', this.eventHandler.bind( this ) );
		this.widget.addControlBar();
		array.forEach( function( buttonName ){

			scope.widget.addControlButton( buttonName );

		} );

	};

	/**
	 * Set a panorama to be the current one
	 * @param {PANOLENS.Panorama} pano - Panorama to be set
	 */
	PANOLENS.Viewer.prototype.setPanorama = function ( pano ) {

		if ( pano.type === 'panorama' ) {
			
			// Clear exisiting infospot
			this.hideInfospot();

			// Reset Current Panorama
			this.panorama && this.panorama.onLeave();

			// Assign and enter panorama
			(this.panorama = pano).onEnter();
			
		}

	};

	/**
	 * Event handler to execute commands from child objects
	 * @param  {object} event - The dispatched event with method as function name and data as an argument
	 */
	PANOLENS.Viewer.prototype.eventHandler = function ( event ) {

		if ( event.method && this[ event.method ] ) {

			this[ event.method ]( event.data );

		}

	};

	/**
	 * Toggle VR effect mode
	 * @fires PANOLENS.Viewer#VR-toggle
	 */
	PANOLENS.Viewer.prototype.toggleVR = function () {

		if ( this.effect ) {

			if ( this.mode !== PANOLENS.Modes.VR ) {

				this.enableVR();

			} else {

				this.disableVR();

			}
		}

		/**
		 * Toggle vr event
		 * @type {object}
		 * @event PANOLENS.Viewer#VR-toggle
		 * @property {PANOLENS.Modes} mode - Current display mode
		 */
		this.dispatchEvent( { type: 'VR-toggle', mode: this.mode } );

	};

	/**
	 * Enable VR effect
	 */
	PANOLENS.Viewer.prototype.enableVR = function () {

		if ( this.effect && this.mode !== PANOLENS.Modes.VR ) {

			this.mode = PANOLENS.Modes.VR;

		}

	};

	/**
	 * Disable VR effect
	 */
	PANOLENS.Viewer.prototype.disableVR = function () {

		if ( this.effect && this.mode !== PANOLENS.Modes.NORMAL ) {

			this.mode = PANOLENS.Modes.NORMAL;

		}

	};

	/**
	 * Toggle video play or stop
	 * @fires PANOLENS.Viewer#video-toggle
	 */
	PANOLENS.Viewer.prototype.toggleVideoPlay = function () {

		if ( this.panorama instanceof PANOLENS.VideoPanorama ) {

			/**
			 * Toggle video event
			 * @type {object}
			 * @event PANOLENS.Viewer#video-toggle
			 */
			this.panorama.dispatchEvent( { type: 'video-toggle' } );

		}

	};

	/**
	 * Set currentTime in a video
	 * @param {number} percentage - Percentage of a video. Range from 0.0 to 1.0
	 * @fires PANOLENS.Viewer#video-time
	 */
	PANOLENS.Viewer.prototype.setVideoCurrentTime = function ( percentage ) {

		if ( this.panorama instanceof PANOLENS.VideoPanorama ) {

			/**
			 * Setting video time event
			 * @type {object}
			 * @event PANOLENS.Viewer#video-time
			 * @property {number} percentage - Percentage of a video. Range from 0.0 to 1.0
			 */
			this.panorama.dispatchEvent( { type: 'video-time', percentage: percentage } );

		}

	};

	/**
	 * This will be called when video updates if an widget is present
	 * @param {number} percentage - Percentage of a video. Range from 0.0 to 1.0
	 * @fires PANOLENS.Viewer#video-update
	 */
	PANOLENS.Viewer.prototype.onVideoUpdate = function ( percentage ) {

		/**
		 * Video update event
		 * @type {object}
		 * @event PANOLENS.Viewer#video-update
		 * @property {number} percentage - Percentage of a video. Range from 0.0 to 1.0
		 */
		this.widget && this.widget.dispatchEvent( { type: 'video-update', percentage: percentage } );

	};

	/**
	 * Add update callback to be called every animation frame
	 */
	PANOLENS.Viewer.prototype.addUpdateCallback = function ( fn ) {

		if ( fn ) {

			this.updateCallbacks.push( fn );

		}

	};

	/**
	 * Remove update callback
	 * @param  {Function} fn - The function to be removed
	 */
	PANOLENS.Viewer.prototype.removeUpdateCallback = function ( fn ) {

		var index = this.updateCallbacks.indexOf( fn );

		if ( fn && index >= 0 ) {

			this.updateCallbacks.splice( index, 1 );

		}

	};

	/**
	 * Show video widget
	 */
	PANOLENS.Viewer.prototype.showVideoWidget = function () {

		/**
		 * Show video widget event
		 * @type {object}
		 * @event PANOLENS.Viewer#video-control-show
		 */
		this.widget && this.widget.dispatchEvent( { type: 'video-control-show' } );

	};

	/**
	 * Hide video widget
	 */
	PANOLENS.Viewer.prototype.hideVideoWidget = function () {

		/**
		 * Hide video widget
		 * @type {object}
		 * @event PANOLENS.Viewer#video-control-hide
		 */
		this.widget && this.widget.dispatchEvent( { type: 'video-control-hide' } );

	};

	/**
	 * Add default panorama event listeners
	 * @param {PANOLENS.Panorama} pano - The panorama to be added with event listener
	 */
	PANOLENS.Viewer.prototype.addPanoramaEventListener = function ( pano ) {

		// Set camera control on every panorama
		pano.addEventListener( 'enter-animation-start', this.setCameraControl.bind( this ) );

		// Show and hide widget event only when it's PANOLENS.VideoPanorama
		if ( pano instanceof PANOLENS.VideoPanorama ) {

			pano.addEventListener( 'enter', this.showVideoWidget.bind( this ) );
			pano.addEventListener( 'leave', this.hideVideoWidget.bind( this ) );

		}


	};

	/**
	 * Set camera control
	 */
	PANOLENS.Viewer.prototype.setCameraControl = function () {

		this.camera.position.copy( this.panorama.position );
		this.camera.position.z += 1;
		this.OrbitControls.target.copy( this.panorama.position );

	};

	/**
	 * Get current camera control
	 * @return {object} - Current navigation control. THREE.OrbitControls or THREE.DeviceOrientationControls
	 */
	PANOLENS.Viewer.prototype.getControl = function () {

		return this.control;

	},

	/**
	 * Get scene
	 * @return {THREE.Scene} - Current scene which the viewer is built on
	 */
	PANOLENS.Viewer.prototype.getScene = function () {

		return this.scene;

	};

	/**
	 * Get camera
	 * @return {THREE.Camera} - The scene camera
	 */
	PANOLENS.Viewer.prototype.getCamera = function () {

		return this.camera;

	},

	/**
	 * Get renderer
	 * @return {THREE.WebGLRenderer} - The renderer using webgl
	 */
	PANOLENS.Viewer.prototype.getRenderer = function () {

		return this.renderer;

	};

	/**
	 * Get container
	 * @return {HTMLDOMElement} - The container holds rendererd canvas
	 */
	PANOLENS.Viewer.prototype.getContainer = function () {

		return this.container;

	};

	/**
	 * Get control name
	 * @return {string} - Control name. 'orbit' or 'device-orientation'
	 */
	PANOLENS.Viewer.prototype.getControlName = function () {

		return this.control.name;

	};

	/**
	 * Get next navigation control name
	 * @return {string} - Next control name
	 */
	PANOLENS.Viewer.prototype.getNextControlName = function () {

		return this.controls[ this.getNextControlIndex() ].name;

	};

	/**
	 * Get next navigation control index
	 * @return {number} - Next control index
	 */
	PANOLENS.Viewer.prototype.getNextControlIndex = function () {

		return ( this.controls.indexOf( this.control ) + 1 >= this.controls.length ) ? 0 : this.controls.indexOf( this.control ) + 1;

	};

	/**
	 * Set field of view of camera
	 */
	PANOLENS.Viewer.prototype.setCameraFov = function ( fov ) {

		this.camera.fov = fov;
		this.camera.updateProjectionMatrix();

	};

	/**
	 * Enable control by index
	 * @param  {number} index - Index of camera control
	 */
	PANOLENS.Viewer.prototype.enableControl = function ( index ) {

		index = ( index >= 0 && index < this.controls.length ) ? index : 0;

		this.control.enabled = false;

		this.control = this.controls[ index ];

		this.control.enabled = true;

		switch ( this.control.name ) {
			case 'orbit':
				this.camera.position.copy( this.panorama.position );
				this.camera.position.z += 1;
				break;
			case 'device-orientation':
				this.camera.position.copy( this.panorama.position );
				break;
			default:
				break;
		}

	};

	/**
	 * Toggle next control
	 */
	PANOLENS.Viewer.prototype.toggleNextControl = function () {

		this.enableControl( this.getNextControlIndex() );

	};

	/**
	 * Toggle fullscreen
	 * @param  {Boolean} isFullscreen - If it's fullscreen
	 */
	PANOLENS.Viewer.prototype.toggleFullscreen = function ( isFullscreen ) {

		if ( isFullscreen ) {
			this.container._width = this.container.clientWidth;
			this.container._height = this.container.clientHeight;
			this.container.style.width = '100%';
			this.container.style.height = '100%';
		} else {
			this.container._width && ( this.container.style.width = this.container._width + 'px' );
			this.container._height && ( this.container.style.height = this.container._height + 'px' );
		}

	};

	/**
	 * Reverse dragging direction
	 */
	PANOLENS.Viewer.prototype.reverseDraggingDirection = function () {

		this.OrbitControls.rotateSpeed *= -1;
		this.OrbitControls.momentumScalingFactor *= -1;

	};

	/**
	 * This is called when window size is changed
	 * @fires PANOLENS.Viewer#window-resize
	 */
	PANOLENS.Viewer.prototype.onWindowResize = function () {

		this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );

		/**
		 * Window resizing event
		 * @type {object}
		 * @event PANOLENS.Viewer#window-resize
		 * @property {number} width  - Width of the window
		 * @property {number} height - Height of the window
		 */
		this.dispatchEvent( { type: 'window-resize', width: this.container.clientWidth, height: this.container.clientHeight })
	};

	/**
	 * Rendering function to be called on every animation frame
	 */
	PANOLENS.Viewer.prototype.render = function () {

		TWEEN.update();
		this.updateCallbacks.forEach( function( callback ){ callback(); } );
		this.control && this.control.update();
		
		if ( this.mode === PANOLENS.Modes.VR ) {

			this.effect.render( this.scene, this.camera );

		} else {

			this.renderer.render( this.scene, this.camera );

		}

	};

	/**
	 * Output infospot attach position in console.warn by holding down Ctrl button
	 */
	PANOLENS.Viewer.prototype.outputInfospotPosition = function () {

		var intersects;

		intersects = this.raycaster.intersectObject( this.panorama, true );

		if ( intersects.length > 0 ) {

			intersects[0].point.applyAxisAngle( new THREE.Vector3( -1, 0, 0 ), this.panorama.rotation.x );
			intersects[0].point.applyAxisAngle( new THREE.Vector3( 0, -1, 0 ), this.panorama.rotation.y );
			intersects[0].point.applyAxisAngle( new THREE.Vector3( 0, 0, -1 ), this.panorama.rotation.z );

			intersects[0].point.sub( this.panorama.position );

			console.info('{ ' + (-intersects[0].point.x).toFixed(2) + 
				', ' + (intersects[0].point.y).toFixed(2) +
				', ' + (intersects[0].point.z).toFixed(2) + ' }'
			);

		}

	};

	PANOLENS.Viewer.prototype.onMouseDown = function ( event ) {

		event.preventDefault();

		this.userMouse.x = ( event.clientX ) ? event.clientX : event.touches[0].clientX;
		this.userMouse.y = ( event.clientY ) ? event.clientY : event.touches[0].clientY;
		this.userMouse.type = 'mousedown';
		this.onTap( event );

	};

	PANOLENS.Viewer.prototype.onMouseMove = function ( event ) {

		event.preventDefault();
		this.userMouse.type = 'mousemove';
		this.onTap( event );

	};

	PANOLENS.Viewer.prototype.onMouseUp = function ( event ) {

		var onTarget = false, type;

		this.userMouse.type = 'mouseup';

		type = ( this.userMouse.x >= event.clientX - this.options.clickTolerance 
				&& this.userMouse.x <= event.clientX + this.options.clickTolerance
				&& this.userMouse.y >= event.clientY - this.options.clickTolerance
				&& this.userMouse.y <= event.clientY + this.options.clickTolerance ) 
				||  ( event.changedTouches 
				&& this.userMouse.x >= event.changedTouches[0].clientX - this.options.clickTolerance
				&& this.userMouse.x <= event.changedTouches[0].clientX + this.options.clickTolerance 
				&& this.userMouse.y >= event.changedTouches[0].clientY - this.options.clickTolerance
				&& this.userMouse.y <= event.changedTouches[0].clientY + this.options.clickTolerance ) 
		? 'click' : undefined;

		// Event should happen on canvas
		if ( event && event.target && !event.target.classList.contains( 'panolens-canvas' ) ) { return; }

		event.preventDefault();

		if ( event.changedTouches && event.changedTouches.length === 1 ) {

			onTarget = this.onTap( { clientX : event.changedTouches[0].clientX, clientY : event.changedTouches[0].clientY }, type );
		
		} else {

			onTarget = this.onTap( event, type );

		}

		this.userMouse.type = 'none';

		if ( onTarget ) { 

			return; 

		}

		if ( type === 'click' ) {

			this.options.autoHideInfospot && this.panorama && this.panorama.toggleInfospotVisibility();
			this.options.autoHideControlBar && this.toggleControlBar();

		}

	};

	PANOLENS.Viewer.prototype.onTap = function ( event, type ) {

		var point = {}, object, intersects, intersect_entity, intersect;

		point.x = ( ( event.clientX - this.renderer.domElement.offsetLeft ) / this.renderer.domElement.clientWidth ) * 2 - 1;
    	point.y = - ( ( event.clientY - this.renderer.domElement.offsetTop ) / this.renderer.domElement.clientHeight ) * 2 + 1;

		this.raycaster.setFromCamera( point, this.camera );

		if ( !this.panorama ) { return; }

		// output infospot information
		if ( this.DEBUG ) { this.outputInfospotPosition(); }

		intersects = this.raycaster.intersectObjects( this.panorama.children, true );

		intersect_entity = this.getConvertedIntersect( intersects );

		intersect = ( intersects.length > 0 ) ? intersects[0].object : intersect;

		if ( this.userMouse.type === 'mouseup'  ) {

			if ( intersect_entity && this.pressEntityObject === intersect_entity && this.pressEntityObject.dispatchEvent ) {

				this.pressEntityObject.dispatchEvent( { type: 'pressstop-entity', mouseEvent: event } );

			}

			this.pressEntityObject = undefined;

		}

		if ( this.userMouse.type === 'mouseup'  ) {

			if ( intersect && this.pressObject === intersect && this.pressObject.dispatchEvent ) {

				this.pressObject.dispatchEvent( { type: 'pressstop', mouseEvent: event } );

			}

			this.pressObject = undefined;

		}

		if ( type === 'click' ) {

			this.panorama.dispatchEvent( { type: 'click', intersects: intersects, mouseEvent: event } );

			if ( intersect_entity && intersect_entity.dispatchEvent ) {

				intersect_entity.dispatchEvent( { type: 'click-entity', mouseEvent: event } );

			}

			if ( intersect && intersect.dispatchEvent ) {

				intersect.dispatchEvent( { type: 'click', mouseEvent: event } );

			}

		} else {

			this.panorama.dispatchEvent( { type: 'hover', intersects: intersects, mouseEvent: event } );

			if ( ( this.hoverObject && intersects.length > 0 && this.hoverObject !== intersect_entity )
				|| ( this.hoverObject && intersects.length === 0 ) ){

				if ( this.hoverObject.dispatchEvent ) {

					this.hoverObject.dispatchEvent( { type: 'hoverleave', mouseEvent: event } );

				}

				this.hoverObject = undefined;

			}

			if ( intersect_entity && intersects.length > 0 ) {

				if ( this.hoverObject !== intersect_entity ) {

					this.hoverObject = intersect_entity;

					if ( this.hoverObject.dispatchEvent ) {

						this.hoverObject.dispatchEvent( { type: 'hoverenter', mouseEvent: event } );

					}

				}

				if ( this.userMouse.type === 'mousedown' && this.pressEntityObject != intersect_entity ) {

					this.pressEntityObject = intersect_entity;

					if ( this.pressEntityObject.dispatchEvent ) {

						this.pressEntityObject.dispatchEvent( { type: 'pressstart-entity', mouseEvent: event } );

					}

				}

				if ( this.userMouse.type === 'mousedown' && this.pressObject != intersect ) {

					this.pressObject = intersect;

					if ( this.pressObject.dispatchEvent ) {

						this.pressObject.dispatchEvent( { type: 'pressstart', mouseEvent: event } );

					}

				}

				if ( this.userMouse.type === 'mousemove' ) {

					if ( intersect && intersect.dispatchEvent ) {

						intersect.dispatchEvent( { type: 'hover', mouseEvent: event } );

					}

					if ( this.pressEntityObject && this.pressEntityObject.dispatchEvent ) {

						this.pressEntityObject.dispatchEvent( { type: 'pressmove-entity', mouseEvent: event } );

					}

					if ( this.pressObject && this.pressObject.dispatchEvent ) {

						this.pressObject.dispatchEvent( { type: 'pressmove', mouseEvent: event } );

					}

				}

			}

			if ( !intersect_entity && this.pressEntityObject && this.pressEntityObject.dispatchEvent ) {

				this.pressEntityObject.dispatchEvent( { type: 'pressstop-entity', mouseEvent: event } );

				this.pressEntityObject = undefined;

			}

			if ( !intersect && this.pressObject && this.pressObject.dispatchEvent ) {

				this.pressObject.dispatchEvent( { type: 'pressstop', mouseEvent: event } );

				this.pressObject = undefined;

			}

		}

		// Infospot handler
		if ( intersect && intersect instanceof PANOLENS.Infospot ) {

			this.infospot = intersect;
			
			if ( type === 'click' ) {

				return true;

			}
			

		} else if ( this.infospot ) {

			this.hideInfospot();

		}

	};

	PANOLENS.Viewer.prototype.getConvertedIntersect = function ( intersects ) {

		var intersect;

		for ( var i = 0; i < intersects.length; i++ ) {

			if ( intersects[i].object && !intersects[i].object.passThrough ) {

				if ( intersects[i].object.entity && intersects[i].object.entity.passThrough ) {
					continue;
				} else if ( intersects[i].object.entity && !intersects[i].object.entity.passThrough ) {
					intersect = intersects[i].object.entity;
					break;
				} else {
					intersect = intersects[i].object;
					break;
				}

			}

		}

		return intersect;

	};

	PANOLENS.Viewer.prototype.hideInfospot = function ( intersects ) {

		if ( this.infospot ) {

			this.infospot.onHoverEnd();

			this.infospot = undefined;

		}

	};

	/**
	 * Toggle control bar
	 * @fires [PANOLENS.Viewer#control-bar-toggle]
	 */
	PANOLENS.Viewer.prototype.toggleControlBar = function () {

		/**
		 * Toggle control bar event
		 * @type {object}
		 * @event PANOLENS.Viewer#control-bar-toggle
		 */
		this.widget && this.widget.dispatchEvent( { type: 'control-bar-toggle' } );

	};

	PANOLENS.Viewer.prototype.onKeyDown = function ( event ) {

		if ( event.keyCode === 17 || event.keyIdentifier === 'Control' ) {

			this.DEBUG = true;

		}

	};

	PANOLENS.Viewer.prototype.onKeyUp = function ( event ) {

		this.DEBUG = false;

	};

	PANOLENS.Viewer.prototype.animate = function () {

		window.requestAnimationFrame( this.animate.bind( this ) );

        this.render();

	};

} )();;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	var createLayout = require('layout-bmfont-text')
	var inherits = require('inherits')
	var createIndices = require('quad-indices')
	var buffer = require('three-buffer-vertex-data')
	var assign = require('object-assign')

	var vertices = require('./lib/vertices')
	var utils = require('./lib/utils')

	var Base = THREE.BufferGeometry

	module.exports = function createTextGeometry (opt) {
	  return new TextGeometry(opt)
	}

	function TextGeometry (opt) {
	  Base.call(this)

	  if (typeof opt === 'string') {
	    opt = { text: opt }
	  }

	  // use these as default values for any subsequent
	  // calls to update()
	  this._opt = assign({}, opt)

	  // also do an initial setup...
	  if (opt) this.update(opt)
	}

	inherits(TextGeometry, Base)

	TextGeometry.prototype.update = function (opt) {
	  if (typeof opt === 'string') {
	    opt = { text: opt }
	  }

	  // use constructor defaults
	  opt = assign({}, this._opt, opt)

	  if (!opt.font) {
	    throw new TypeError('must specify a { font } in options')
	  }

	  this.layout = createLayout(opt)

	  // get vec2 texcoords
	  var flipY = opt.flipY !== false

	  // the desired BMFont data
	  var font = opt.font

	  // determine texture size from font file
	  var texWidth = font.common.scaleW
	  var texHeight = font.common.scaleH

	  // get visible glyphs
	  var glyphs = this.layout.glyphs.filter(function (glyph) {
	    var bitmap = glyph.data
	    return bitmap.width * bitmap.height > 0
	  })

	  // provide visible glyphs for convenience
	  this.visibleGlyphs = glyphs

	  // get common vertex data
	  var positions = vertices.positions(glyphs)
	  var uvs = vertices.uvs(glyphs, texWidth, texHeight, flipY)
	  var indices = createIndices({
	    clockwise: true,
	    type: 'uint16',
	    count: glyphs.length
	  })

	  // update vertex data
	  buffer.index(this, indices, 1, 'uint16')
	  buffer.attr(this, 'position', positions, 2)
	  buffer.attr(this, 'uv', uvs, 2)

	  // update multipage data
	  if (!opt.multipage && 'page' in this.attributes) {
	    // disable multipage rendering
	    this.removeAttribute('page')
	  } else if (opt.multipage) {
	    var pages = vertices.pages(glyphs)
	    // enable multipage rendering
	    buffer.attr(this, 'page', pages, 1)
	  }
	}

	TextGeometry.prototype.computeBoundingSphere = function () {
	  if (this.boundingSphere === null) {
	    this.boundingSphere = new THREE.Sphere()
	  }

	  var positions = this.attributes.position.array
	  var itemSize = this.attributes.position.itemSize
	  if (!positions || !itemSize || positions.length < 2) {
	    this.boundingSphere.radius = 0
	    this.boundingSphere.center.set(0, 0, 0)
	    return
	  }
	  utils.computeSphere(positions, this.boundingSphere)
	  if (isNaN(this.boundingSphere.radius)) {
	    console.error('THREE.BufferGeometry.computeBoundingSphere(): ' +
	      'Computed radius is NaN. The ' +
	      '"position" attribute is likely to have NaN values.')
	  }
	}

	TextGeometry.prototype.computeBoundingBox = function () {
	  if (this.boundingBox === null) {
	    this.boundingBox = new THREE.Box3()
	  }

	  var bbox = this.boundingBox
	  var positions = this.attributes.position.array
	  var itemSize = this.attributes.position.itemSize
	  if (!positions || !itemSize || positions.length < 2) {
	    bbox.makeEmpty()
	    return
	  }
	  utils.computeBox(positions, bbox)
	}

	},{"./lib/utils":2,"./lib/vertices":3,"inherits":4,"layout-bmfont-text":5,"object-assign":26,"quad-indices":27,"three-buffer-vertex-data":31}],2:[function(require,module,exports){
	var itemSize = 2
	var box = { min: [0, 0], max: [0, 0] }

	function bounds (positions) {
	  var count = positions.length / itemSize
	  box.min[0] = positions[0]
	  box.min[1] = positions[1]
	  box.max[0] = positions[0]
	  box.max[1] = positions[1]

	  for (var i = 0; i < count; i++) {
	    var x = positions[i * itemSize + 0]
	    var y = positions[i * itemSize + 1]
	    box.min[0] = Math.min(x, box.min[0])
	    box.min[1] = Math.min(y, box.min[1])
	    box.max[0] = Math.max(x, box.max[0])
	    box.max[1] = Math.max(y, box.max[1])
	  }
	}

	module.exports.computeBox = function (positions, output) {
	  bounds(positions)
	  output.min.set(box.min[0], box.min[1], 0)
	  output.max.set(box.max[0], box.max[1], 0)
	}

	module.exports.computeSphere = function (positions, output) {
	  bounds(positions)
	  var minX = box.min[0]
	  var minY = box.min[1]
	  var maxX = box.max[0]
	  var maxY = box.max[1]
	  var width = maxX - minX
	  var height = maxY - minY
	  var length = Math.sqrt(width * width + height * height)
	  output.center.set(minX + width / 2, minY + height / 2, 0)
	  output.radius = length / 2
	}

	},{}],3:[function(require,module,exports){
	module.exports.pages = function pages (glyphs) {
	  var pages = new Float32Array(glyphs.length * 4 * 1)
	  var i = 0
	  glyphs.forEach(function (glyph) {
	    var id = glyph.data.page || 0
	    pages[i++] = id
	    pages[i++] = id
	    pages[i++] = id
	    pages[i++] = id
	  })
	  return pages
	}

	module.exports.uvs = function uvs (glyphs, texWidth, texHeight, flipY) {
	  var uvs = new Float32Array(glyphs.length * 4 * 2)
	  var i = 0
	  glyphs.forEach(function (glyph) {
	    var bitmap = glyph.data
	    var bw = (bitmap.x + bitmap.width)
	    var bh = (bitmap.y + bitmap.height)

	    // top left position
	    var u0 = bitmap.x / texWidth
	    var v1 = bitmap.y / texHeight
	    var u1 = bw / texWidth
	    var v0 = bh / texHeight

	    if (flipY) {
	      v1 = (texHeight - bitmap.y) / texHeight
	      v0 = (texHeight - bh) / texHeight
	    }

	    // BL
	    uvs[i++] = u0
	    uvs[i++] = v1
	    // TL
	    uvs[i++] = u0
	    uvs[i++] = v0
	    // TR
	    uvs[i++] = u1
	    uvs[i++] = v0
	    // BR
	    uvs[i++] = u1
	    uvs[i++] = v1
	  })
	  return uvs
	}

	module.exports.positions = function positions (glyphs) {
	  var positions = new Float32Array(glyphs.length * 4 * 2)
	  var i = 0
	  glyphs.forEach(function (glyph) {
	    var bitmap = glyph.data

	    // bottom left position
	    var x = glyph.position[0] + bitmap.xoffset
	    var y = glyph.position[1] + bitmap.yoffset

	    // quad size
	    var w = bitmap.width
	    var h = bitmap.height

	    // BL
	    positions[i++] = x
	    positions[i++] = y
	    // TL
	    positions[i++] = x
	    positions[i++] = y + h
	    // TR
	    positions[i++] = x + w
	    positions[i++] = y + h
	    // BR
	    positions[i++] = x + w
	    positions[i++] = y
	  })
	  return positions
	}

	},{}],4:[function(require,module,exports){
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}

	},{}],5:[function(require,module,exports){
	var wordWrap = require('word-wrapper')
	var xtend = require('xtend')
	var findChar = require('indexof-property')('id')
	var number = require('as-number')

	var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z']
	var M_WIDTHS = ['m', 'w']
	var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']


	var TAB_ID = '\t'.charCodeAt(0)
	var SPACE_ID = ' '.charCodeAt(0)
	var ALIGN_LEFT = 0, 
	    ALIGN_CENTER = 1, 
	    ALIGN_RIGHT = 2

	module.exports = function createLayout(opt) {
	  return new TextLayout(opt)
	}

	function TextLayout(opt) {
	  this.glyphs = []
	  this._measure = this.computeMetrics.bind(this)
	  this.update(opt)
	}

	TextLayout.prototype.update = function(opt) {
	  opt = xtend({
	    measure: this._measure
	  }, opt)
	  this._opt = opt
	  this._opt.tabSize = number(this._opt.tabSize, 4)

	  if (!opt.font)
	    throw new Error('must provide a valid bitmap font')

	  var glyphs = this.glyphs
	  var text = opt.text||'' 
	  var font = opt.font
	  this._setupSpaceGlyphs(font)
	  
	  var lines = wordWrap.lines(text, opt)
	  var minWidth = opt.width || 0

	  //clear glyphs
	  glyphs.length = 0

	  //get max line width
	  var maxLineWidth = lines.reduce(function(prev, line) {
	    return Math.max(prev, line.width, minWidth)
	  }, 0)

	  //the pen position
	  var x = 0
	  var y = 0
	  var lineHeight = number(opt.lineHeight, font.common.lineHeight)
	  var baseline = font.common.base
	  var descender = lineHeight-baseline
	  var letterSpacing = opt.letterSpacing || 0
	  var height = lineHeight * lines.length - descender
	  var align = getAlignType(this._opt.align)

	  //draw text along baseline
	  y -= height
	  
	  //the metrics for this text layout
	  this._width = maxLineWidth
	  this._height = height
	  this._descender = lineHeight - baseline
	  this._baseline = baseline
	  this._xHeight = getXHeight(font)
	  this._capHeight = getCapHeight(font)
	  this._lineHeight = lineHeight
	  this._ascender = lineHeight - descender - this._xHeight
	    
	  //layout each glyph
	  var self = this
	  lines.forEach(function(line, lineIndex) {
	    var start = line.start
	    var end = line.end
	    var lineWidth = line.width
	    var lastGlyph
	    
	    //for each glyph in that line...
	    for (var i=start; i<end; i++) {
	      var id = text.charCodeAt(i)
	      var glyph = self.getGlyph(font, id)
	      if (glyph) {
	        if (lastGlyph) 
	          x += getKerning(font, lastGlyph.id, glyph.id)

	        var tx = x
	        if (align === ALIGN_CENTER) 
	          tx += (maxLineWidth-lineWidth)/2
	        else if (align === ALIGN_RIGHT)
	          tx += (maxLineWidth-lineWidth)

	        glyphs.push({
	          position: [tx, y],
	          data: glyph,
	          index: i,
	          line: lineIndex
	        })  

	        //move pen forward
	        x += glyph.xadvance + letterSpacing
	        lastGlyph = glyph
	      }
	    }

	    //next line down
	    y += lineHeight
	    x = 0
	  })
	  this._linesTotal = lines.length;
	}

	TextLayout.prototype._setupSpaceGlyphs = function(font) {
	  //These are fallbacks, when the font doesn't include
	  //' ' or '\t' glyphs
	  this._fallbackSpaceGlyph = null
	  this._fallbackTabGlyph = null

	  if (!font.chars || font.chars.length === 0)
	    return

	  //try to get space glyph
	  //then fall back to the 'm' or 'w' glyphs
	  //then fall back to the first glyph available
	  var space = getGlyphById(font, SPACE_ID) 
	          || getMGlyph(font) 
	          || font.chars[0]

	  //and create a fallback for tab
	  var tabWidth = this._opt.tabSize * space.xadvance
	  this._fallbackSpaceGlyph = space
	  this._fallbackTabGlyph = xtend(space, {
	    x: 0, y: 0, xadvance: tabWidth, id: TAB_ID, 
	    xoffset: 0, yoffset: 0, width: 0, height: 0
	  })
	}

	TextLayout.prototype.getGlyph = function(font, id) {
	  var glyph = getGlyphById(font, id)
	  if (glyph)
	    return glyph
	  else if (id === TAB_ID) 
	    return this._fallbackTabGlyph
	  else if (id === SPACE_ID) 
	    return this._fallbackSpaceGlyph
	  return null
	}

	TextLayout.prototype.computeMetrics = function(text, start, end, width) {
	  var letterSpacing = this._opt.letterSpacing || 0
	  var font = this._opt.font
	  var curPen = 0
	  var curWidth = 0
	  var count = 0
	  var glyph
	  var lastGlyph

	  if (!font.chars || font.chars.length === 0) {
	    return {
	      start: start,
	      end: start,
	      width: 0
	    }
	  }

	  end = Math.min(text.length, end)
	  for (var i=start; i < end; i++) {
	    var id = text.charCodeAt(i)
	    var glyph = this.getGlyph(font, id)

	    if (glyph) {
	      //move pen forward
	      var xoff = glyph.xoffset
	      var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0
	      curPen += kern

	      var nextPen = curPen + glyph.xadvance + letterSpacing
	      var nextWidth = curPen + glyph.width

	      //we've hit our limit; we can't move onto the next glyph
	      if (nextWidth >= width || nextPen >= width)
	        break

	      //otherwise continue along our line
	      curPen = nextPen
	      curWidth = nextWidth
	      lastGlyph = glyph
	    }
	    count++
	  }
	  
	  //make sure rightmost edge lines up with rendered glyphs
	  if (lastGlyph)
	    curWidth += lastGlyph.xoffset

	  return {
	    start: start,
	    end: start + count,
	    width: curWidth
	  }
	}

	//getters for the private vars
	;['width', 'height', 
	  'descender', 'ascender',
	  'xHeight', 'baseline',
	  'capHeight',
	  'lineHeight' ].forEach(addGetter)

	function addGetter(name) {
	  Object.defineProperty(TextLayout.prototype, name, {
	    get: wrapper(name),
	    configurable: true
	  })
	}

	//create lookups for private vars
	function wrapper(name) {
	  return (new Function([
	    'return function '+name+'() {',
	    '  return this._'+name,
	    '}'
	  ].join('\n')))()
	}

	function getGlyphById(font, id) {
	  if (!font.chars || font.chars.length === 0)
	    return null

	  var glyphIdx = findChar(font.chars, id)
	  if (glyphIdx >= 0)
	    return font.chars[glyphIdx]
	  return null
	}

	function getXHeight(font) {
	  for (var i=0; i<X_HEIGHTS.length; i++) {
	    var id = X_HEIGHTS[i].charCodeAt(0)
	    var idx = findChar(font.chars, id)
	    if (idx >= 0) 
	      return font.chars[idx].height
	  }
	  return 0
	}

	function getMGlyph(font) {
	  for (var i=0; i<M_WIDTHS.length; i++) {
	    var id = M_WIDTHS[i].charCodeAt(0)
	    var idx = findChar(font.chars, id)
	    if (idx >= 0) 
	      return font.chars[idx]
	  }
	  return 0
	}

	function getCapHeight(font) {
	  for (var i=0; i<CAP_HEIGHTS.length; i++) {
	    var id = CAP_HEIGHTS[i].charCodeAt(0)
	    var idx = findChar(font.chars, id)
	    if (idx >= 0) 
	      return font.chars[idx].height
	  }
	  return 0
	}

	function getKerning(font, left, right) {
	  if (!font.kernings || font.kernings.length === 0)
	    return 0

	  var table = font.kernings
	  for (var i=0; i<table.length; i++) {
	    var kern = table[i]
	    if (kern.first === left && kern.second === right)
	      return kern.amount
	  }
	  return 0
	}

	function getAlignType(align) {
	  if (align === 'center')
	    return ALIGN_CENTER
	  else if (align === 'right')
	    return ALIGN_RIGHT
	  return ALIGN_LEFT
	}
	},{"as-number":6,"indexof-property":7,"word-wrapper":8,"xtend":9}],6:[function(require,module,exports){
	module.exports = function numtype(num, def) {
	  return typeof num === 'number'
	    ? num 
	    : (typeof def === 'number' ? def : 0)
	}
	},{}],7:[function(require,module,exports){
	module.exports = function compile(property) {
	  if (!property || typeof property !== 'string')
	    throw new Error('must specify property for indexof search')

	  return new Function('array', 'value', 'start', [
	    'start = start || 0',
	    'for (var i=start; i<array.length; i++)',
	    '  if (array[i]["' + property +'"] === value)',
	    '      return i',
	    'return -1'
	  ].join('\n'))
	}
	},{}],8:[function(require,module,exports){
	var newline = /\n/
	var newlineChar = '\n'
	var whitespace = /\s/

	module.exports = function(text, opt) {
	    var lines = module.exports.lines(text, opt)
	    return lines.map(function(line) {
	        return text.substring(line.start, line.end)
	    }).join('\n')
	}

	module.exports.lines = function wordwrap(text, opt) {
	    opt = opt||{}

	    //zero width results in nothing visible
	    if (opt.width === 0 && opt.mode !== 'nowrap') 
	        return []

	    text = text||''
	    var width = typeof opt.width === 'number' ? opt.width : Number.MAX_VALUE
	    var start = Math.max(0, opt.start||0)
	    var end = typeof opt.end === 'number' ? opt.end : text.length
	    var mode = opt.mode

	    var measure = opt.measure || monospace
	    if (mode === 'pre')
	        return pre(measure, text, start, end, width)
	    else
	        return greedy(measure, text, start, end, width, mode)
	}

	function idxOf(text, chr, start, end) {
	    var idx = text.indexOf(chr, start)
	    if (idx === -1 || idx > end)
	        return end
	    return idx
	}

	function isWhitespace(chr) {
	    return whitespace.test(chr)
	}

	function pre(measure, text, start, end, width) {
	    var lines = []
	    var lineStart = start
	    for (var i=start; i<end && i<text.length; i++) {
	        var chr = text.charAt(i)
	        var isNewline = newline.test(chr)

	        //If we've reached a newline, then step down a line
	        //Or if we've reached the EOF
	        if (isNewline || i===end-1) {
	            var lineEnd = isNewline ? i : i+1
	            var measured = measure(text, lineStart, lineEnd, width)
	            lines.push(measured)
	            
	            lineStart = i+1
	        }
	    }
	    return lines
	}

	function greedy(measure, text, start, end, width, mode) {
	    //A greedy word wrapper based on LibGDX algorithm
	    //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
	    var lines = []

	    var testWidth = width
	    //if 'nowrap' is specified, we only wrap on newline chars
	    if (mode === 'nowrap')
	        testWidth = Number.MAX_VALUE

	    while (start < end && start < text.length) {
	        //get next newline position
	        var newLine = idxOf(text, newlineChar, start, end)

	        //eat whitespace at start of line
	        while (start < newLine) {
	            if (!isWhitespace( text.charAt(start) ))
	                break
	            start++
	        }

	        //determine visible # of glyphs for the available width
	        var measured = measure(text, start, newLine, testWidth)

	        var lineEnd = start + (measured.end-measured.start)
	        var nextStart = lineEnd + newlineChar.length

	        //if we had to cut the line before the next newline...
	        if (lineEnd < newLine) {
	            //find char to break on
	            while (lineEnd > start) {
	                if (isWhitespace(text.charAt(lineEnd)))
	                    break
	                lineEnd--
	            }
	            if (lineEnd === start) {
	                if (nextStart > start + newlineChar.length) nextStart--
	                lineEnd = nextStart // If no characters to break, show all.
	            } else {
	                nextStart = lineEnd
	                //eat whitespace at end of line
	                while (lineEnd > start) {
	                    if (!isWhitespace(text.charAt(lineEnd - newlineChar.length)))
	                        break
	                    lineEnd--
	                }
	            }
	        }
	        if (lineEnd >= start) {
	            var result = measure(text, start, lineEnd, testWidth)
	            lines.push(result)
	        }
	        start = nextStart
	    }
	    return lines
	}

	//determines the visible number of glyphs within a given width
	function monospace(text, start, end, width) {
	    var glyphs = Math.min(width, end-start)
	    return {
	        start: start,
	        end: start+glyphs
	    }
	}
	},{}],9:[function(require,module,exports){
	module.exports = extend

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function extend() {
	    var target = {}

	    for (var i = 0; i < arguments.length; i++) {
	        var source = arguments[i]

	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key]
	            }
	        }
	    }

	    return target
	}

	},{}],10:[function(require,module,exports){
	(function (Buffer){
	var xhr = require('xhr')
	var noop = function(){}
	var parseASCII = require('parse-bmfont-ascii')
	var parseXML = require('parse-bmfont-xml')
	var readBinary = require('parse-bmfont-binary')
	var isBinaryFormat = require('./lib/is-binary')
	var xtend = require('xtend')

	var xml2 = (function hasXML2() {
	  return window.XMLHttpRequest && "withCredentials" in new XMLHttpRequest
	})()

	module.exports = function(opt, cb) {
	  cb = typeof cb === 'function' ? cb : noop

	  if (typeof opt === 'string')
	    opt = { uri: opt }
	  else if (!opt)
	    opt = {}

	  var expectBinary = opt.binary
	  if (expectBinary)
	    opt = getBinaryOpts(opt)

	  xhr(opt, function(err, res, body) {
	    if (err)
	      return cb(err)
	    if (!/^2/.test(res.statusCode))
	      return cb(new Error('http status code: '+res.statusCode))
	    if (!body)
	      return cb(new Error('no body result'))

	    var binary = false 

	    //if the response type is an array buffer,
	    //we need to convert it into a regular Buffer object
	    if (isArrayBuffer(body)) {
	      var array = new Uint8Array(body)
	      body = new Buffer(array, 'binary')
	    }

	    //now check the string/Buffer response
	    //and see if it has a binary BMF header
	    if (isBinaryFormat(body)) {
	      binary = true
	      //if we have a string, turn it into a Buffer
	      if (typeof body === 'string') 
	        body = new Buffer(body, 'binary')
	    } 

	    //we are not parsing a binary format, just ASCII/XML/etc
	    if (!binary) {
	      //might still be a buffer if responseType is 'arraybuffer'
	      if (Buffer.isBuffer(body))
	        body = body.toString(opt.encoding)
	      body = body.trim()
	    }

	    var result
	    try {
	      var type = res.headers['content-type']
	      if (binary)
	        result = readBinary(body)
	      else if (/json/.test(type) || body.charAt(0) === '{')
	        result = JSON.parse(body)
	      else if (/xml/.test(type)  || body.charAt(0) === '<')
	        result = parseXML(body)
	      else
	        result = parseASCII(body)
	    } catch (e) {
	      cb(new Error('error parsing font '+e.message))
	      cb = noop
	    }
	    cb(null, result)
	  })
	}

	function isArrayBuffer(arr) {
	  var str = Object.prototype.toString
	  return str.call(arr) === '[object ArrayBuffer]'
	}

	function getBinaryOpts(opt) {
	  //IE10+ and other modern browsers support array buffers
	  if (xml2)
	    return xtend(opt, { responseType: 'arraybuffer' })
	  
	  if (typeof window.XMLHttpRequest === 'undefined')
	    throw new Error('your browser does not support XHR loading')

	  //IE9 and XML1 browsers could still use an override
	  var req = new window.XMLHttpRequest()
	  req.overrideMimeType('text/plain; charset=x-user-defined')
	  return xtend({
	    xhr: req
	  }, opt)
	}
	}).call(this,require("buffer").Buffer)
	},{"./lib/is-binary":11,"buffer":37,"parse-bmfont-ascii":13,"parse-bmfont-binary":14,"parse-bmfont-xml":15,"xhr":18,"xtend":25}],11:[function(require,module,exports){
	(function (Buffer){
	var equal = require('buffer-equal')
	var HEADER = new Buffer([66, 77, 70, 3])

	module.exports = function(buf) {
	  if (typeof buf === 'string')
	    return buf.substring(0, 3) === 'BMF'
	  return buf.length > 4 && equal(buf.slice(0, 4), HEADER)
	}
	}).call(this,require("buffer").Buffer)
	},{"buffer":37,"buffer-equal":12}],12:[function(require,module,exports){
	var Buffer = require('buffer').Buffer; // for use with browserify

	module.exports = function (a, b) {
	    if (!Buffer.isBuffer(a)) return undefined;
	    if (!Buffer.isBuffer(b)) return undefined;
	    if (typeof a.equals === 'function') return a.equals(b);
	    if (a.length !== b.length) return false;
	    
	    for (var i = 0; i < a.length; i++) {
	        if (a[i] !== b[i]) return false;
	    }
	    
	    return true;
	};

	},{"buffer":37}],13:[function(require,module,exports){
	module.exports = function parseBMFontAscii(data) {
	  if (!data)
	    throw new Error('no data provided')
	  data = data.toString().trim()

	  var output = {
	    pages: [],
	    chars: [],
	    kernings: []
	  }

	  var lines = data.split(/\r\n?|\n/g)

	  if (lines.length === 0)
	    throw new Error('no data in BMFont file')

	  for (var i = 0; i < lines.length; i++) {
	    var lineData = splitLine(lines[i], i)
	    if (!lineData) //skip empty lines
	      continue

	    if (lineData.key === 'page') {
	      if (typeof lineData.data.id !== 'number')
	        throw new Error('malformed file at line ' + i + ' -- needs page id=N')
	      if (typeof lineData.data.file !== 'string')
	        throw new Error('malformed file at line ' + i + ' -- needs page file="path"')
	      output.pages[lineData.data.id] = lineData.data.file
	    } else if (lineData.key === 'chars' || lineData.key === 'kernings') {
	      //... do nothing for these two ...
	    } else if (lineData.key === 'char') {
	      output.chars.push(lineData.data)
	    } else if (lineData.key === 'kerning') {
	      output.kernings.push(lineData.data)
	    } else {
	      output[lineData.key] = lineData.data
	    }
	  }

	  return output
	}

	function splitLine(line, idx) {
	  line = line.replace(/\t+/g, ' ').trim()
	  if (!line)
	    return null

	  var space = line.indexOf(' ')
	  if (space === -1) 
	    throw new Error("no named row at line " + idx)

	  var key = line.substring(0, space)

	  line = line.substring(space + 1)
	  //clear "letter" field as it is non-standard and
	  //requires additional complexity to parse " / = symbols
	  line = line.replace(/letter=[\'\"]\S+[\'\"]/gi, '')  
	  line = line.split("=")
	  line = line.map(function(str) {
	    return str.trim().match((/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g))
	  })

	  var data = []
	  for (var i = 0; i < line.length; i++) {
	    var dt = line[i]
	    if (i === 0) {
	      data.push({
	        key: dt[0],
	        data: ""
	      })
	    } else if (i === line.length - 1) {
	      data[data.length - 1].data = parseData(dt[0])
	    } else {
	      data[data.length - 1].data = parseData(dt[0])
	      data.push({
	        key: dt[1],
	        data: ""
	      })
	    }
	  }

	  var out = {
	    key: key,
	    data: {}
	  }

	  data.forEach(function(v) {
	    out.data[v.key] = v.data;
	  })

	  return out
	}

	function parseData(data) {
	  if (!data || data.length === 0)
	    return ""

	  if (data.indexOf('"') === 0 || data.indexOf("'") === 0)
	    return data.substring(1, data.length - 1)
	  if (data.indexOf(',') !== -1)
	    return parseIntList(data)
	  return parseInt(data, 10)
	}

	function parseIntList(data) {
	  return data.split(',').map(function(val) {
	    return parseInt(val, 10)
	  })
	}
	},{}],14:[function(require,module,exports){
	var HEADER = [66, 77, 70]

	module.exports = function readBMFontBinary(buf) {
	  if (buf.length < 6)
	    throw new Error('invalid buffer length for BMFont')

	  var header = HEADER.every(function(byte, i) {
	    return buf.readUInt8(i) === byte
	  })

	  if (!header)
	    throw new Error('BMFont missing BMF byte header')

	  var i = 3
	  var vers = buf.readUInt8(i++)
	  if (vers > 3)
	    throw new Error('Only supports BMFont Binary v3 (BMFont App v1.10)')
	  
	  var target = { kernings: [], chars: [] }
	  for (var b=0; b<5; b++)
	    i += readBlock(target, buf, i)
	  return target
	}

	function readBlock(target, buf, i) {
	  if (i > buf.length-1)
	    return 0

	  var blockID = buf.readUInt8(i++)
	  var blockSize = buf.readInt32LE(i)
	  i += 4

	  switch(blockID) {
	    case 1: 
	      target.info = readInfo(buf, i)
	      break
	    case 2:
	      target.common = readCommon(buf, i)
	      break
	    case 3:
	      target.pages = readPages(buf, i, blockSize)
	      break
	    case 4:
	      target.chars = readChars(buf, i, blockSize)
	      break
	    case 5:
	      target.kernings = readKernings(buf, i, blockSize)
	      break
	  }
	  return 5 + blockSize
	}

	function readInfo(buf, i) {
	  var info = {}
	  info.size = buf.readInt16LE(i)

	  var bitField = buf.readUInt8(i+2)
	  info.smooth = (bitField >> 7) & 1
	  info.unicode = (bitField >> 6) & 1
	  info.italic = (bitField >> 5) & 1
	  info.bold = (bitField >> 4) & 1
	  
	  //fixedHeight is only mentioned in binary spec 
	  if ((bitField >> 3) & 1)
	    info.fixedHeight = 1
	  
	  info.charset = buf.readUInt8(i+3) || ''
	  info.stretchH = buf.readUInt16LE(i+4)
	  info.aa = buf.readUInt8(i+6)
	  info.padding = [
	    buf.readInt8(i+7),
	    buf.readInt8(i+8),
	    buf.readInt8(i+9),
	    buf.readInt8(i+10)
	  ]
	  info.spacing = [
	    buf.readInt8(i+11),
	    buf.readInt8(i+12)
	  ]
	  info.outline = buf.readUInt8(i+13)
	  info.face = readStringNT(buf, i+14)
	  return info
	}

	function readCommon(buf, i) {
	  var common = {}
	  common.lineHeight = buf.readUInt16LE(i)
	  common.base = buf.readUInt16LE(i+2)
	  common.scaleW = buf.readUInt16LE(i+4)
	  common.scaleH = buf.readUInt16LE(i+6)
	  common.pages = buf.readUInt16LE(i+8)
	  var bitField = buf.readUInt8(i+10)
	  common.packed = 0
	  common.alphaChnl = buf.readUInt8(i+11)
	  common.redChnl = buf.readUInt8(i+12)
	  common.greenChnl = buf.readUInt8(i+13)
	  common.blueChnl = buf.readUInt8(i+14)
	  return common
	}

	function readPages(buf, i, size) {
	  var pages = []
	  var text = readNameNT(buf, i)
	  var len = text.length+1
	  var count = size / len
	  for (var c=0; c<count; c++) {
	    pages[c] = buf.slice(i, i+text.length).toString('utf8')
	    i += len
	  }
	  return pages
	}

	function readChars(buf, i, blockSize) {
	  var chars = []

	  var count = blockSize / 20
	  for (var c=0; c<count; c++) {
	    var char = {}
	    var off = c*20
	    char.id = buf.readUInt32LE(i + 0 + off)
	    char.x = buf.readUInt16LE(i + 4 + off)
	    char.y = buf.readUInt16LE(i + 6 + off)
	    char.width = buf.readUInt16LE(i + 8 + off)
	    char.height = buf.readUInt16LE(i + 10 + off)
	    char.xoffset = buf.readInt16LE(i + 12 + off)
	    char.yoffset = buf.readInt16LE(i + 14 + off)
	    char.xadvance = buf.readInt16LE(i + 16 + off)
	    char.page = buf.readUInt8(i + 18 + off)
	    char.chnl = buf.readUInt8(i + 19 + off)
	    chars[c] = char
	  }
	  return chars
	}

	function readKernings(buf, i, blockSize) {
	  var kernings = []
	  var count = blockSize / 10
	  for (var c=0; c<count; c++) {
	    var kern = {}
	    var off = c*10
	    kern.first = buf.readUInt32LE(i + 0 + off)
	    kern.second = buf.readUInt32LE(i + 4 + off)
	    kern.amount = buf.readInt16LE(i + 8 + off)
	    kernings[c] = kern
	  }
	  return kernings
	}

	function readNameNT(buf, offset) {
	  var pos=offset
	  for (; pos<buf.length; pos++) {
	    if (buf[pos] === 0x00) 
	      break
	  }
	  return buf.slice(offset, pos)
	}

	function readStringNT(buf, offset) {
	  return readNameNT(buf, offset).toString('utf8')
	}
	},{}],15:[function(require,module,exports){
	var parseAttributes = require('./parse-attribs')
	var parseFromString = require('xml-parse-from-string')

	//In some cases element.attribute.nodeName can return
	//all lowercase values.. so we need to map them to the correct 
	//case
	var NAME_MAP = {
	  scaleh: 'scaleH',
	  scalew: 'scaleW',
	  stretchh: 'stretchH',
	  lineheight: 'lineHeight',
	  alphachnl: 'alphaChnl',
	  redchnl: 'redChnl',
	  greenchnl: 'greenChnl',
	  bluechnl: 'blueChnl'
	}

	module.exports = function parse(data) {
	  data = data.toString()
	  
	  var xmlRoot = parseFromString(data)
	  var output = {
	    pages: [],
	    chars: [],
	    kernings: []
	  }

	  //get config settings
	  ;['info', 'common'].forEach(function(key) {
	    var element = xmlRoot.getElementsByTagName(key)[0]
	    if (element)
	      output[key] = parseAttributes(getAttribs(element))
	  })

	  //get page info
	  var pageRoot = xmlRoot.getElementsByTagName('pages')[0]
	  if (!pageRoot)
	    throw new Error('malformed file -- no <pages> element')
	  var pages = pageRoot.getElementsByTagName('page')
	  for (var i=0; i<pages.length; i++) {
	    var p = pages[i]
	    var id = parseInt(p.getAttribute('id'), 10)
	    var file = p.getAttribute('file')
	    if (isNaN(id))
	      throw new Error('malformed file -- page "id" attribute is NaN')
	    if (!file)
	      throw new Error('malformed file -- needs page "file" attribute')
	    output.pages[parseInt(id, 10)] = file
	  }

	  //get kernings / chars
	  ;['chars', 'kernings'].forEach(function(key) {
	    var element = xmlRoot.getElementsByTagName(key)[0]
	    if (!element)
	      return
	    var childTag = key.substring(0, key.length-1)
	    var children = element.getElementsByTagName(childTag)
	    for (var i=0; i<children.length; i++) {      
	      var child = children[i]
	      output[key].push(parseAttributes(getAttribs(child)))
	    }
	  })
	  return output
	}

	function getAttribs(element) {
	  var attribs = getAttribList(element)
	  return attribs.reduce(function(dict, attrib) {
	    var key = mapName(attrib.nodeName)
	    dict[key] = attrib.nodeValue
	    return dict
	  }, {})
	}

	function getAttribList(element) {
	  //IE8+ and modern browsers
	  var attribs = []
	  for (var i=0; i<element.attributes.length; i++)
	    attribs.push(element.attributes[i])
	  return attribs
	}

	function mapName(nodeName) {
	  return NAME_MAP[nodeName.toLowerCase()] || nodeName
	}
	},{"./parse-attribs":16,"xml-parse-from-string":17}],16:[function(require,module,exports){
	//Some versions of GlyphDesigner have a typo
	//that causes some bugs with parsing. 
	//Need to confirm with recent version of the software
	//to see whether this is still an issue or not.
	var GLYPH_DESIGNER_ERROR = 'chasrset'

	module.exports = function parseAttributes(obj) {
	  if (GLYPH_DESIGNER_ERROR in obj) {
	    obj['charset'] = obj[GLYPH_DESIGNER_ERROR]
	    delete obj[GLYPH_DESIGNER_ERROR]
	  }

	  for (var k in obj) {
	    if (k === 'face' || k === 'charset') 
	      continue
	    else if (k === 'padding' || k === 'spacing')
	      obj[k] = parseIntList(obj[k])
	    else
	      obj[k] = parseInt(obj[k], 10) 
	  }
	  return obj
	}

	function parseIntList(data) {
	  return data.split(',').map(function(val) {
	    return parseInt(val, 10)
	  })
	}
	},{}],17:[function(require,module,exports){
	module.exports = (function xmlparser() {
	  //common browsers
	  if (typeof window.DOMParser !== 'undefined') {
	    return function(str) {
	      var parser = new window.DOMParser()
	      return parser.parseFromString(str, 'application/xml')
	    }
	  } 

	  //IE8 fallback
	  if (typeof window.ActiveXObject !== 'undefined'
	      && new window.ActiveXObject('Microsoft.XMLDOM')) {
	    return function(str) {
	      var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM")
	      xmlDoc.async = "false"
	      xmlDoc.loadXML(str)
	      return xmlDoc
	    }
	  }

	  //last resort fallback
	  return function(str) {
	    var div = document.createElement('div')
	    div.innerHTML = str
	    return div
	  }
	})()
	},{}],18:[function(require,module,exports){
	"use strict";
	var window = require("global/window")
	var once = require("once")
	var isFunction = require("is-function")
	var parseHeaders = require("parse-headers")
	var xtend = require("xtend")

	module.exports = createXHR
	createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
	createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

	forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
	    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
	        options = initParams(uri, options, callback)
	        options.method = method.toUpperCase()
	        return _createXHR(options)
	    }
	})

	function forEachArray(array, iterator) {
	    for (var i = 0; i < array.length; i++) {
	        iterator(array[i])
	    }
	}

	function isEmpty(obj){
	    for(var i in obj){
	        if(obj.hasOwnProperty(i)) return false
	    }
	    return true
	}

	function initParams(uri, options, callback) {
	    var params = uri

	    if (isFunction(options)) {
	        callback = options
	        if (typeof uri === "string") {
	            params = {uri:uri}
	        }
	    } else {
	        params = xtend(options, {uri: uri})
	    }

	    params.callback = callback
	    return params
	}

	function createXHR(uri, options, callback) {
	    options = initParams(uri, options, callback)
	    return _createXHR(options)
	}

	function _createXHR(options) {
	    var callback = options.callback
	    if(typeof callback === "undefined"){
	        throw new Error("callback argument missing")
	    }
	    callback = once(callback)

	    function readystatechange() {
	        if (xhr.readyState === 4) {
	            loadFunc()
	        }
	    }

	    function getBody() {
	        // Chrome with requestType=blob throws errors arround when even testing access to responseText
	        var body = undefined

	        if (xhr.response) {
	            body = xhr.response
	        } else if (xhr.responseType === "text" || !xhr.responseType) {
	            body = xhr.responseText || xhr.responseXML
	        }

	        if (isJson) {
	            try {
	                body = JSON.parse(body)
	            } catch (e) {}
	        }

	        return body
	    }

	    var failureResponse = {
	                body: undefined,
	                headers: {},
	                statusCode: 0,
	                method: method,
	                url: uri,
	                rawRequest: xhr
	            }

	    function errorFunc(evt) {
	        clearTimeout(timeoutTimer)
	        if(!(evt instanceof Error)){
	            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
	        }
	        evt.statusCode = 0
	        callback(evt, failureResponse)
	    }

	    // will load the data & process the response in a special response object
	    function loadFunc() {
	        if (aborted) return
	        var status
	        clearTimeout(timeoutTimer)
	        if(options.useXDR && xhr.status===undefined) {
	            //IE8 CORS GET successful response doesn't have a status field, but body is fine
	            status = 200
	        } else {
	            status = (xhr.status === 1223 ? 204 : xhr.status)
	        }
	        var response = failureResponse
	        var err = null

	        if (status !== 0){
	            response = {
	                body: getBody(),
	                statusCode: status,
	                method: method,
	                headers: {},
	                url: uri,
	                rawRequest: xhr
	            }
	            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
	                response.headers = parseHeaders(xhr.getAllResponseHeaders())
	            }
	        } else {
	            err = new Error("Internal XMLHttpRequest Error")
	        }
	        callback(err, response, response.body)

	    }

	    var xhr = options.xhr || null

	    if (!xhr) {
	        if (options.cors || options.useXDR) {
	            xhr = new createXHR.XDomainRequest()
	        }else{
	            xhr = new createXHR.XMLHttpRequest()
	        }
	    }

	    var key
	    var aborted
	    var uri = xhr.url = options.uri || options.url
	    var method = xhr.method = options.method || "GET"
	    var body = options.body || options.data || null
	    var headers = xhr.headers = options.headers || {}
	    var sync = !!options.sync
	    var isJson = false
	    var timeoutTimer

	    if ("json" in options) {
	        isJson = true
	        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
	        if (method !== "GET" && method !== "HEAD") {
	            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
	            body = JSON.stringify(options.json)
	        }
	    }

	    xhr.onreadystatechange = readystatechange
	    xhr.onload = loadFunc
	    xhr.onerror = errorFunc
	    // IE9 must have onprogress be set to a unique function.
	    xhr.onprogress = function () {
	        // IE must die
	    }
	    xhr.ontimeout = errorFunc
	    xhr.open(method, uri, !sync, options.username, options.password)
	    //has to be after open
	    if(!sync) {
	        xhr.withCredentials = !!options.withCredentials
	    }
	    // Cannot set timeout with sync request
	    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
	    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
	    if (!sync && options.timeout > 0 ) {
	        timeoutTimer = setTimeout(function(){
	            aborted=true//IE9 may still call readystatechange
	            xhr.abort("timeout")
	            var e = new Error("XMLHttpRequest timeout")
	            e.code = "ETIMEDOUT"
	            errorFunc(e)
	        }, options.timeout )
	    }

	    if (xhr.setRequestHeader) {
	        for(key in headers){
	            if(headers.hasOwnProperty(key)){
	                xhr.setRequestHeader(key, headers[key])
	            }
	        }
	    } else if (options.headers && !isEmpty(options.headers)) {
	        throw new Error("Headers cannot be set on an XDomainRequest object")
	    }

	    if ("responseType" in options) {
	        xhr.responseType = options.responseType
	    }

	    if ("beforeSend" in options &&
	        typeof options.beforeSend === "function"
	    ) {
	        options.beforeSend(xhr)
	    }

	    xhr.send(body)

	    return xhr


	}

	function noop() {}

	},{"global/window":19,"is-function":20,"once":21,"parse-headers":24,"xtend":25}],19:[function(require,module,exports){
	(function (global){
	if (typeof window !== "undefined") {
	    module.exports = window;
	} else if (typeof global !== "undefined") {
	    module.exports = global;
	} else if (typeof self !== "undefined"){
	    module.exports = self;
	} else {
	    module.exports = {};
	}

	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{}],20:[function(require,module,exports){
	module.exports = isFunction

	var toString = Object.prototype.toString

	function isFunction (fn) {
	  var string = toString.call(fn)
	  return string === '[object Function]' ||
	    (typeof fn === 'function' && string !== '[object RegExp]') ||
	    (typeof window !== 'undefined' &&
	     // IE8 and below
	     (fn === window.setTimeout ||
	      fn === window.alert ||
	      fn === window.confirm ||
	      fn === window.prompt))
	};

	},{}],21:[function(require,module,exports){
	module.exports = once

	once.proto = once(function () {
	  Object.defineProperty(Function.prototype, 'once', {
	    value: function () {
	      return once(this)
	    },
	    configurable: true
	  })
	})

	function once (fn) {
	  var called = false
	  return function () {
	    if (called) return
	    called = true
	    return fn.apply(this, arguments)
	  }
	}

	},{}],22:[function(require,module,exports){
	var isFunction = require('is-function')

	module.exports = forEach

	var toString = Object.prototype.toString
	var hasOwnProperty = Object.prototype.hasOwnProperty

	function forEach(list, iterator, context) {
	    if (!isFunction(iterator)) {
	        throw new TypeError('iterator must be a function')
	    }

	    if (arguments.length < 3) {
	        context = this
	    }
	    
	    if (toString.call(list) === '[object Array]')
	        forEachArray(list, iterator, context)
	    else if (typeof list === 'string')
	        forEachString(list, iterator, context)
	    else
	        forEachObject(list, iterator, context)
	}

	function forEachArray(array, iterator, context) {
	    for (var i = 0, len = array.length; i < len; i++) {
	        if (hasOwnProperty.call(array, i)) {
	            iterator.call(context, array[i], i, array)
	        }
	    }
	}

	function forEachString(string, iterator, context) {
	    for (var i = 0, len = string.length; i < len; i++) {
	        // no such thing as a sparse string.
	        iterator.call(context, string.charAt(i), i, string)
	    }
	}

	function forEachObject(object, iterator, context) {
	    for (var k in object) {
	        if (hasOwnProperty.call(object, k)) {
	            iterator.call(context, object[k], k, object)
	        }
	    }
	}

	},{"is-function":20}],23:[function(require,module,exports){

	exports = module.exports = trim;

	function trim(str){
	  return str.replace(/^\s*|\s*$/g, '');
	}

	exports.left = function(str){
	  return str.replace(/^\s*/, '');
	};

	exports.right = function(str){
	  return str.replace(/\s*$/, '');
	};

	},{}],24:[function(require,module,exports){
	var trim = require('trim')
	  , forEach = require('for-each')
	  , isArray = function(arg) {
	      return Object.prototype.toString.call(arg) === '[object Array]';
	    }

	module.exports = function (headers) {
	  if (!headers)
	    return {}

	  var result = {}

	  forEach(
	      trim(headers).split('\n')
	    , function (row) {
	        var index = row.indexOf(':')
	          , key = trim(row.slice(0, index)).toLowerCase()
	          , value = trim(row.slice(index + 1))

	        if (typeof(result[key]) === 'undefined') {
	          result[key] = value
	        } else if (isArray(result[key])) {
	          result[key].push(value)
	        } else {
	          result[key] = [ result[key], value ]
	        }
	      }
	  )

	  return result
	}
	},{"for-each":22,"trim":23}],25:[function(require,module,exports){
	arguments[4][9][0].apply(exports,arguments)
	},{"dup":9}],26:[function(require,module,exports){
	/* eslint-disable no-unused-vars */
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
	  if (val === null || val === undefined) {
	    throw new TypeError('Object.assign cannot be called with null or undefined');
	  }

	  return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
	  var from;
	  var to = toObject(target);
	  var symbols;

	  for (var s = 1; s < arguments.length; s++) {
	    from = Object(arguments[s]);

	    for (var key in from) {
	      if (hasOwnProperty.call(from, key)) {
	        to[key] = from[key];
	      }
	    }

	    if (Object.getOwnPropertySymbols) {
	      symbols = Object.getOwnPropertySymbols(from);
	      for (var i = 0; i < symbols.length; i++) {
	        if (propIsEnumerable.call(from, symbols[i])) {
	          to[symbols[i]] = from[symbols[i]];
	        }
	      }
	    }
	  }

	  return to;
	};

	},{}],27:[function(require,module,exports){
	var dtype = require('dtype')
	var anArray = require('an-array')
	var isBuffer = require('is-buffer')

	var CW = [0, 2, 3]
	var CCW = [2, 1, 3]

	module.exports = function createQuadElements(array, opt) {
	    //if user didn't specify an output array
	    if (!array || !(anArray(array) || isBuffer(array))) {
	        opt = array || {}
	        array = null
	    }

	    if (typeof opt === 'number') //backwards-compatible
	        opt = { count: opt }
	    else
	        opt = opt || {}

	    var type = typeof opt.type === 'string' ? opt.type : 'uint16'
	    var count = typeof opt.count === 'number' ? opt.count : 1
	    var start = (opt.start || 0) 

	    var dir = opt.clockwise !== false ? CW : CCW,
	        a = dir[0], 
	        b = dir[1],
	        c = dir[2]

	    var numIndices = count * 6

	    var indices = array || new (dtype(type))(numIndices)
	    for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
	        var x = i + start
	        indices[x + 0] = j + 0
	        indices[x + 1] = j + 1
	        indices[x + 2] = j + 2
	        indices[x + 3] = j + a
	        indices[x + 4] = j + b
	        indices[x + 5] = j + c
	    }
	    return indices
	}
	},{"an-array":28,"dtype":29,"is-buffer":30}],28:[function(require,module,exports){
	var str = Object.prototype.toString

	module.exports = anArray

	function anArray(arr) {
	  return (
	       arr.BYTES_PER_ELEMENT
	    && str.call(arr.buffer) === '[object ArrayBuffer]'
	    || Array.isArray(arr)
	  )
	}

	},{}],29:[function(require,module,exports){
	module.exports = function(dtype) {
	  switch (dtype) {
	    case 'int8':
	      return Int8Array
	    case 'int16':
	      return Int16Array
	    case 'int32':
	      return Int32Array
	    case 'uint8':
	      return Uint8Array
	    case 'uint16':
	      return Uint16Array
	    case 'uint32':
	      return Uint32Array
	    case 'float32':
	      return Float32Array
	    case 'float64':
	      return Float64Array
	    case 'array':
	      return Array
	    case 'uint8_clamped':
	      return Uint8ClampedArray
	  }
	}

	},{}],30:[function(require,module,exports){
	/**
	 * Determine if an object is Buffer
	 *
	 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * License:  MIT
	 *
	 * `npm install is-buffer`
	 */

	module.exports = function (obj) {
	  return !!(obj != null &&
	    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
	      (obj.constructor &&
	      typeof obj.constructor.isBuffer === 'function' &&
	      obj.constructor.isBuffer(obj))
	    ))
	}

	},{}],31:[function(require,module,exports){
	var flatten = require('flatten-vertex-data')

	module.exports.attr = setAttribute
	module.exports.index = setIndex

	function setIndex (geometry, data, itemSize, dtype) {
	  if (typeof itemSize !== 'number') itemSize = 1
	  if (typeof dtype !== 'number') dtype = 'uint16'

	  var isR69 = !geometry.index && typeof geometry.setIndex !== 'function'
	  var attrib = isR69 ? geometry.getAttribute('index') : geometry.index
	  var newAttrib = updateAttribute(attrib, data, itemSize, dtype)
	  if (newAttrib) {
	    if (isR69) geometry.addAttribute('index', newAttrib)
	    else geometry.index = newAttrib
	  }
	}

	function setAttribute (geometry, key, data, itemSize, dtype) {
	  if (typeof itemSize !== 'number') itemSize = 3
	  if (typeof dtype !== 'number') dtype = 'float32'
	  if (Array.isArray(data) &&
	    Array.isArray(data[0]) &&
	    data[0].length !== itemSize) {
	    throw new Error('Nested vertex array has unexpected size; expected ' +
	      itemSize + ' but found ' + data[0].length)
	  }

	  var attrib = geometry.getAttribute(key)
	  var newAttrib = updateAttribute(attrib, data, itemSize, dtype)
	  if (newAttrib) {
	    geometry.addAttribute(key, newAttrib)
	  }
	}

	function updateAttribute (attrib, data, itemSize, dtype) {
	  data = data || []
	  if (!attrib || rebuildAttribute(attrib, data, itemSize)) {
	    // create a new array with desired type
	    data = flatten(data, dtype)
	    attrib = new THREE.BufferAttribute(data, itemSize)
	    attrib.needsUpdate = true
	    return attrib
	  } else {
	    // copy data into the existing array
	    flatten(data, attrib.array)
	    attrib.needsUpdate = true
	    return null
	  }
	}

	// Test whether the attribute needs to be re-created,
	// returns false if we can re-use it as-is.
	function rebuildAttribute (attrib, data, itemSize) {
	  if (attrib.itemSize !== itemSize) return true
	  if (!attrib.array) return true
	  var attribLength = attrib.array.length
	  if (Array.isArray(data) && Array.isArray(data[0])) {
	    // [ [ x, y, z ] ]
	    return attribLength !== data.length * itemSize
	  } else {
	    // [ x, y, z ]
	    return attribLength !== data.length
	  }
	}

	},{"flatten-vertex-data":32}],32:[function(require,module,exports){
	/*eslint new-cap:0*/
	var dtype = require('dtype')
	module.exports = flattenVertexData
	function flattenVertexData (data, output, offset) {
	  if (!data) throw new TypeError('must specify data as first parameter')
	  offset = +(offset || 0) | 0

	  if (Array.isArray(data) && Array.isArray(data[0])) {
	    var dim = data[0].length
	    var length = data.length * dim

	    // no output specified, create a new typed array
	    if (!output || typeof output === 'string') {
	      output = new (dtype(output || 'float32'))(length + offset)
	    }

	    var dstLength = output.length - offset
	    if (length !== dstLength) {
	      throw new Error('source length ' + length + ' (' + dim + 'x' + data.length + ')' +
	        ' does not match destination length ' + dstLength)
	    }

	    for (var i = 0, k = offset; i < data.length; i++) {
	      for (var j = 0; j < dim; j++) {
	        output[k++] = data[i][j]
	      }
	    }
	  } else {
	    if (!output || typeof output === 'string') {
	      // no output, create a new one
	      var Ctor = dtype(output || 'float32')
	      if (offset === 0) {
	        output = new Ctor(data)
	      } else {
	        output = new Ctor(data.length + offset)
	        output.set(data, offset)
	      }
	    } else {
	      // store output in existing array
	      output.set(data, offset)
	    }
	  }

	  return output
	}

	},{"dtype":33}],33:[function(require,module,exports){
	arguments[4][29][0].apply(exports,arguments)
	},{"dup":29}],34:[function(require,module,exports){
	var assign = require('object-assign')

	module.exports = function createSDFShader (opt) {
	  opt = opt || {}
	  var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1
	  var alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001
	  var precision = opt.precision || 'highp'
	  var color = opt.color
	  var map = opt.map

	  // remove to satisfy r73
	  delete opt.map
	  delete opt.color
	  delete opt.precision
	  delete opt.opacity

	  return assign({
	    uniforms: {
	      opacity: { type: 'f', value: opacity },
	      map: { type: 't', value: map || new THREE.Texture() },
	      color: { type: 'c', value: new THREE.Color(color) }
	    },
	    vertexShader: [
	      'attribute vec2 uv;',
	      'attribute vec4 position;',
	      'uniform mat4 projectionMatrix;',
	      'uniform mat4 modelViewMatrix;',
	      'varying vec2 vUv;',
	      'void main() {',
	      'vUv = uv;',
	      'gl_Position = projectionMatrix * modelViewMatrix * position;',
	      '}'
	    ].join('\n'),
	    fragmentShader: [
	      '#ifdef GL_OES_standard_derivatives',
	      '#extension GL_OES_standard_derivatives : enable',
	      '#endif',
	      'precision ' + precision + ' float;',
	      'uniform float opacity;',
	      'uniform vec3 color;',
	      'uniform sampler2D map;',
	      'varying vec2 vUv;',

	      'float aastep(float value) {',
	      '  #ifdef GL_OES_standard_derivatives',
	      '    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;',
	      '  #else',
	      '    float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));',
	      '  #endif',
	      '  return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);',
	      '}',

	      'void main() {',
	      '  vec4 texColor = texture2D(map, vUv);',
	      '  float alpha = aastep(texColor.a);',
	      '  gl_FragColor = vec4(color, opacity * alpha);',
	      alphaTest === 0
	        ? ''
	        : '  if (gl_FragColor.a < ' + alphaTest + ') discard;',
	      '}'
	    ].join('\n')
	  }, opt)
	}

	},{"object-assign":26}],35:[function(require,module,exports){
	var loadFont = require('load-bmfont')
	//global.THREE = require('three')

	// A utility to load a font, then a texture
	module.exports = function (opt, cb) {
	  loadFont(opt.font, function (err, font) {
	    if (err) throw err
		PANOLENS.Utils.TextureLoader.load( opt.image, function (tex) {
	      cb(font, tex)
	    } );
	  })
	}

	},{"load-bmfont":10}],36:[function(require,module,exports){

	var createText = require('../')
	var SDFShader = require('../shaders/sdf')

	if ( PANOLENS && PANOLENS.Utils && PANOLENS.SpriteText ) {
		PANOLENS.Utils.loadBMFont = function(fontObject, callback){
			require('./load')(fontObject, PANOLENS.SpriteText.prototype.setBMFont.bind(PANOLENS.SpriteText.prototype, callback));
		};
		PANOLENS.SpriteText.prototype.generateTextGeometry = createText;
		PANOLENS.SpriteText.prototype.generateSDFShader = SDFShader;
	}

	},{"../":1,"../shaders/sdf":34,"./load":35}],37:[function(require,module,exports){
	(function (global){
	/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = require('base64-js')
	var ieee754 = require('ieee754')
	var isArray = require('isarray')

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  //array.byteLength // this throws if `array` is not a valid ArrayBuffer

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(array)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	// Even though this property is private, it shouldn't be removed because it is
	// used by `is-buffer` to detect buffer instances in Safari 5-7.
	Buffer.prototype._isBuffer = true

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end)
	    newBuf.__proto__ = Buffer.prototype
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    )
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{"base64-js":38,"ieee754":39,"isarray":40}],38:[function(require,module,exports){
	;(function (exports) {
	  'use strict'

	  var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

	  var PLUS = '+'.charCodeAt(0)
	  var SLASH = '/'.charCodeAt(0)
	  var NUMBER = '0'.charCodeAt(0)
	  var LOWER = 'a'.charCodeAt(0)
	  var UPPER = 'A'.charCodeAt(0)
	  var PLUS_URL_SAFE = '-'.charCodeAt(0)
	  var SLASH_URL_SAFE = '_'.charCodeAt(0)

	  function decode (elt) {
	    var code = elt.charCodeAt(0)
	    if (code === PLUS || code === PLUS_URL_SAFE) return 62 // '+'
	    if (code === SLASH || code === SLASH_URL_SAFE) return 63 // '/'
	    if (code < NUMBER) return -1 // no match
	    if (code < NUMBER + 10) return code - NUMBER + 26 + 26
	    if (code < UPPER + 26) return code - UPPER
	    if (code < LOWER + 26) return code - LOWER + 26
	  }

	  function b64ToByteArray (b64) {
	    var i, j, l, tmp, placeHolders, arr

	    if (b64.length % 4 > 0) {
	      throw new Error('Invalid string. Length must be a multiple of 4')
	    }

	    // the number of equal signs (place holders)
	    // if there are two placeholders, than the two characters before it
	    // represent one byte
	    // if there is only one, then the three characters before it represent 2 bytes
	    // this is just a cheap hack to not do indexOf twice
	    var len = b64.length
	    placeHolders = b64.charAt(len - 2) === '=' ? 2 : b64.charAt(len - 1) === '=' ? 1 : 0

	    // base64 is 4/3 + up to two characters of the original data
	    arr = new Arr(b64.length * 3 / 4 - placeHolders)

	    // if there are placeholders, only get up to the last complete 4 chars
	    l = placeHolders > 0 ? b64.length - 4 : b64.length

	    var L = 0

	    function push (v) {
	      arr[L++] = v
	    }

	    for (i = 0, j = 0; i < l; i += 4, j += 3) {
	      tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
	      push((tmp & 0xFF0000) >> 16)
	      push((tmp & 0xFF00) >> 8)
	      push(tmp & 0xFF)
	    }

	    if (placeHolders === 2) {
	      tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
	      push(tmp & 0xFF)
	    } else if (placeHolders === 1) {
	      tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
	      push((tmp >> 8) & 0xFF)
	      push(tmp & 0xFF)
	    }

	    return arr
	  }

	  function uint8ToBase64 (uint8) {
	    var i
	    var extraBytes = uint8.length % 3 // if we have 1 byte left, pad 2 bytes
	    var output = ''
	    var temp, length

	    function encode (num) {
	      return lookup.charAt(num)
	    }

	    function tripletToBase64 (num) {
	      return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
	    }

	    // go through the array every three bytes, we'll deal with trailing stuff later
	    for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
	      temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
	      output += tripletToBase64(temp)
	    }

	    // pad the end with zeros, but make sure to not forget the extra bytes
	    switch (extraBytes) {
	      case 1:
	        temp = uint8[uint8.length - 1]
	        output += encode(temp >> 2)
	        output += encode((temp << 4) & 0x3F)
	        output += '=='
	        break
	      case 2:
	        temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
	        output += encode(temp >> 10)
	        output += encode((temp >> 4) & 0x3F)
	        output += encode((temp << 2) & 0x3F)
	        output += '='
	        break
	      default:
	        break
	    }

	    return output
	  }

	  exports.toByteArray = b64ToByteArray
	  exports.fromByteArray = uint8ToBase64
	}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

	},{}],39:[function(require,module,exports){
	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}

	},{}],40:[function(require,module,exports){
	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};

},{}]},{},[36]);