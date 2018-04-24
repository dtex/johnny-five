const five = require("./lib/johnny-five.js");
const mock = new require("mock-firmata").Firmata;
var io = new mock();


const controller = "firmataAccelStepper"; // {} || "firmataStepper" || "firmataAccelStepper"
let board = new five.Board();
board.on("ready", () => {

//     // Test as arrays then test as objects
//     //console.log("Four Wire / Whole Step");
    let stepper1 = new five.Stepper({
      pins: {
        motorPin1: 8,
        motorPin2: 7,
        motorPin3: 9,
        motorPin4: 10
      },
      //stepType: five.Stepper.STEPTYPE.HALF,
      //acceleration: 100,
      position: 10,
      direction: "CCW",
      units: "RADS",
      stepsPerRev: 24,
      speed: 250
    });
  
//     //console.log("Four Wire / Whole Step");
    let stepper2 = new five.Stepper({
      pins: [2,5,4,3],
      speed: 200
    });
  
//     // console.log("Driver / Whole Step");
//     // let stepper3 = new five.Stepper({
//     //   pins: {
//     //     step: 8,
//     //     dir: 9
//     //   }
//     // });
  
  board.repl.inject({
    s1: stepper1,
    s2: stepper2,
//     //   // s3: stepper3
  });
  
  stepper1.step(200);
  stepper2.step(200);
});

setTimeout(() => { console.log(1);}, 10000);