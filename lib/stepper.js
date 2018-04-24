var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("./board");
var events = require("events");
var util = require("util");
var boardSteppers = new Map();
var temporal;

/**
 * The max time we want to allow a temporal animation segment to run.
 * When running, temporal can push CPU utilization to 100%. When this
 * time (in ms) is reached we will fall back to setInterval which is less
 * accurate (by nanoseconds) but perfectly serviceable.
 **/
var temporalTTL = 5000;

// var __ = require("./fn");

var priv = new Map();

// Controllers
//
// Controllers are those things that exist between your microcontroller and the
// device you will be talking to. Things like multiplexers, shift registers,
// backpacks, etc. are controllers. Sometimes controllers are just an IC
// on a breakout board and not a separate piece of hardware.
var Controllers = {
  firmataStepper: {
    /*
     * You can override methods or properties on the prototype here
     * or add new methods that are only called from within the controller
     */
    initialize: {
      value: function () {
        ["motorPin1", "motorPin2", "motorPin3", "motorPin4", "enable", "ms1", "ms2"].forEach(function(pin, index) {
          if (this.pins[pin]) {
            // If this is a motor pin
            if (index < 4) {
              this.io.pinMode(this.pins[pin], this.io.MODES.STEPPER);
            } else {
              this.io.pinMode(this.pins[pin], this.io.MODES.OUTPUT);
            }
          }
        }, this);
      
        this.enable();
      }
    },
    // correlates with MAXSTEPPERS in firmware
    MAXSTEPPERS: {
      value: 6
    }
  },
  firmataAccelStepper: {
    initialize: {
      value: function () {
        // let opts = pins;
        // opts.deviceNum = this.id;
        // opts.type = 1;
        // stepsize = 1;
        // direction = 1;
        
        // this.io.accelStepperConfig(opts);
      }
    },
    // correlates with MAXSTEPPERS in firmware
    MAXSTEPPERS: {
      value: 10
    },
    anotherMethod: {
      value: function () {
        // Another method that overrides a method on the prototype
      }
    }
  }
}

// Aliases
//
// If your controller is commonly referred to by another name use an alias
Controllers.awesomeController = Controllers.sampleController;

