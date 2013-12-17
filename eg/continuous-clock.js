var five = require("../lib/johnny-five.js"),
  board, servo;

board = new five.Board();

board.on("ready", function() {

  [
    [91, "ccw"],
    [89, "cw"]

  ].forEach(function(def) {
    five.Servo.prototype[def[1]] = function() {
      this.to(def[0]);
    };
  });


  // Create a new `servo` hardware instance.
  servo = new five.Servo({
    pin: 9,
    // `type` defaults to standard servo.
    // For continuous rotation servos, override the default
    // by setting the `type` here
    type: "continuous"
  });

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servo: servo
  });

  // Continuous Rotation Servo API

  // move( speed )
  // Set the speed at which the continuous rotation
  // servo will rotate at.
  servo.to(90);

});
