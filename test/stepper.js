require("./common/bootstrap");

// exports["Stepper Firmware Requirement"] = {
//   setUp: function(done) {
//     this.sandbox = sinon.sandbox.create();
//     done();
//   },
//   tearDown: function(done) {
//     Board.purge();
//     this.sandbox.restore();
//     done();
//   },
  
//   valid: function(test) {
//     test.expect(1);

//     this.board = newBoard([{
//       supportedModes: [],
//     }, {
//       supportedModes: [],
//     }, {
//       supportedModes: [0, 1, 4, 8],
//     }, {
//       supportedModes: [0, 1, 3, 4, 8],
//     }]);

//     test.doesNotThrow(function() {
//       new Stepper({
//         board: this.board,
//         type: Stepper.TYPE.DRIVER,
//         stepsPerRev: 200,
//         pins: [2, 3],
//         controller: "firmataAccelStepper"
//       });
//     }.bind(this));

//     test.done();
//   },

//   invalid: function(test) {
//     test.expect(1);

//     this.board = newBoard([{
//       supportedModes: [],
//     }, {
//       supportedModes: [],
//     }, {
//       supportedModes: [0, 1, 4],
//     }, {
//       supportedModes: [0, 1, 3, 4],
//     }]);

//     // try {
//       new Stepper({
//         board: this.board,
//         type: Stepper.TYPE.DRIVER,
//         stepsPerRev: 200,
//         pins: [2, 3],
//         controller: "firmataAccelStepper"
//       });
//     // } catch (error) {
//     //   test.equals(error.message, "Stepper is not supported");
//     // }

//     test.done();
//   },
// };

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