// Devices
//
// Some classes have different types of "devices" i.e. Motor has non-directional,
// directional and CDIR. Servo has regular servos and continuous rotation servos.
// Put code that is unique to those devices here. These methods and properties
// DO NOT override methods on the prototype. They are unique to the device.
 var Devices = {
  // fourWire devices are handled by our default case
  FOUR_WIRE: {
    normalizePins: {
      value: function(pins) {
        let result = pins;
        if (Array.isArray(pins)) {
          
          if (pins.length < 4) {
            throw new Error(
              "Stepper.DEVICE.FOUR_WIRE expects 4 pins"
            );
          }
          
          result = {
            motorPin1: pins[0],
            motorPin2: pins[1],
            motorPin3: pins[2],
            motorPin4: pins[3]
          };
          
          if (pins.length === 5) {
            result.enable = pins[4];
          }
        
        } else {
          if (typeof pins.motorPin1 === "undefined" || 
            typeof pins.motorPin2 === "undefined" || 
            typeof pins.motorPin3 === "undefined" || 
            typeof pins.motorPin4 === "undefined"
          ) {
            throw new Error(
              "Stepper.DEVICE.FOUR_WIRE expects: 'pins.motorPin1', 'pins.motorPin2', 'pins.motorPin3', 'pins.motorPin4'"
            );
          }
        }
        return result;
      }
    },
    pinsArray: {
      get: function() {
        return [ this.pins.motorPin1, this.pins.motorPin2, this.pins.motorPin3, this.pins.motorPin4 ];
      }
    },
    steps: {
      value: [
        [0b0101, 0b0110, 0b1010, 0b1001], // WHOLE
        [0b0101, 0b0100, 0b0110, 0b0010, 0b1010, 0b1000, 0b1001, 0b0001], // HALF
      ]
    },
    singlePort: {
      value: function() {
        return ((this.pins.motorPin1 >> 3) | (this.pins.motorPin2 >> 3) | (this.pins.motorPin3 >> 3) === (this.pins.motorPin4 >> 3));
      }
    }
  },
  THREE_WIRE: {
    normalizePins: {
      value: function(pins) {
        let result = pins;
        if (pins.length < 3) {
          throw new Error(
            "Stepper.DEVICE.THREE_WIRE expects 3 pins"
          );
        }
        
        if (Array.isArray(pins)) {
          result = {
            motorPin1: pins[0],
            motorPin2: pins[1],
            motorPin3: pins[2]
          };

          if (pins.length === 4) {
            result.enable = pins[3];
          }
          
        } else {
          if (typeof pins.motorPin1 === "undefined" || 
            typeof pins.motorPin2 === "undefined" || 
            typeof pins.motorPin3 === "undefined"
          ) {
            throw new Error(
              "Stepper.DEVICE.THREE_WIRE expects: 'pins.motorPin1', 'pins.motorPin2', 'pins.motorPin3'"
            );
          }
          
        }
        return result;
      }
    },
    pinsArray: {
      get: function() {
        return [ this.pins.motorPin1, this.pins.motorPin2, this.pins.motorPin3 ];
      }
    },
    steps: {
      value: [   
        [0b100, 0b001, 0b010], // WHOLE
        [0b100, 0b101, 0b001, 0b011, 0b010, 0b110], //HALF
      ]
    },
    singlePort: {
      value: function() {
        return ((this.pins.motorPin1 >> 3) | (this.pins.motorPin2 >> 3) === (this.pins.motorPin3 >> 3));
      }
    }
  },
  TWO_WIRE: {
    normalizePins: {
      value: function(pins) {
        let result = pins;
        if (pins.length < 2) {
          throw new Error(
            "Stepper.DEVICE.TWO_WIRE expects 2 pins"
          );
        }
        
        if (Array.isArray(pins)) {
          result = {
            motorPin1: pins[0],
            motorPin2: pins[1]
          };

          if (pins.length === 3) {
            result.enable = pins[2];
          }

        } else {
          if (typeof this.pins.motorPin1 === "undefined" || 
            typeof this.pins.motorPin2 === "undefined"
          ) {
            throw new Error(
              "Stepper.DEVICE.TWO_WIRE expects: 'pins.motorPin1', 'pins.motorPin2'"
            );
          }
          
        }
        return result;
      }
    },
    pinsArray: {
      get: function() {
        return [ this.pins.motorPin1, this.pins.motorPin2 ];
      }
    },
    steps: {
      value: [
        [0b10, 0b11, 0b01, 0b00], // WHOLE
      ]
    },
    singlePort: {
      value: function() {
        return ((this.pins.motorPin1 >> 3) === (this.pins.motorPin2 >> 3));
      }
    }
  },
  DRIVER: {
    normalizePins: {
      value: function(pins) {
        let result = pins;

        if (pins.length < 2) {
          throw new Error(
            "Stepper.DEVICE.TWO_WIRE expects 2 pins"
          );
        }
        
        if (Array.isArray(pins)) {
          result = {
            step: pins[0],
            dir: pins[1]
          };

          if (pins.length > 2) {
            result.enable = pins[2];
          }

          if (pins.length > 3) {
            result.ms1 = pins[3];
          }

          if (pins.length > 4) {
            result.ms2 = pins[4];
          }

        } else {
          if (typeof pins.dir === "undefined" || 
            typeof pins.step === "undefined"
          ) {
            throw new Error(
              "Stepper.DEVICE.DRIVER expects: 'pins.dir', 'pins.step'"
            );
          }
        }
        return result;
      }
    },
    singlePort: {
      value: function() {
        return true;
      }
    }
  }
};

/**
 *
 * @constructor
 *
 * @param {Object} opts Options: pin(s), device, controller, other configuration opts
 * @param {Number|String} pin number
 *
 * Include some example initializations here showing different API patterns
 *
 *    new five.myNewClass({ pin: 3});
 *
 * ...is the same as...
 *
 *    new five.MyNewClass(3);
 *
 */

