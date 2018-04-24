require("./common/bootstrap");

exports["Stepper - constructor"] = { 
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.board = newBoard();
    this.board.pins[0].supportedModes = [8];

    done();
  },
  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },
  inferTypeAmbiguous: function(test) {
    test.expect(1);

    try {
      new Stepper({
        board: this.board,
        stepsPerRev: 200,
        pins: [2, 3]
      });
    } catch (error) {
      test.equals(error.message, "Stepper requires a `device` number value (DRIVER, TWO_WIRE)");
    }

    test.done();
  },

  inferTypeDriver: function(test) {
    test.expect(2);
    var pins = {
      step: 2,
      dir: 3
    };
    var stepper = new Stepper({
      board: this.board,
      stepsPerRev: 200,
      pins: pins
    });
    test.equal(Stepper.DEVICE[stepper.device], Stepper.DEVICE.DRIVER);
    test.deepEqual(stepper.pins, pins);

    test.done();
  },

  inferType2Wire: function(test) {
    test.expect(2);
    var pins = {
      motor1: 3,
      motor2: 4
    };
    var stepper = new Stepper({
      board: this.board,
      stepsPerRev: 200,
      pins: pins
    });
    test.equal(Stepper.DEVICE[stepper.device], Stepper.DEVICE.TWO_WIRE);
    test.deepEqual(stepper.pins, pins);

    test.done();
  },

  inferType4Wire: function(test) {
    test.expect(2);
    var pins = {
      motor1: 2,
      motor2: 3,
      motor3: 4,
      motor4: 5
    };
    var stepper = new Stepper({
      board: this.board,
      stepsPerRev: 200,
      pins: pins
    });
    test.equal(Stepper.DEVICE[stepper.device], Stepper.DEVICE.FOUR_WIRE);
    test.deepEqual(stepper.pins, pins);

    test.done();
  },

  typeDriver: function(test) {
    test.expect(4);
    var pins = {
      step: 2,
      dir: 3
    };
    var stepper = new Stepper({
      board: this.board,
      device: Stepper.DEVICE.DRIVER,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(Stepper.DEVICE[stepper.device], Stepper.DEVICE.DRIVER);
    test.deepEqual(stepper.pins, pins);

    pins = [3, 4];
    stepper = new Stepper({
      board: this.board,
      device: Stepper.DEVICE.DRIVER,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(Stepper.DEVICE[stepper.device], Stepper.DEVICE.DRIVER);
    test.deepEqual(
      stepper.pins, {
        step: pins[0],
        dir: pins[1]
      }
    );

    test.done();
  },

  invalidDriverEmpty: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.DRIVER,
        stepsPerRev: 200,
        pins: {}
      });
    });
    test.done();
  },

  invalidDriverStep: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.DRIVER,
        stepsPerRev: 200,
        pins: {
          dir: 4,
        }
      });
    });
    test.done();
  },

  invalidDriverDir: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.DRIVER,
        stepsPerRev: 200,
        pins: {
          step: 1,
        }
      });
    });
    test.done();
  },

  validDriver: function(test) {
    test.expect(1);
    test.doesNotThrow(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.DRIVER,
        stepsPerRev: 200,
        pins: {
          step: 0,
          dir: 1,
        }
      });
    });
    test.done();
  },

  type2Wire: function(test) {
    test.expect(4);
    var pins = {
      motor1: 2,
      motor2: 3
    };
    var stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.TWO_WIRE,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(Stepper.DEVICE[stepper.device], Stepper.DEVICE.TWO_WIRE);
    test.deepEqual(stepper.pins, pins);

    pins = [3, 4];
    stepper = new Stepper({
      board: this.board,
      device: Stepper.DEVICE.TWO_WIRE,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(Stepper.DEVICE[stepper.device], Stepper.DEVICE.TWO_WIRE);
    test.deepEqual(
      stepper.pins, {
        motor1: pins[0],
        motor2: pins[1]
      }
    );

    test.done();
  },

  invalid2wireEmpty: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.TWO_WIRE,
        stepsPerRev: 200,
        pins: {}
      });
    });
    test.done();
  },

  invalid2wire1: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.TWO_WIRE,
        stepsPerRev: 200,
        pins: {
          motor2: 4,
        }
      });
    });
    test.done();
  },

  invalid2wire2: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.TWO_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 1,
        }
      });
    });
    test.done();
  },

  valid2wire: function(test) {
    test.expect(1);
    test.doesNotThrow(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.TWO_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 0,
          motor2: 1,
        }
      });
    });
    test.done();
  },

  type4Wire: function(test) {
    test.expect(4);
    var pins = {
      motor1: 2,
      motor2: 3,
      motor3: 4,
      motor4: 5
    };
    var stepper = new Stepper({
      board: this.board,
      device: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(Stepper.DEVICE[stepper.device], Stepper.DEVICE.FOUR_WIRE);
    test.deepEqual(stepper.pins, pins);

    pins = [3, 4, 5, 6];
    stepper = new Stepper({
      board: this.board,
      device: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: pins
    });

    test.equal(Stepper.DEVICE[stepper.device], Stepper.DEVICE.FOUR_WIRE);
    test.deepEqual(
      stepper.pins, {
        motor1: pins[0],
        motor2: pins[1],
        motor3: pins[2],
        motor4: pins[3]
      }
    );

    test.done();
  },

  invalid4wireEmpty: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {}
      });
    });
    test.done();
  },

  invalid4wire1: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {
          motor2: 3,
          motor3: 4,
          motor4: 5
        }
      });
    });
    test.done();
  },

  invalid4wire2: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 1,
          motor3: 4,
          motor4: 5
        }
      });
    });
    test.done();
  },

  invalid4wire3: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 3,
          motor2: 4,
          motor4: 5
        }
      });
    });
    test.done();
  },

  invalid4wire4: function(test) {
    test.expect(1);
    test.throws(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 3,
          motor2: 4,
          motor3: 5
        }
      });
    });
    test.done();
  },

  valid4wire: function(test) {
    test.expect(1);
    test.doesNotThrow(function() {
      new Stepper({
        board: this.board,
        device: Stepper.DEVICE.FOUR_WIRE,
        stepsPerRev: 200,
        pins: {
          motor1: 0,
          motor2: 1,
          motor3: 4,
          motor4: 5
        }
      });
    });
    test.done();
  }
};