exports["Stepper - Single Port Check"] = {
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

    done();
  },

  tearDown: function(done) {
    done();
  },

  FOUR_WIRE_SINGLEPORT: function(test) {
    
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5]
    });
    var spy = this.sandbox.spy();

    test.expect(1);
    test.equal(this.stepper.singlePort(), true);
    test.done();
  },
  
  FOUR_WIRE_MULTIPORT: function(test) {
    
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 9]
    });
    var spy = this.sandbox.spy();

    test.expect(1);
    test.equal(this.stepper.singlePort(), false);
    test.done();
  },
  
  THREE_WIRE_SINGLEPORT: function(test) {
    
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4]
    });
    var spy = this.sandbox.spy();

    test.expect(1);
    test.equal(this.stepper.singlePort(), true);
    test.done();
  },
  
  THREE_WIRE_MULTIPORT: function(test) {
    
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.THREE_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 9]
    });
    var spy = this.sandbox.spy();

    test.expect(1);
    test.equal(this.stepper.singlePort(), false);
    test.done();
  },
  
  TWO_WIRE_SINGLEPORT: function(test) {
    
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.TWO_WIRE,
      stepsPerRev: 200,
      pins: [2, 3]
    });
    var spy = this.sandbox.spy();

    test.expect(1);
    test.equal(this.stepper.singlePort(), true);
    test.done();
  },
  
  TWO_WIRE_MULTIPORT: function(test) {
    
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.TWO_WIRE,
      stepsPerRev: 200,
      pins: [2, 9]
    });
    var spy = this.sandbox.spy();

    test.expect(1);
    test.equal(this.stepper.singlePort(), false);
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

  fourwirewhole: function(test) {
    var spy = this.sandbox.spy();

    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.DEVICE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5]
    });
    
    test.expect(21);

    for (let i=0; i<5; i++) {
      this.stepper.step(1, spy);
    }
    
    test.deepEqual(this.digitalWrite.getCall(0).args, [2, 0]);
    test.deepEqual(this.digitalWrite.getCall(1).args, [3, 1]);
    test.deepEqual(this.digitalWrite.getCall(2).args, [4, 1]);
    test.deepEqual(this.digitalWrite.getCall(3).args, [5, 0]);

    test.deepEqual(this.digitalWrite.getCall(4).args, [2, 1]);
    test.deepEqual(this.digitalWrite.getCall(5).args, [3, 0]);
    test.deepEqual(this.digitalWrite.getCall(6).args, [4, 1]);
    test.deepEqual(this.digitalWrite.getCall(7).args, [5, 0]);

    test.deepEqual(this.digitalWrite.getCall(8).args, [2, 1]);
    test.deepEqual(this.digitalWrite.getCall(9).args, [3, 0]);
    test.deepEqual(this.digitalWrite.getCall(10).args, [4, 0]);
    test.deepEqual(this.digitalWrite.getCall(11).args, [5, 1]);

    test.deepEqual(this.digitalWrite.getCall(12).args, [2, 0]);
    test.deepEqual(this.digitalWrite.getCall(13).args, [3, 1]);
    test.deepEqual(this.digitalWrite.getCall(14).args, [4, 0]);
    test.deepEqual(this.digitalWrite.getCall(15).args, [5, 1]);

    test.deepEqual(this.digitalWrite.getCall(16).args, [2, 0]);
    test.deepEqual(this.digitalWrite.getCall(17).args, [3, 1]);
    test.deepEqual(this.digitalWrite.getCall(18).args, [4, 1]);
    test.deepEqual(this.digitalWrite.getCall(19).args, [5, 0]);


    test.equal(spy.callCount, 5);
    test.done();
  },
  
  // threewirewhole: function(test) {
  //   var spy = this.sandbox.spy();

  //   this.stepper = new Stepper({
  //     board: this.board,
  //     type: Stepper.DEVICE.THREE_WIRE,
  //     stepsPerRev: 200,
  //     pins: [2, 3, 4]
  //   });
    
  //   test.expect(13);

  //   for (let i=0; i<4; i++) {
  //     this.stepper.step(1, spy);
  //   }
    
  //   test.deepEqual(this.digitalWrite.getCall(0).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(1).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(2).args, [4, 1]);

  //   test.deepEqual(this.digitalWrite.getCall(3).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(4).args, [3, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(5).args, [4, 0]);

  //   test.deepEqual(this.digitalWrite.getCall(6).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(7).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(8).args, [4, 0]);

  //   test.deepEqual(this.digitalWrite.getCall(9).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(10).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(11).args, [4, 1]);

  //   test.equal(spy.callCount, 4);
  //   test.done();
  // },
  
  // twowirewhole: function(test) {
  //   var spy = this.sandbox.spy();

  //   this.stepper = new Stepper({
  //     board: this.board,
  //     type: Stepper.DEVICE.TWO_WIRE,
  //     stepsPerRev: 200,
  //     pins: [2, 3]
  //   });
    
  //   test.expect(11);

  //   for (let i=0; i<5; i++) {
  //     this.stepper.step(1, spy);
  //   }
    
  //   test.deepEqual(this.digitalWrite.getCall(0).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(1).args, [3, 1]);

  //   test.deepEqual(this.digitalWrite.getCall(2).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(3).args, [3, 1]);

  //   test.deepEqual(this.digitalWrite.getCall(4).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(5).args, [3, 0]);

  //   test.deepEqual(this.digitalWrite.getCall(6).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(7).args, [3, 0]);
    
  //   test.deepEqual(this.digitalWrite.getCall(8).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(9).args, [3, 1]);

  //   test.equal(spy.callCount, 5);
  //   test.done();
  // },
  
  // fourwirehalf: function(test) {
  //   var spy = this.sandbox.spy();

  //   this.stepper = new Stepper({
  //     board: this.board,
  //     type: Stepper.DEVICE.FOUR_WIRE,
  //     stepType: Stepper.STEPTYPE.HALF,
  //     stepsPerRev: 200,
  //     pins: [2, 3, 4, 5]
  //   });
    
  //   test.expect(37);

  //   for (let i=0; i<9; i++) {
  //     this.stepper.step(1, spy);
  //   }
    
  //   test.deepEqual(this.digitalWrite.getCall(0).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(1).args, [3, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(2).args, [4, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(3).args, [5, 0]);

  //   test.deepEqual(this.digitalWrite.getCall(4).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(5).args, [3, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(6).args, [4, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(7).args, [5, 0]);

  //   test.deepEqual(this.digitalWrite.getCall(8).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(9).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(10).args, [4, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(11).args, [5, 0]);

  //   test.deepEqual(this.digitalWrite.getCall(12).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(13).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(14).args, [4, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(15).args, [5, 0]);

  //   test.deepEqual(this.digitalWrite.getCall(16).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(17).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(18).args, [4, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(19).args, [5, 0]);
    
  //   test.deepEqual(this.digitalWrite.getCall(20).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(21).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(22).args, [4, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(23).args, [5, 1]);

  //   test.deepEqual(this.digitalWrite.getCall(24).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(25).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(26).args, [4, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(27).args, [5, 1]);

  //   test.deepEqual(this.digitalWrite.getCall(28).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(29).args, [3, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(30).args, [4, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(31).args, [5, 1]);

  //   test.deepEqual(this.digitalWrite.getCall(32).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(33).args, [3, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(34).args, [4, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(35).args, [5, 0]);

  //   test.equal(spy.callCount, 9);
  //   test.done();
  // },
  
  // threewirehalf: function(test) {
  //   var spy = this.sandbox.spy();

  //   this.stepper = new Stepper({
  //     board: this.board,
  //     type: Stepper.DEVICE.THREE_WIRE,
  //     stepType: Stepper.STEPTYPE.HALF,
  //     stepsPerRev: 200,
  //     pins: [2, 3, 4]
  //   });
    
  //   test.expect(22);

  //   for (let i=0; i<7; i++) {
  //     this.stepper.step(1, spy);
  //   }
    
  //   test.deepEqual(this.digitalWrite.getCall(0).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(1).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(2).args, [4, 1]);

  //   test.deepEqual(this.digitalWrite.getCall(3).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(4).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(5).args, [4, 1]);

  //   test.deepEqual(this.digitalWrite.getCall(6).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(7).args, [3, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(8).args, [4, 1]);

  //   test.deepEqual(this.digitalWrite.getCall(9).args, [2, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(10).args, [3, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(11).args, [4, 0]);
    
  //   test.deepEqual(this.digitalWrite.getCall(12).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(13).args, [3, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(14).args, [4, 0]);
    
  //   test.deepEqual(this.digitalWrite.getCall(15).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(16).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(17).args, [4, 0]);
    
  //   test.deepEqual(this.digitalWrite.getCall(18).args, [2, 1]);
  //   test.deepEqual(this.digitalWrite.getCall(19).args, [3, 0]);
  //   test.deepEqual(this.digitalWrite.getCall(20).args, [4, 1]);

  //   test.equal(spy.callCount, 7);
  //   test.done();
  // }
};