function Stepper(opts) {

  var device, controller, state;

  // Necessary to avoid loading temporal unless necessary
  if (!temporal) {
    temporal = require("temporal");
  }

  if (!(this instanceof Stepper)) {
    return new Stepper(opts);
  }

  if (typeof opts === "number" || Array.isArray(opts)) {
    opts = {
      pins: opts
    };
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );
  
  controller = opts.controller || null;

  opts.device = opts.device || opts.type;

  // Derive device based on pin parameters
  if (typeof opts.device === "undefined") {
    if (Array.isArray(opts.pins)) {
      if (opts.pins.length === 2) {
        throw new Error(
          "Two pin steppers require a `step` and `dir` in an opts.pins object (DRIVER, TWO_WIRE)"
        );
      }
      if (opts.pins.length === 3) {
        opts.device = Stepper.DEVICE.THREE_WIRE;
      }
      if (opts.pins.length > 3) {
        opts.device = Stepper.DEVICE.FOUR_WIRE;
      }
    } else {
      if (typeof opts.pins.motorPin4 !== "undefined") {
        opts.device = Stepper.DEVICE.FOUR_WIRE;
      } else if (typeof opts.pins.motorPin3 !== "undefined"){
        opts.device = Stepper.DEVICE.THREE_WIRE;
      } else if (typeof opts.pins.motorPin2 !== "undefined"){
        opts.device = Stepper.DEVICE.TWO_WIRE;
      } else if (typeof opts.pins.dir !== "undefined"){
        opts.device = Stepper.DEVICE.DRIVER;
      }
    }
  }
  
  if (typeof opts.device === "number") {
    opts.device = Stepper.DEVICES[opts.device];
  }

  this.device = opts.device;

  // Allow users to pass in custom device types
  device = typeof opts.device === "string" ?
    Devices[opts.device] : opts.device;

  // Some properties may be passed in as strings. Convert them to Numbers
  ["stepType", "units", "direction"].forEach( function(option) {
    if (typeof opts[option] === "string") {
      opts[option] = Stepper[option.toUpperCase()][opts[option]];
    }
  });

  // Create a "state" entry for privately
  // storing the state of the instance
  state = {
    isOn: false,
    isEnabled: false,
    position: 0,
    targetPosition: 0,
    stepInterval: 0,
    direction: opts.direction || 0,
    currentSpeed: 0,
    currentStep: 0,
    firstStep: 1.0,
    nextStep: 1.0,
    minSpeed: 1.0
  };
  
  // If necessary set default property values
  this.stepType = opts.stepType || 0;
  this.acceleration = opts.acceleration || 1000000;
  this.deceleration = opts.deceleration || 0;
  this.position = opts.position || 0;
  
  this.units = typeof opts.units !== "undefined" ?
    opts.units : Stepper.UNITS.STEPS;
  this.stepsPerRev = typeof opts.stepsPerRev !== "undefined" ?
    opts.stepsPerRev : 200;
  state.currentSpeed = typeof opts.speed !== "undefined" ?
    opts.speed : 1;
    
  // First the device decorates the instance
  Object.defineProperties(this, device);
  
  // Then the controller decorates the instance
  if (opts.controller) {
    controller = typeof opts.controller === "string" ?
      Controllers[opts.controller] : opts.controller;

    Board.Controller.call(this, controller, opts);
  }

  this.pins = this.normalizePins(opts.pins);

  // Set the state
  priv.set(this, state);

  // Getters for private state values
  Object.defineProperties(this, {
    isOn: {
      get: function() {
        return state.isOn;
      },
      set: function(isOn) {
        state.isOn = isOn;
      }
    },
    isEnabled: {
      get: function() {
        return state.isEnabled;
      },
      set: function(isEnabled) {
        state.isEnabled = isEnabled;
      }
    },
    position: {
      get: function() {
        return state.position;
      },
      set: function(value) {
        state.position = value;
      }
    },
    direction: {
      get: function() {
        return state.direction;
      },
      set: function(dir) {
        state.direction = dir;
      }
    },
    targetPosition: {
      get: function() {
        return state.targetPosition;
      },
      set: function(pos) {
        state.targetPosition = pos;
      }
    },
    stepInterval: {
      get: function() {
        return state.stepInterval;
      },
      set: function(interval) {
        state.stepInterval = interval;
      }
    }
  });

  boardSteppers.set(this.board, boardSteppers.get(this.board) || []);
  this.id = boardSteppers.get(this.board).length;

  if (this.id >= this.MAXSTEPPERS) {
    throw new Error(
      "Stepper cannot exceed max steppers (" + this.MAXSTEPPERS + ")"
    );
  }

  boardSteppers.get(this.board).push(this);

  // Most if not all classes will have an intialization method
  if (this.initialize) {
    this.initialize(opts);
  }

}