exports["Stepper - max steppers"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.maxSteppers = 4;

    this.board1 = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.board2 = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore(); 
    done();
  },

  singleBoard: function(test) {
    test.expect(2);

    test.doesNotThrow(function() {
      for (var i = 0; i < this.maxSteppers; i++) {
        new Stepper({
          board: this.board1,
          stepsPerRev: 200,
          pins: [3, 4, 5, 6]
        });
      }
    }.bind(this));

    test.throws(function() {
      new Stepper({
        board: this.board1,
        stepsPerRev: 200,
        pins: [3, 4, 5, 6]
      });
    }.bind(this));

    test.done();
  },

  multipleBoards: function(test) {
    test.expect(3);

    // should be able to add max on two boards
    test.doesNotThrow(function() {
      for (var i = 0; i < this.maxSteppers; i++) {
        new Stepper({
          board: this.board1,
          stepsPerRev: 200,
          pins: [2, 3, 4, 5]
        });
        new Stepper({
          board: this.board2,
          stepsPerRev: 200,
          pins: [2, 3, 4, 5]
        });
      }
    }.bind(this));

    // but can't add any more to either board
    test.throws(function() {
      new Stepper({
        board: this.board1,
        stepsPerRev: 200,
        pins: [2, 3, 4, 5]
      });
    }.bind(this));

    test.throws(function() {
      new Stepper({
        board: this.board2,
        stepsPerRev: 200,
        pins: [2, 3, 4, 5]
      });
    }.bind(this));

    test.done();
  }
};

