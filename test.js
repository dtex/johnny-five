const five = require("./lib/johnny-five.js");

const board = new five.Board();

board.on("ready", () => {

  // Test as arrays then test as objects
  console.log("Four Wire / Whole Step");
  let stepper1 = new five.Stepper({
    pins: {
      motor1: 2,
      motor2: 5,
      motor3: 3,
      motor4: 4
    },
    stepType: five.Stepper.STEPTYPE.HALF,
    speed: 200
  });
  // console.log(stepper1.stepType,
  //   stepper1.acceleration,
  //   stepper1.position,
  //   stepper1.direction,
  //   stepper1.units,
  //   stepper1.stepsPerRev,
  //   stepper1.speed);

  // console.log("Three Wire / Whole Step");
  // let stepper2 = new five.Stepper([7,8,9,10]);
  // console.log(stepper2.stepType,
  //   stepper2.acceleration,
  //   stepper2.position,
  //   stepper2.direction,
  //   stepper2.units,
  //   stepper2.stepsPerRev,
  //   stepper2.speed);

  // console.log("Driver / Whole Step");
  // let stepper3 = new five.Stepper({
  //   pins: [12, 13],
  //   device: five.Stepper.TYPE.DRIVER
  // });
  // console.log(stepper3.stepType,
  //   stepper3.acceleration,
  //   stepper3.position,
  //   stepper3.direction,
  //   stepper3.units,
  //   stepper3.stepsPerRev,
  //   stepper3.speed);

  board.repl.inject({
    s1: stepper1,
    // s2: stepper2,
    // s3: stepper3
  });
});