util.inherits(Stepper, events.EventEmitter);

Object.defineProperties(Stepper, {
  /* jshint elision: true */
  DEVICES: {
    value: [/* Intentionally empty */, "DRIVER", "TWO_WIRE", "THREE_WIRE", "FOUR_WIRE"]
  },
  DEVICE: {
    value: Object.freeze({
      DRIVER: 1,
      TWO_WIRE: 2,
      THREE_WIRE: 3,
      FOUR_WIRE: 4
    })
  },
  TYPE: {
    value: Object.freeze({
      DRIVER: 1,
      TWO_WIRE: 2,
      THREE_WIRE: 3,
      FOUR_WIRE: 4
    })
  },
  RUNSTATE: {
    value: Object.freeze({
      STOP: 0,
      ACCEL: 1,
      DECEL: 2,
      RUN: 3
    })
  },
  DIRECTION: {
    value: Object.freeze({
      CCW: 0,
      CW: 1
    })
  },
  UNITS: {
    value: Object.freeze({
      STEPS: 0,
      DEGREES: 1,
      RADS: 2,
      REVS: 3
    })
  },
  STEPTYPE: {
    value: Object.freeze({
      WHOLE: 0,
      HALF: 1,
      QUARTER: 2,
      EIGHTH: 3,
      SIXTEENTH: 4,
      THIRTYSECOND: 5,
      SIXTYFOURTH: 6,
      ONEHUNDREDTWENTYEIGHTH: 7
    })
  }
});

/**
 * Temporal will run up the CPU. temporalFallback is used
 * for long running animations.
 */
Stepper.prototype.TemporalFallback = function(animation) {
  let state = priv.get(this);
  this.interval = setInterval(function() {
    Stepper.run({
      calledAt: Date.now()
    });
  }, state.nextStep);
};

Stepper.prototype.TemporalFallback.prototype.stop = function() {
  if (this.interval) {
    clearInterval(this.interval);
  }
};

/*
 * initialize(), setPin() and setPWM() are usually overridden
 * in the controller.
 */
Stepper.prototype.initialize = function() {
  var state = priv.get(this);

  // Set the pin modes
  ["motorPin1", "motorPin2", "motorPin3", "motorPin4", "enable", "ms1", "ms2"].forEach(function(pin, index) {
    if (this.pins[pin]) {
      // If we are microstepping and this is a motor pin
      if (this.stepType > 1 && index < 4) {
        this.io.pinMode(this.pins[pin], this.io.MODES.PWM);
      } else {
        this.io.pinMode(this.pins[pin], this.io.MODES.OUTPUT);
      }
    }
  }, this);

  state.singlePort = this.singlePort();
  this.enable();

};

Stepper.prototype.setPin = function(pin, value) {
  this.io.digitalWrite(pin, value);
};

/*
 * Set the speed of our stepper
 */
Stepper.prototype.speed = function(value) {
  let state = priv.get(this);
  // Methods without params might be getting a value
  if (typeof value === "undefined") {
    return state.currentSpeed;
  } else {
    state.currentSpeed = normalizeUnits(value);
    state.minSpeed = 1000000 / state.currentSpeed;
    if (state.minSpeed < 0) {
      state.minSpeed *= -1;
    }
    this.computeNewSpeed();
    return this;
  }

};