exports["Stepper - step"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },

  nosteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(1);
    
    this.stepper.step(0, position => {
      test.equal(position, 0);
      test.done();
    });
    
  },
  
  fourwirewhole: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(21);
    
    this.stepper.step(5, position => {
      [
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 5);
      test.done();
    });
    
  },

  fourwirewholeDirection: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100,
      direction: 0
    });

    test.expect(21);
    
    this.stepper.step(5, position => {
      [
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 1
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, -5);
      test.done();
    });
    
  },

  fourwirewholeNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(21);
    
    this.stepper.step(-5, position => {
      [
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 1
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args, "Incorrect args on step " + Math.floor(index / 4));
      });

      test.equal(position, -5);
      test.done();
    });
    
  },

  fourwirewholeDirectionNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100,
      direction: 0
    });

    test.expect(21);
    
    this.stepper.step(-5, position => {
      [
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args, "Incorrect args on step " + Math.floor(index / 4));
      });

      test.equal(position, 5);
      test.done();
    });
    
  },

  fourwirewholeChangeStepsWhileMoving: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100,
      direction: 0
    });

    test.expect(1);

    this.stepper.step(1000);

    setTimeout(() => {
      this.stepper.step(-10, position => {
        test.equal(position, 0);
        test.done();
      });
    }, 100);
  },

  fourwirewholeChangeStepsWithAccelWhileMoving: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100,
      acceleration: 500
    });

    test.expect(1);

    this.stepper.step(1000);

    setTimeout(() => {
      this.stepper.step(-10, position => {
        test.equal(position, -6);
        test.done();
      });
    }, 300);
  },

  fourwirewholePosition: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100,
      position: 1000
    });

    test.expect(22);
    
    this.stepper.step(5, position => {
      [
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 1005);
      test.equal(this.stepper.absolutePosition, 5);
      test.done();
    });
    
  },
  
  fourwirehalf: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepType: Stepper.STEPTYPE.HALF,
      stepsPerRev: 400,
      pins: [2, 3, 4, 5],
      speed: 100
    });
    
    test.expect(37);
    
    this.stepper.step(9, position => {
      [
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 0, true], // Frame 1
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 0, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 3
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 4
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 0, true], // Frame 5
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 6
        [2, 0, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 7
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 0, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 9);
      test.done();
    });
  },

  fourwirehalfDirection: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepType: Stepper.STEPTYPE.HALF,
      stepsPerRev: 400,
      pins: [2, 3, 4, 5],
      speed: 100,
      direction: 0
    });
    
    test.expect(37);
    
    this.stepper.step(9, position => {
      [
        [2, 0, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 7
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 6
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 0, true], // Frame 5
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 4
        [2, 0, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 0, true], // Frame 1
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 7
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args, "Incorrect args on step " + Math.floor(index / 4));
      });

      test.equal(position, -9);
      test.done();
    });
  },

  fourwirehalfNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepType: Stepper.STEPTYPE.HALF,
      stepsPerRev: 400,
      pins: [2, 3, 4, 5],
      speed: 100
    });
    
    test.expect(37);
    
    this.stepper.step(-9, position => {
      [
        [2, 0, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 7
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 6
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 0, true], // Frame 5
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 4
        [2, 0, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 0, true], // Frame 1
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 7
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args, "Incorrect args on step " + Math.floor(index / 4));
      });

      test.equal(position, -9);
      test.done();
    });
  },

  fourwirehalfDirectionNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepType: Stepper.STEPTYPE.HALF,
      stepsPerRev: 400,
      pins: [2, 3, 4, 5],
      speed: 100,
      direction: 0
    });
    
    test.expect(37);
    
    this.stepper.step(-9, position => {
      [
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 0, true], // Frame 1
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 0, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 3
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 4
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 0, true], // Frame 5
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 6
        [2, 0, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 7
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 0, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 9);
      test.done();
    });
  },

  fourwirehalfPosition: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepType: Stepper.STEPTYPE.HALF,
      stepsPerRev: 400,
      pins: [2, 3, 4, 5],
      speed: 100,
      position: 1000
    });
    
    test.expect(38);
    
    this.stepper.step(9, position => {
      [
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 0, true], // Frame 1
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 0, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 3
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 4
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 0, true], // Frame 5
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 6
        [2, 0, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 7
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 0, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 1009);
      test.equal(this.stepper.absolutePosition, 9);
      test.done();
    });
  }
};