exports["Stepper - chainable direction"] = {
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

    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.TYPE.DRIVER,
      stepsPerRev: 200,
      pins: [2, 3]
    });

    done();
  },

  tearDown: function(done) {
    done();
  },

  chainable: function(test) {
    test.expect(2);

    // .cw() and .ccw() return `this`
    test.equal(this.stepper.cw(), this.stepper);
    test.equal(this.stepper.ccw(), this.stepper);

    test.done();
  }
};

exports["Stepper - rpm / speed"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.board = new Board({
      io: new MockFirmata({
        pins: [{
          supportedModes: [8],
        }, ]
      }),
      debug: false,
      repl: false
    });

    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");
    this.stepper = new Stepper({
      board: this.board,
      type: Stepper.TYPE.FOUR_WIRE,
      stepsPerRev: 200,
      pins: [2, 3, 4, 5]
    });
    done();
  },

  tearDown: function(done) {
    this.pinMode.restore();
    done();
  },

  pinMode: function(test) {
    test.expect(1);
    test.equal(this.pinMode.callCount, 4);
    test.done();
  },

  "rpm to speed": function(test) {
    test.expect(1);
    this.stepper.rpm(180);
    test.equal(this.stepper.speed(), 600);
    test.done();
  },

  "speed to rpm": function(test) {
    test.expect(1);
    this.stepper.speed(600);
    test.equal(this.stepper.rpm(), 180);
    test.done();
  }
};