/*
 * Set/get the rpm of our stepper
 */
Stepper.prototype.rpm = function(value) {
  let state = priv.get(this);
  // Methods without params might be getting a value
  if (typeof value === "undefined") {
    return (state.currentSpeed / this.stepsPerRev) * 60 ;
  } else {
    state.currentSpeed = (value / 60) * this.stepsPerRev;
    return this;
  }

};

/*
 * Set the acceleration
 */
Stepper.prototype.accel = function(value) {
  let state = priv.get(this);
  // Methods without params might be getting a value
  if (typeof value === "undefined") {
    return this.acceleration;
  } else {
    this.acceleration = normalizeUnits(value);
    this.computeNewSpeed();
    return this;
  }

};

/*
 * Set the deceleration
 */
Stepper.prototype.decel = function(value) {
  
  // Methods without params might be getting a value
  if (typeof value === "undefined") {
    return this.deceleration;
  } else {
    this.deceleration = normalizeUnits(value);
    return this;
  }

};

/*
 * Zero the stepper position
 */
Stepper.prototype.zero = function() {
  
  this.position(0);

};

/*
 * Find the number of steps remaining
 */
Stepper.prototype.distanceToGo = function() {
  let state = priv.get(this);

  return state.targetPosition - state.position;

};

/*
 * Set the stepper position
 */
Stepper.prototype.position = function(value) {
  
  // Methods without params might be getting a value
  if (typeof value === "undefined") {
    return this.position;
  } else {
    this.position = normalizeUnits(value);
    return this;
  }

};

/*
 * Step the stepper
 */
Stepper.prototype.step = function(steps, callback) {
  //let now = Date.now();
  //this.startTime = now;
  
  //this.fallBackTime = now + temporalTTL;
  
  this.stop();
  
  this.targetPosition = this.position + steps;

  this.computeNewSpeed();
  
  console.log("step to", this.targetPosition);

  //this.playLoop = temporal.loop(this.rate, this.run);
  this.run(callback);

};

/*
 * Internal method called by our playloop
 */
Stepper.prototype.run = function(callback) {

  // console.log("----------------------\nRUN");
  let state = priv.get(this);

  // this.computeNewSpeed();
  
  // Dont do anything unless we actually have a step interval
  if (!state.stepInterval) {
    return false;
  }
  // console.log(this.position);

  let stepsToGo = this.distanceToGo();
  if (stepsToGo < 0) {
    this.position--;
  } else {
    this.position++;
  }
  // console.log(this.position, state.stepInterval);
  let frameCount = this.steps[this.stepType].length;
  let pinCount = this.pinsArray.length;
  let frame = this.steps[this.stepType][this.position % frameCount];

  this.pinsArray.forEach((pin, index) => {
    this.setPin(pin, (frame >> (pinCount - index - 1) & 0x01));
  });
    
  if (stepsToGo !== 0) {
    //console.log("queue", state.stepInterval);
    // process.nextTick(() => {
      // temporal.delay(state.stepInterval, () => {
      //   this.run(callback);
      // });
    // });
    setTimeout(() => {
      this.run(callback);
    }, state.stepInterval);
  } else {
    if (callback) {
      callback();
    }
  }
}
  

/*
 * Stop the stepper
 */
Stepper.prototype.stop = function() {
  
};

/*
 * Move the stepper to a give position
 */
Stepper.prototype.to = function(value) {
  
};

/*
 * Enable the stepper
 */
Stepper.prototype.enable = function() {
  if (this.pins.enable) {
    this.setPin(this.pins.enable, 1);
  }
  this.isEnabled = true;
};

/*
 * Disable the stepper
 */
Stepper.prototype.disable = function() {
  if (this.pins.enable) {
    this.setPin(this.pins.enable, 0);
  }
  this.isEnabled = false;
};

/*
 * Set or get the stepper direction
 */
Stepper.prototype.direction = function(dir) {
  // Methods without params might be getting a value
  if (typeof dir === "undefined") {
    return this.direction;
  } else {
    this.direction = dir;
    return this;
  }
};

/*
 * Set the stepper to ccw direction
 */