exports["Stepper - step three-wire"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },
  
  threewirewhole: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4],
      speed: 100
    });

    test.expect(13);
    
    this.stepper.step(4, position => {
      [
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 1
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 0, true], // Frame 0
        [2, 0, true], [3, 0, true], [4, 1, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 4);
      test.done();
    });
    
  },

  threewirewholeDirection: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4],
      speed: 100,
      direction: 0
    });

    test.expect(13);
    
    this.stepper.step(4, position => {
      [
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 2
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 0, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 2
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, -4);
      test.done();
    });
    
  },

  threewirewholeNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4],
      speed: 100
    });

    test.expect(13);
    
    this.stepper.step(-4, position => {
      [
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 2
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 0, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 2
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args, "Incorrect args on step " + Math.floor(index / 3));
      });

      test.equal(position, -4);
      test.done();
    });
    
  },

  threewirewholeDirectionNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4],
      speed: 100,
      direction: 0
    });

    test.expect(13);
    
    this.stepper.step(-4, position => {
      [
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 1
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 0, true], // Frame 0
        [2, 0, true], [3, 0, true], [4, 1, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args, "Incorrect args on step " + Math.floor(index / 3));
      });

      test.equal(position, 4);
      test.done();
    });
    
  },

  threewirewholePosition: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4],
      speed: 100,
      position: 1000
    });

    test.expect(14);
    
    this.stepper.step(4, position => {
      [
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 0, true], //  Frame 1
        [2, 1, true], [3, 0, true], [4, 0, true], // Frame 2
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 0
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 1004);
      test.equal(this.stepper.absolutePosition, 4);
      test.done();
    });
    
  },
  
  threewirehalf: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepType: Stepper.STEPTYPE.HALF,
      stepsPerRev: 400,
      pins: [2, 3, 4],
      speed: 100
    });
    
    test.expect(22);
    
    this.stepper.step(7, position => {
      [
        [2, 1, true], [3, 0, true], [4, 1, true], // Frame 1
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 2
        [2, 0, true], [3, 1, true], [4, 1, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 4
        [2, 1, true], [3, 1, true], [4, 0, true], // Frame 5
        [2, 1, true], [3, 0, true], [4, 0, true], // Frame 0
        [2, 1, true], [3, 0, true], [4, 1, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 7);
      test.done();
    });
  },

  threewirehalfDirection: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepType: Stepper.STEPTYPE.HALF,
      stepsPerRev: 400,
      pins: [2, 3, 4],
      speed: 100,
      direction: 0
    });
    
    test.expect(22);
    
    this.stepper.step(7, position => {
      [
        [2, 1, true], [3, 1, true], [4, 0, true], // Frame 5
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 4
        [2, 0, true], [3, 1, true], [4, 1, true], // Frame 3
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 1, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 0, true], // Frame 0
        [2, 1, true], [3, 1, true], [4, 0, true], // Frame 5
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args, "Incorrect args on step " + Math.floor(index / 3));
      });

      test.equal(position, -7);
      test.done();
    });
  },

  threewirehalfNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepType: Stepper.STEPTYPE.HALF,
      stepsPerRev: 400,
      pins: [2, 3, 4],
      speed: 100
    });
    
    test.expect(22);
    
    this.stepper.step(-7, position => {
      [
        [2, 1, true], [3, 1, true], [4, 0, true], // Frame 5
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 4
        [2, 0, true], [3, 1, true], [4, 1, true], // Frame 3
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 1, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 0, true], // Frame 0
        [2, 1, true], [3, 1, true], [4, 0, true], // Frame 5
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args, "Incorrect args on step " + Math.floor(index / 3));
      });

      test.equal(position, -7);
      test.done();
    });
  },

  threewirehalfDirectionNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepType: Stepper.STEPTYPE.HALF,
      stepsPerRev: 400,
      pins: [2, 3, 4],
      speed: 100,
      direction: 0
    });
    
    test.expect(22);
    
    this.stepper.step(-7, position => {
      [
        [2, 1, true], [3, 0, true], [4, 1, true], // Frame 1
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 2
        [2, 0, true], [3, 1, true], [4, 1, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 4
        [2, 1, true], [3, 1, true], [4, 0, true], // Frame 5
        [2, 1, true], [3, 0, true], [4, 0, true], // Frame 0
        [2, 1, true], [3, 0, true], [4, 1, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 7);
      test.done();
    });
  },

  threewirehalfPosition: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepType: Stepper.STEPTYPE.HALF,
      stepsPerRev: 400,
      pins: [2, 3, 4],
      speed: 100,
      position: 1000
    });
    
    test.expect(23);
    
    this.stepper.step(7, position => {
      [
        [2, 1, true], [3, 0, true], [4, 1, true], // Frame 1
        [2, 0, true], [3, 0, true], [4, 1, true], // Frame 2
        [2, 0, true], [3, 1, true], [4, 1, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 0, true], // Frame 4
        [2, 1, true], [3, 1, true], [4, 0, true], // Frame 5
        [2, 1, true], [3, 0, true], [4, 0, true], // Frame 0
        [2, 1, true], [3, 0, true], [4, 1, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 1007);
      test.equal(this.stepper.absolutePosition, 7);
      test.done();
    });
  }
};

