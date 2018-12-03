const five = require("./lib/johnny-five.js");

const board = new five.Board();

board.on("ready", () => {

  // Test as arrays then test as objects
  console.log("Four Wire / Half Step");
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

  console.log("Four Wire / Whole Step");
  let stepper2 = new five.Stepper([7,8,9,10]);

  console.log("Driver / Whole Step");
  let stepper3 = new five.Stepper({
    pins: [12, 13],
    device: five.Stepper.TYPE.DRIVER
  });

  board.repl.inject({
    s1: stepper1,
    s2: stepper2,
    s3: stepper3
  });
});