Stepper.prototype.ccw = function() {
  this.direction = Stepper.DIRECTION.CCW;
  return this;
};

/*
 * Set the stepper to cw direction
 */
Stepper.prototype.cw = function() {
  this.direction = Stepper.DIRECTION.CW;
  return this;
};

const normalizeUnits = function (value) {

  switch (this.units) {
    case Stepper.UNITS.DEGREES:
      return value * this.stepsPerRev / 360;
    case Stepper.UNITS.RADS:
      return value * this.stepsPerRev / (2 * Math.Pi);
    case Stepper.UNITS.REVS:
      return value * this.stepsPerRev;
  } 

  return value;

};

// This function borrows heavily from Mike McCauley's AccelStepper library
// for Arduino. If you use this acceleration code on your stepper you should
// consider donating to http://www.airspayce.com/mikem/arduino/AccelStepper/ 
Stepper.prototype.computeNewSpeed = function() {
  
  let state = priv.get(this);
  
//   // If accel is 0 we use 10^6 so that we achieve maximum acceleration on the first step
//   let accel = this.acceleration || 1000000;

  //  let stepsToStop = (state.currentSpeed * state.currentSpeed) / (2.0 * (accel));
  let stepsToGo = this.distanceToGo();

  if (stepsToGo) {
    state.stepInterval = Math.floor(1000 / state.currentSpeed);
  }
  
  // if (stepsToGo === 0) { // } && stepsToStop <= 1) {
	//   // We are at the target and its time to stop
	//   state.stepInterval = 0;
	//   // state.currentSpeed = 0.0;
	//   // state.currentStep = 0;
	//   return;
  // }

//   if (stepsToGo > 0) {
// 	  // We are anticlockwise from the target
// 	  // Need to go clockwise from here, maybe decelerate now
// 	  if (state.currentStep > 0) {
// 	    // Currently accelerating, need to decel now? Or maybe going the wrong way?
// 	    if ((stepsToStop >= stepsToGo) || this.direction == Stepper.DIRECTION.CCW) {
//         // Start deceleration
//         state.currentStep = -stepsToStop;
//       }
//     } else if (state.currentStep < 0) {
//       // Currently decelerating, need to accel again?
//       if ((stepsToStop < stepsToGo) && this.direction === Stepper.DIRECTION.CW) {
//         // Start accceleration
//         state.currentStep = -state.currentStep;
//       }
//     }
//   } else if (stepsToGo < 0) {
//     // We are clockwise from the target
//     // Need to go anticlockwise from here, maybe decelerate
//     if (state.currentStep > 0) {
//       // Currently accelerating, need to decel now? Or maybe going the wrong way?
//       if ((stepsToStop >= -stepsToGo) || this.direction == Stepper.DIRECTION.CW) {
//         // Start deceleration
//         state.currentStep = -stepsToStop;
//       } else if (state.currentStep < 0) {
//         // Currently decelerating, need to accel again?
//         if ((stepsToStop < stepsToGo * -1) && this.direction == Stepper.DIRECTION.CCW) {
//           state.currentStep = -state.currentStep; // Start accceleration
//         }
//       }
//     }

//     // Need to accelerate or decelerate
//     if (state.currentStep == 0) {
//       // First step from stopped
//       state.nextStep = state.firstStep;
//       this.direction = (stepsToGo > 0) ? Stepper.DIRECTION.CW : Stepper.DIRECTION.CCW;
//     } else {
//       // Subsequent step. Works for accel (n is +_ve) and decel (n is -ve).
//       state.nextStep = state.nextStep - ((2.0 * state.nextStep) / ((4.0 * state.currentStep) + 1));
//       state.nextStep = max(state.nextStep, this._cmin); 
//     }
//   }  
   
//   state.currentStep++;
//   state.stepInterval = state.nextStep;
//   state.currentSpeed = 1000000.0 / state.nextStep;
//   if (this.direction == Stepper.DIRECTION.CCW) {
//     state.currentSpeed = state.currentSpeed *-1;
//   }

}

module.exports = Stepper;