exports["Stepper - units param"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },

  degrees: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      speed: 100,
      units: "DEGREES"
    });

    test.expect(21);
    
    this.stepper.to(9, position => {
      [
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 5);
      test.done();
    });
    
  },

  rads: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      speed: 100,
      units: "RADS"
    });

    test.expect(21);
    
    this.stepper.to(0.15707, position => {
      [
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 5);
      test.done();
    });
    
  },

  revs: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      speed: 100,
      units: "REVS"
    });

    test.expect(21);
    
    this.stepper.to(0.025, position => {
      [
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 5);
      test.done();
    });
    
  },

  customUnits: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      speed: 100,
      units: function(value) {
        // This imaginary mechanical assembly moves a platform 
        // 2 inches for every full rotation of the stepper.
        // This allows speed, position, to, acceleration, and
        // deceleration to receive inch values in their arguments
        return value * 200 / 2;
      }
    });

    test.expect(21);
    
    this.stepper.to(0.05, position => {
      [
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true], // Frame 1
        [2, 1, true], [3, 0, true], [4, 1, true], [5, 0, true], // Frame 2
        [2, 1, true], [3, 0, true], [4, 0, true], [5, 1, true], // Frame 3
        [2, 0, true], [3, 1, true], [4, 0, true], [5, 1, true], // Frame 0
        [2, 0, true], [3, 1, true], [4, 1, true], [5, 0, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 5);
      test.done();
    });
    
  }
};

exports["Stepper - speed param"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },

  speed100: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(3);
    
    let startTime = process.hrtime();
    this.stepper.to(10, position => {
      let endTime = process.hrtime(startTime);
      test.equal(position, 10);
      test.equal(endTime[0], 0);
      test.ok(Math.abs(endTime[1] / 1e6 - 100) < 10);
      test.done();
    });
    
  },

  speed200: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      speed: 200
    });

    test.expect(3);
    
    let startTime = process.hrtime();
    this.stepper.to(10, position => {
      let endTime = process.hrtime(startTime);
      test.equal(position, 10);
      test.equal(endTime[0], 0);
      test.ok(Math.abs(endTime[1] / 1e6 - 50) < 10);
      test.done();
    });
    
  }
};

