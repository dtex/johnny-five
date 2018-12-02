var five = require("../lib/johnny-five");
var board = new five.Board();
var Stepper = five.Stepper;

board.on("ready", function() {
  /**
   * In order to use the Stepper class, your board must be flashed with
   * either of the following:
   *
   * - AdvancedFirmata https://github.com/soundanalogous/AdvancedFirmata
   * - ConfigurableFirmata https://github.com/firmata/arduino/releases/tag/v2.6.2
   *
   */

  var stepper = new Stepper({
    type: Stepper.TYPE.FOUR_WIRE,
    pins: {
      motor1: 7,
      motor2: 8,
      motor3: 9,
      motor4: 10
    },
    speed: 400,
    accel: {
      rate: 100,
      easing: "inSine"
    },
    decel: {
      rate: 200,
      easing: "outSine"
    }
  });

  var stepper2 = new Stepper({
    type: Stepper.TYPE.FOUR_WIRE,
    stepType: Stepper.STEPTYPE.HALF,
    stepsPerRev: 400,
    pins: {
      motor1: 2,
      motor2: 5,
      motor3: 3,
      motor4: 4
    },
    speed: 400
  });

  stepper.accel({
    rate: 400,
    easing: "inSine"
  }).decel({
    rate: 400,
    easing: "outSine"
  });

  stepper2.accel({
    rate: 400,
    easing: "inSine"
  }).decel({
    rate: 400,
    easing: "outSine"
  });

  this.repl.inject({
    s1: stepper,
    s2: stepper2
  });

  // // make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
  // stepper.rpm(180).direction(Stepper.DIRECTION.CCW).accel(1600).decel(1600).step(2000, function() {
  //   console.log("done moving CCW");

  //   // once first movement is done, make 10 revolutions clockwise at previously
  //   //      defined speed, accel, and decel by passing an object into stepper.step
  //   stepper.step({
  //     steps: 2000,
  //     direction: Stepper.DIRECTION.CW
  //   }, function() {
  //     console.log("done moving CW");
  //   });
  // });
});
