// const IS_TEST_MODE = !!process.env.IS_TEST_MODE;
const Board = require("./board");
const fn = require("./fn");
const events = require("events");
const util = require("util");
const ease = require("ease-component");
let steppers = new Map();
let temporal;

const Controllers = {
  firmataAccelStepper: {
    initialize: {
      value: function () {
        ["motor1", "motor2", "motor3", "motor4", "enable", "ms1", "ms2"].forEach((pin, index) => {
          if (this.pins[pin]) {
            // If we are microstepping and this is a motor pin
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
      value: 10
    }
  }
};

// Devices
const Devices = {
  // fourWire devices are our default case
  FOUR_WIRE: {
    pins: {
      get: function() {
        if (Array.isArray(this.opts.pins)) {
          
          if (this.opts.pins.length < 4) {
            throw new Error(
              "Stepper.DEVICE.FOUR_WIRE expects 4 pins"
            );
          }
          
          let result = {
            motor1: this.opts.pins[0],
            motor2: this.opts.pins[1],
            motor3: this.opts.pins[2],
            motor4: this.opts.pins[3]
          };
          
          if (this.opts.pins.length === 5) {
            result.enable = this.opts.pins[4];
          }
          
          return result;
        } else {
          if (typeof this.opts.pins.motor1 === "undefined" || 
            typeof this.opts.pins.motor2 === "undefined" || 
            typeof this.opts.pins.motor3 === "undefined" || 
            typeof this.opts.pins.motor4 === "undefined"
          ) {
            throw new Error(
              "Stepper.DEVICE.FOUR_WIRE expects: 'pins.motor1', 'pins.motor2', 'pins.motor3', 'pins.motor4'"
            );
          }
          return this.opts.pins;
        }
      }
    },
    pinsArray: {
      get: function() {
        return [ this.pins.motor1, this.pins.motor2, this.pins.motor3, this.pins.motor4 ];
      }
    },
    steps: {
      value: [
        [0b0101, 0b0110, 0b1010, 0b1001], // WHOLE
        [0b0101, 0b0100, 0b0110, 0b0010, 0b1010, 0b1000, 0b1001, 0b0001], // HALF
      ]
    }
  },
  THREE_WIRE: {
    pins: {
      get: function() {
        
        if (this.opts.pins.length < 3) {
          throw new Error(
            "Stepper.DEVICE.THREE_WIRE expects 3 pins"
          );
        }
        
        if (Array.isArray(this.opts.pins)) {
          let result = {
            motor1: this.opts.pins[0],
            motor2: this.opts.pins[1],
            motor3: this.opts.pins[2]
          };

          if (this.opts.pins.length === 4) {
            result.enable = this.opts.pins[3];
          }
          
          return result;
        } else {
          if (typeof this.opts.pins.motor1 === "undefined" || 
            typeof this.opts.pins.motor2 === "undefined" || 
            typeof this.opts.pins.motor3 === "undefined"
          ) {
            throw new Error(
              "Stepper.DEVICE.THREE_WIRE expects: 'pins.motor1', 'pins.motor2', 'pins.motor3'"
            );
          }
          return this.opts.pins;
        }
      }
    },
    pinsArray: {
      get: function() {
        return [ this.pins.motor1, this.pins.motor2, this.pins.motor3 ];
      }
    },
    steps: {
      value: [   
        [0b100, 0b001, 0b010], // WHOLE
        [0b100, 0b101, 0b001, 0b011, 0b010, 0b110], //HALF
      ]
    }
  },
  TWO_WIRE: {
    pins: {
      get: function() {
        
        if (this.opts.pins.length < 2) {
          throw new Error(
            "Stepper.DEVICE.TWO_WIRE expects 2 pins"
          );
        }
        
        if (Array.isArray(this.opts.pins)) {
          let result = {
            motor1: this.opts.pins[0],
            motor2: this.opts.pins[1]
          };

          if (this.opts.pins.length === 3) {
            result.enable = this.opts.pins[2];
          }
          
          return result;
        } else {
          if (typeof this.opts.pins.motor1 === "undefined" || 
            typeof this.opts.pins.motor2 === "undefined"
          ) {
            throw new Error(
              "Stepper.DEVICE.TWO_WIRE expects: 'pins.motor1', 'pins.motor2'"
            );
          }
          return this.opts.pins;
        }
      }
    },
    pinsArray: {
      get: function() {
        return [ this.pins.motor1, this.pins.motor2 ];
      }
    },
    steps: {
      value: [
        [0b10, 0b11, 0b01, 0b00], // WHOLE
      ]
    }
  },
  DRIVER: {
    pins: {
      get: function() {
        
        if (this.opts.pins.length < 2) {
          throw new Error(
            "Stepper.DEVICE.DRIVER expects 2 pins"
          );
        }
        
        if (Array.isArray(this.opts.pins)) {
          let result = {
            step: this.opts.pins[0],
            dir: this.opts.pins[1]
          };

          if (this.opts.pins.length > 2) {
            result.enable = this.opts.pins[2];
          }

          if (this.opts.pins.length > 3) {
            result.ms1 = this.opts.pins[3];
          }

          if (this.opts.pins.length > 4) {
            result.ms2 = this.opts.pins[4];
          }
          
          return result;
        } else {
          if (typeof this.opts.pins.dir === "undefined" || 
            typeof this.opts.pins.step === "undefined"
          ) {
            throw new Error(
              "Stepper.DEVICE.DRIVER expects: 'pins.dir', 'pins.step'"
            );
          }
          return this.opts.pins;
        }
      }
    },
    sendMove: {
      value: function() {
        this.setPin(this.pins.step, 0x01);
      }
    },
    buildTaskList: {
      value: function(accelTable, decelTable, steps) {
        
        let tasks = [{
          delay: 0,
          task: () => {
            this.setPin(this.pins.step, 0x00);
            this.setPin(this.pins.dir, this.currentDirection);
          }
        }];
        
        let endPulse = {
          delay: 0.1,
          task: () => { 
            this.setPin(this.pins.step, 0x00);
          }
        };
  
        accelTable.forEach((delay) => {
          tasks.push({
            delay: delay - 0.1,
            task: () => { 
              this.currentSpeed = 1000 / delay;
              this.run(); 
            }
          });
          tasks.push(endPulse);
        });
        
        for (let i=0, j = (steps - accelTable.length - decelTable.length); i < j; i++) {
          tasks.push({
            delay: 1000 / this.targetSpeed - 0.1,
            task: () => { 
              this.currentSpeed = this.targetSpeed;
              this.run();
            }
          });
          tasks.push(endPulse);
        }

        decelTable.forEach(delay => {
          tasks.push({
            delay: delay,
            task: () => {
              this.currentSpeed = 1000 / delay - 0.1;
              this.run();
            }
          });
          tasks.push(endPulse);
        });
      
        return tasks;
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

  var device, controller;

  this.MAXSTEPPERS = 4;

  this.queue = null;

  // Necessary to avoid loading temporal unless necessary
  if (!temporal) {
    temporal = require("temporal");
    temporal.resolution(0.1);
  }

  if (!(this instanceof Stepper)) {
    return new Stepper(opts);
  }

  if (Array.isArray(opts)) {
    opts = {
      pins: opts
    };
  }

  Board.Component.call(
    this, this.opts = Board.Options(opts)
  );
  
  controller = opts.controller || null;

  opts.device = opts.device || opts.type;

  // Derive device based on pin parameters
  if (typeof opts.device === "undefined") {
    if (Array.isArray(opts.pins)) {
      if (opts.pins.length === 2) {
        throw new Error(
          "Stepper requires a `device` number value (DRIVER, TWO_WIRE)"
        );
      }
      if (opts.pins.length === 3) {
        opts.device = Stepper.DEVICE.THREE_WIRE;
      }
      if (opts.pins.length > 3) {
        opts.device = Stepper.DEVICE.FOUR_WIRE;
      }
    } else {
      
      if (typeof opts.pins.motor4 !== "undefined") {
        opts.device = Stepper.DEVICE.FOUR_WIRE;
      } else if (typeof opts.pins.motor3 !== "undefined") {
        opts.device = Stepper.DEVICE.THREE_WIRE;
      } else if (typeof opts.pins.motor2 !== "undefined") {
        opts.device = Stepper.DEVICE.TWO_WIRE;
      } else if (typeof opts.pins.dir !== "undefined") {
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
  ["stepType", "units", "direction"].forEach( (option) => {
    if (typeof opts[option] === "string") {
      opts[option] = Stepper[option.toUpperCase()][opts[option]];
    }
  });

  this.units = typeof opts.units !== "undefined" ?
    opts.units : Stepper.UNITS.STEPS;
  
  // If necessary set default property values
  this.stepType = opts.stepType || 0;
  this.acceleration = opts.acceleration || 0;
  this.deceleration = opts.deceleration || 0;
  this.currentSpeed = 0;

  this.absolutePosition = 0;
  this.absoluteTarget = 0;
  this.target = opts.position || 0;
  this.offset = this.target;
  
  
  if (typeof this.acceleration === "number") {
    this.acceleration = { rate: this.acceleration, easing: "linear" };
  }

  if (typeof this.deceleration === "number") {
    this.deceleration = { rate: this.deceleration, easing: "linear" };
  }
  
  this.stepsPerRev = typeof opts.stepsPerRev !== "undefined" ?
    opts.stepsPerRev : 200;
  this.targetSpeed = typeof opts.speed !== "undefined" ?
    opts.speed : 1;
  this.absoluteDirection = typeof opts.direction !== "undefined" ?
    opts.direction : 1;

  this.acceleration.rate = this.normalizeUnits(this.acceleration.rate);
  this.deceleration.rate = this.normalizeUnits(this.deceleration.rate);
    
  // First the device decorates the instance
  Object.defineProperties(this, device);
  
  // Then the controller decorates the instance
  if (opts.controller) {
    controller = typeof opts.controller === "string" ?
      Controllers[opts.controller] : opts.controller;

    Board.Controller.call(this, controller, opts);
  }

  steppers.set(this.board, steppers.get(this.board) || []);
  this.id = steppers.get(this.board).length;

  if (this.id >= this.MAXSTEPPERS) {
    throw new Error(
      "Stepper cannot exceed max steppers (" + this.MAXSTEPPERS + ")"
    );
  }

  steppers.get(this.board).push(this);

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
      RADIANS: 2,
      REVS: 3,
      REVOLUTIONS: 3,
      ROTATIONS: 3
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
      ONETWENTYEIGHTH: 7
    })
  }
});

/*
 * initialize(), setPin() and setPWM() are usually overridden
 * in the controller.
 */
Stepper.prototype.initialize = function() {
  //var state = priv.get(this);

  // Set the pin modes
  ["motor1", "motor2", "motor3", "motor4", "enable", "ms1", "ms2"].forEach((pin, index) => {
    if (this.pins[pin]) {
      // If we are microstepping and this is a motor pin
      if (this.stepType > 1 && index < 4) {
        this.io.pinMode(this.pins[pin], this.io.MODES.PWM);
      } else {
        this.io.pinMode(this.pins[pin], this.io.MODES.OUTPUT);
      }
    }
  }, this);

  this.enable();

};

Stepper.prototype.setPin = function(pin, value, enqueue) {
  this.io.digitalWrite(pin, value, enqueue);
};

/*
 * Set the speed of our stepper
 */
Stepper.prototype.speed = function(value) {
  
  // Methods without params might be getting a value
  if (typeof value === "undefined") {
    return this.targetSpeed;
  } else {
    this.stop(false);
    this.targetSpeed = this.normalizeUnits(value);
    if (this.absolutePosition !== this.absoluteTarget) {
      let plan = this.planSteps();
      this.queue = temporal.queue(plan);
    }
    return this;
  }

};

/*
 * Set/get the rpm of our stepper
 */
Stepper.prototype.rpm = function(value) {
  
  // Methods without params might be getting a value
  if (typeof value === "undefined") {
    return (this.targetSpeed / this.stepsPerRev) * 60 ;
  } else {
    this.targetSpeed = (value / 60) * this.stepsPerRev;
    return this;
  }

};

/*
 * Set the acceleration
 */
Stepper.prototype.accel = function(value) {
  
  // Methods without params might be getting a value
  if (typeof value === "undefined") {
    return this.acceleration;
  }
  if (typeof value === "number") {
    this.acceleration = {
      rate: this.normalizeUnits(value),
      easing: "linear"
    };
  } else {
    this.acceleration = value;
  }
  
  if (this.currentSpeed !== 0) {
    this.stop(false);
    let plan = this.planSteps();
    this.queue = temporal.queue(plan);
  }

  return this;
};

/*
 * Set the deceleration
 */
Stepper.prototype.decel = function(value) {
  
  // Methods without params might be getting a value
  if (typeof value === "undefined") {
    return this.deceleration;
  }
  if (typeof value === "number") {
    this.deceleration = {
      rate: this.normalizeUnits(value),
      easing: "linear"
    };
  } else {
    this.deceleration = value;
  }
  this.stop(false);
  let plan = this.planSteps();
  this.queue = temporal.queue(plan);
  return this;

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
  
  return this.absoluteTarget - this.absolutePosition;

};

/*
 * Set the stepper position
 */
Stepper.prototype.position = function(value) {
  
  // Methods without params might be getting a value
  if (typeof value === "undefined") {
    return this.absolutePosition + this.offset;
  } else {

    this.stop(false);
    let newPosition = this.normalizeUnits(value);
    this.offset = newPosition - this.absolutePosition;
    
    if (this.distanceToGo()) {
      this.absoluteTarget = this.target - this.offset;
    } else {
      this.absoluteTarget = this.absolutePosition;
    }

    let plan = this.planSteps();
    this.queue = temporal.queue(plan);
    return this;
  }

};

/*
 * Step the stepper
 */
Stepper.prototype.step = function(steps, callback) {
  
  if (!this.isEnabled) {
    return false;
  }
  
  if (typeof callback === "function") {
    this.once("moveComplete", callback);
  }
  
  if (steps === 0) {
    this.emit("moveComplete", this.position());
    return;
  }
  
  this.stop(false);
  
  if (this.absoluteDirection) {
    this.target = this.position() + steps;
    this.absoluteTarget = this.absolutePosition + steps;
  } else {
    this.target = this.position() - steps;
    this.absoluteTarget = this.absolutePosition - steps;
  }

  let plan = this.planSteps();
  this.queue = temporal.queue(plan);
};

/*
 * Internal method called by our playloop
 */
Stepper.prototype.run = function() {

  if (!this.isEnabled) {
    return null;
  }
  
  let steps = this.absoluteTarget - this.absolutePosition;

  if (steps > 0) {
    this.absolutePosition++;
  } else {
    this.absolutePosition--;
  }

  this.sendMove();

  if (Math.abs(steps) === 1) {
    this.currentSpeed = 0;
    this.emit("moveComplete", this.position());
  }

};

/*
 * Send move command to pins
 */
Stepper.prototype.sendMove = function() {
  let frameCount = this.steps[this.stepType].length;
  let pinCount = this.pinsArray.length;
  let frame = (this.absolutePosition) % frameCount;
  frame = this.steps[this.stepType][frame + (frame < 0 ? frameCount : 0)];

  this.pinsArray.forEach((pin, index) => {
    this.setPin(pin, (frame >> (pinCount - index - 1) & 0x01), true);
  });

  if (this.io.flushDigitalPorts) {
    this.io.flushDigitalPorts();
  }
};

/*
 * Stop the stepper
 */
Stepper.prototype.stop = function(fullStop, callback) {
  if (typeof fullStop === "undefined") {
    fullStop = true;
  }
  
  if (typeof fullStop === "function") {
    callback = fullStop;
    fullStop = true;
  }
  
  if (fullStop) {
    this.currentSpeed = 0;
    this.removeAllListeners("moveComplete");
  }

  if (this.queue) {
    this.queue.stop();
  }

  if (callback) {
    callback(this.position());
  }
};

/*
 * Move the stepper to a given position
 */
Stepper.prototype.to = function(value, callback) {
  if (!this.isEnabled) {
    return null;
  }

  this.stop(false);
  this.target = this.normalizeUnits(value);
  this.absoluteTarget = this.target - this.offset;

  let plan = this.planSteps();

  if (typeof callback === "function") {
    this.once("moveComplete", callback);
  }
  
  this.queue = temporal.queue(plan);
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
  this.stop(true);
  this.isEnabled = false;
};

/*
 * Set or get the stepper direction
 */
Stepper.prototype.direction = function(dir) {
  // Methods without params might be getting a value
  if (typeof dir === "undefined") {
    return this.absoluteDirection;
  } else {
    this.absoluteDirection = dir;
    return this;
  }
};

/*
 * Set the stepper to ccw direction
 */
Stepper.prototype.ccw = function() {
  this.absoluteDirection = 0;
  return this;
};

/*
 * Set the stepper to cw direction
 */
Stepper.prototype.cw = function() {
  this.absoluteDirection = 1;
  return this;
};

/*
 * Calculate acceleration, deceleration and cruise times for stepper movement
 */
Stepper.prototype.planSteps = function() {
  
  this.currentDirection = Number(this.distanceToGo() > 0);

  let accelTable = this.buildAccelerationTable(this.acceleration.rate, this.acceleration.easing).reverse();
  let decelTable = this.buildAccelerationTable(this.deceleration.rate, this.deceleration.easing, true);
  
  let steps = Math.abs(this.distanceToGo());
  
  while ((accelTable.length + decelTable.length) > steps) {
    if ((accelTable[accelTable.length - 1] < decelTable[0]) || decelTable.length === 0) {
      accelTable.pop();
    } else {
      decelTable.shift();
    }
  }

  let tasks = this.buildTaskList(accelTable, decelTable, steps);

  return tasks;
};

/*
 * Generate list of tasks to execute
 */
Stepper.prototype.buildTaskList = function(accelTable, decelTable, steps) {

  let tasks = [];
  
  accelTable.forEach((delay) => {
    tasks.push({
      delay: delay,
      task: () => { 
        this.currentSpeed = 1000 / delay;
        this.run(); 
      }
    });
  });
  
  for (let i=0, j = (steps - accelTable.length - decelTable.length); i < j; i++) {
    tasks.push({
      delay: 1000 / this.targetSpeed,
      task: () => { 
        this.currentSpeed = this.targetSpeed;
        this.run();
      }
    });
  }

  decelTable.forEach(delay => {
    tasks.push({
      delay: delay,
      task: () => {
        this.currentSpeed = 1000 / delay;
        this.run();
      }
    });
  });
  
  return tasks;
};

/*
 * Builds table of step delays to accelerate/decelerate to targetSpeed
 */
Stepper.prototype.buildAccelerationTable = function(acceleration, easing, stopping) {
  
  // This is where we store our step durations
  let stepsTable = [];
  let beginSpeed = stopping ? 0 : this.currentSpeed;
  let targetSpeed = this.targetSpeed;

  if (acceleration === 0) {
    return stepsTable;
  }
  
  // We start from the end of the acceleration and work backwards
  let endTime = (Math.abs(targetSpeed - beginSpeed) / acceleration) * 1000;
  let currentTime = endTime;

  while (currentTime > 0) {
  
    // How far along are we in the acceleration expressed as a value between zero and one
    let howComplete = fn.fmap(currentTime, 0, endTime, 0, 1);

    // Eased howComplete value
    let easedComplete = ease[easing](howComplete);

    // Calculate the current speed
    let currentSpeed = fn.fmap(easedComplete, 0, 1, beginSpeed, targetSpeed);

    // Duration of next step in ms
    let stepDuration = 1000 / currentSpeed;

    // Add this step to our table of steps
    stepsTable.push(stepDuration);
    
    currentTime -= stepDuration;

  }

  return stepsTable;
};

/*
 * Returns the value in steps
 */
Stepper.prototype.normalizeUnits = function (value) {
  if (typeof this.units === "function") {
    return this.units(value);
  }
  
  switch (this.units) {
    case Stepper.UNITS.DEGREES:
      return Math.round(value * this.stepsPerRev / 360);
    case Stepper.UNITS.RADS:
      return Math.round(value / Math.PI * (this.stepsPerRev / 2));
    case Stepper.UNITS.REVS:
      return Math.round(value * this.stepsPerRev);
    default:
      return Math.round(value);
  }
};


module.exports = Stepper;