exports["Stepper - acceleration param"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },

  default: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    test.equal(this.stepper.accel().rate, 0);
    test.equal(this.stepper.decel().rate, 0);
    test.done();
    
  },

  linear100: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      speed: 100,
      acceleration: 100,
      deceleration: 100
    });

    test.expect(2);
    test.equal(this.stepper.accel().rate, 100);
    test.equal(this.stepper.decel().rate, 100);
    test.done();
    
  }
};

exports["Stepper - stop()"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },

  stop: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(2);
    this.stepper.speed(100).to(100);
    
    setTimeout(() => {
      this.stepper.stop(position => {
        test.equal(position, 9);
        test.equal(this.stepper.currentSpeed, 0);
        test.done();
      });
    }, 95);
    
  }
};

exports["Stepper - zero()"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    this.digitalWrite.restore();
    done();
  },

  zeroWhileMoving: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(7);

    this.stepper.speed(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 200);
      test.equal(position, 30);
      test.done();
    });

    setTimeout(() => {
      test.equal(this.stepper.position(), 20);
      test.equal(this.stepper.absolutePosition, 20);
      test.equal(this.digitalWrite.callCount, 80);
      this.stepper.zero();
      test.equal(this.stepper.position(), 0);
      test.equal(this.stepper.absolutePosition, 20);
    }, 205);

  }

};

exports["Stepper - direction()"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },

  directionCW: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    
    this.stepper.direction(1).step(5, position => {
      test.equal(position, 5);
      test.equal(this.stepper.direction(), 1);
      test.done();
    });
    
  },

  directionCWNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    
    this.stepper.direction(1).step(-5, position => {
      test.equal(position, -5);
      test.equal(this.stepper.direction(), 1);
      test.done();
    });
    
  },

  directionCCW: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    
    this.stepper.direction(0).step(5, position => {
      test.equal(position, -5);
      test.equal(this.stepper.direction(), 0);
      test.done();
    });
    
  },

  directionCCWNegative: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    
    this.stepper.direction(0).step(-5, position => {
      test.equal(position, 5);
      test.equal(this.stepper.direction(), 0);
      test.done();
    });
    
  }
};

exports["Stepper - CW()/CCW()"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },

  CW: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    
    this.stepper.cw().step(5, position => {
      test.equal(position, 5);
      test.equal(this.stepper.direction(), 1);
      test.done();
    });
    
  },

  CWNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    
    this.stepper.cw().step(-5, position => {
      test.equal(position, -5);
      test.equal(this.stepper.direction(), 1);
      test.done();
    });
    
  },

  CCW: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    
    this.stepper.ccw().step(5, position => {
      test.equal(position, -5);
      test.equal(this.stepper.direction(), 0);
      test.done();
    });
    
  },

  CCWNegative: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    
    this.stepper.ccw().step(-5, position => {
      test.equal(position, 5);
      test.equal(this.stepper.direction(), 0);
      test.done();
    });
    
  }
};

exports["rpm()"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },

  rpm: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    
    this.stepper.rpm(180);
    test.equal(this.stepper.targetSpeed, 600);

    this.stepper.speed(100);
    test.equal(this.stepper.rpm(), 30);

    test.done();
    
  }
};

exports["position()"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },

  position: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(3);
    
    this.stepper.position(1234);
    test.equal(this.stepper.position(), 1234);
    test.equal(this.stepper.absolutePosition, 0);

    this.stepper.speed(100).step(-5, () => {
      test.equal(this.stepper.position(), 1229);
      test.done();
    });

  },

  negativePosition: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(2);
    
    this.stepper.position(-1234);
    test.equal(this.stepper.position(), -1234);

    this.stepper.speed(100).step(-5, () => {
      test.equal(this.stepper.position(), -1239);
      test.done();
    });

  }
};

exports["distanceToGo()"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },

  rpm: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5],
      speed: 100
    });

    test.expect(6);
    
    this.stepper.speed(10).to(10, position => {
      test.equal(position, 10);
      test.equal(this.stepper.distanceToGo(), 0);
      test.done();
    });

    setTimeout( () => {
      test.equal(this.stepper.position(), 2);
      test.equal(this.stepper.distanceToGo(), 8);
    }, 250);

    setTimeout( () => {
      test.equal(this.stepper.position(), 7);
      test.equal(this.stepper.distanceToGo(), 3);
    }, 750);
  }
};

exports["Stepper - step two-wire"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8]
        }]
      }),
      debug: false,
      repl: false
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    done();
    this.digitalWrite.restore();
  },
  
  twowirewhole: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.TWO_WIRE,
      stepsPerRev: 200,
      pins: [2, 3],
      speed: 100
    });

    test.expect(11);
    
    this.stepper.step(5, position => {
      [
        [2, 1, true], [3, 1, true], // Frame 1
        [2, 0, true], [3, 1, true], // Frame 2
        [2, 0, true], [3, 0, true], // Frame 3
        [2, 1, true], [3, 0, true], // Frame 0
        [2, 1, true], [3, 1, true] //  Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 5);
      test.done();
    });
    
  },

  twowirewholeDirection: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.TWO_WIRE,
      stepsPerRev: 200,
      pins: [2, 3],
      speed: 100,
      direction: 0
    });

    test.expect(11);
    
    this.stepper.step(5, position => {
      [
        [2, 0, true], [3, 0, true], // Frame 3
        [2, 0, true], [3, 1, true], // Frame 2
        [2, 1, true], [3, 1, true], // Frame 1
        [2, 1, true], [3, 0, true], // Frame 0
        [2, 0, true], [3, 0, true], // Frame 3
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, -5);
      test.done();
    });
    
  },

  twowirewholeNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.TWO_WIRE,
      stepsPerRev: 200,
      pins: [2, 3],
      speed: 100
    });

    test.expect(11);
    
    this.stepper.step(-5, position => {
      [
        [2, 0, true], [3, 0, true], // Frame 3
        [2, 0, true], [3, 1, true], // Frame 2
        [2, 1, true], [3, 1, true], // Frame 1
        [2, 1, true], [3, 0, true], // Frame 0
        [2, 0, true], [3, 0, true], // Frame 3
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args, "Incorrect args on step " + Math.floor(index / 2));
      });

      test.equal(position, -5);
      test.done();
    });
    
  },

  twowirewholeDirectionNegativeSteps: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.TWO_WIRE,
      stepsPerRev: 200,
      pins: [2, 3],
      speed: 100,
      direction: 0
    });

    test.expect(11);
    
    this.stepper.step(-5, position => {
      [
        [2, 1, true], [3, 1, true], // Frame 1
        [2, 0, true], [3, 1, true], // Frame 2
        [2, 0, true], [3, 0, true], // Frame 3
        [2, 1, true], [3, 0, true], // Frame 0
        [2, 1, true], [3, 1, true], // Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args, "Incorrect args on step " + Math.floor(index / 2));
      });

      test.equal(position, 5);
      test.done();
    });
    
  },

  twowirewholePosition: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.TWO_WIRE,
      stepsPerRev: 200,
      pins: [2, 3],
      speed: 100,
      position: 1000
    });

    test.expect(11);
    
    this.stepper.step(5, position => {
      [
        [2, 1, true], [3, 1, true], // Frame 1
        [2, 0, true], [3, 1, true], // Frame 2
        [2, 0, true], [3, 0, true], // Frame 3
        [2, 1, true], [3, 0, true], // Frame 0
        [2, 1, true], [3, 1, true], // Frame 1
      ].forEach((args, index) => {
        test.deepEqual(this.digitalWrite.getCall(index).args, args);
      });

      test.equal(position, 1005);
      test.done();
    });
    
  }
 
};


