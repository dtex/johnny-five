require("../common/bootstrap");

exports["Stepper - stepsPerRev param"] = {
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

  default200: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      speed: 100,
      units: "REVS"
    });

    test.expect(1);
    
    this.stepper.to(1, position => {
      test.ok(position, 200);
      test.done();
    });
    
  },

  default72: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      speed: 100,
      units: "REVS"
    });

    test.expect(1);
    
    this.stepper.to(1, position => {
      test.ok(position, 72);
      test.done();
    });
    
  }
};

exports["Stepper - speed()"] = {
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
      pins: [2, 3, 4, 5]
    });

    test.expect(3);
    
    let startTime = process.hrtime();
    this.stepper.speed(100).to(10, position => {
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
      pins: [2, 3, 4, 5]
    });

    test.expect(3);
    
    let startTime = process.hrtime();
    this.stepper.speed(200).to(10, position => {
      let endTime = process.hrtime(startTime);
      test.equal(position, 10);
      test.equal(endTime[0], 0);
      test.ok(Math.abs(endTime[1] / 1e6 - 50) < 10);
      test.done();
    });
    
  },

  changeSpeedBetweenMoves: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(6);
    
    let startTime = process.hrtime();
    this.stepper.speed(100).step(10, position => {
      let endTime = process.hrtime(startTime);
      test.equal(position, 10);
      test.equal(endTime[0], 0);
      test.ok(Math.abs(endTime[1] / 1e6 - 100) < 10);
      startTime = process.hrtime();
      this.stepper.speed(200).step(10, position => {
        let endTime = process.hrtime(startTime);
        test.equal(position, 20);
        test.equal(endTime[0], 0);
        test.ok(Math.abs(endTime[1] / 1e6 - 50) < 10);
        test.done();
      });
    });
    
  },

  increaseSpeedDuringMove: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(3);
    
    let startTime = process.hrtime();
    this.stepper.speed(10).step(10, position => {
      let endTime = process.hrtime(startTime);
      test.equal(endTime[0], 1);
      test.ok(Math.abs(endTime[1] / 1e6 - 510) < 10);test.equal(position, 10);
      test.done();
    });
    setTimeout(() => {
      this.stepper.speed(5);
    }, 510);
  },

  increaseSpeedDuringMoveWithAcceleration: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      acceleration: 10
    });

    test.expect(3);
    
    let startTime = process.hrtime();
    this.stepper.speed(10).step(23, position => {
      let endTime = process.hrtime(startTime);
      test.equal(endTime[0], 2);
      test.ok(Math.abs(endTime[1] / 1e6 - 243) < 10);
      test.equal(position, 23);
      test.done();
    });
    setTimeout(() => {
      this.stepper.speed(20);
    }, 900);
  },

  decreaseSpeedDuringMoveWithAcceleration: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      acceleration: 40
    });

    test.expect(3);
    
    let startTime = process.hrtime();
    this.stepper.speed(20).step(12, position => {
      let endTime = process.hrtime(startTime);
        test.equal(endTime[0], 1);
        test.ok(Math.abs(endTime[1] / 1e6 - 130) < 10);
        test.equal(position, 12);
        test.done();
    });
    setTimeout(() => {
      this.stepper.speed(10);
    }, 500);
  },

  decreaseSpeedDuringMoveWithAccelerationAndDeceleration: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5],
      acceleration: 40,
      deceleration: 20
    });

    test.expect(3);
    
    let startTime = process.hrtime();
    this.stepper.speed(20).step(20, position => {
      let endTime = process.hrtime(startTime);
      test.equal(endTime[0], 2);
      test.ok(Math.abs(endTime[1] / 1e6 - 174) < 10);
      test.equal(position, 20);
      test.done();
    });
    setTimeout(() => {
      this.stepper.speed(10);
    }, 800);
  }
};

exports["Stepper - decel()"] = {
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

  decel100: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    let startTime = process.hrtime();
    this.stepper.speed(100).decel(100).to(60, position => {
      let endTime = process.hrtime(startTime);test.equal(position, 60);
      test.equal(this.digitalWrite.callCount, 240);
      test.equal(endTime[0], 1);
      test.ok(Math.abs(endTime[1] / 1e6 - 172) < 10);
      test.done();
    });
    
  },

  decel200: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    let startTime = process.hrtime();
    this.stepper.speed(100).decel(200).to(30, position => {
      let endTime = process.hrtime(startTime);
      test.equal(position, 30);
      test.equal(this.digitalWrite.callCount, 120);
      test.equal(endTime[0], 0);
      test.ok(Math.abs(endTime[1] / 1e6 - 645) < 10);
      test.done();
    });
    
  },

  changeDecelMidMove: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(6);

    let startTime = process.hrtime();
    this.stepper.speed(100).decel(200).to(30, position => {
      let endTime = process.hrtime(startTime);
      test.equal(position, 30);
      test.equal(this.digitalWrite.callCount, 120);
      test.equal(endTime[0], 0);
      test.ok(Math.abs(endTime[1] / 1e6 - 466) < 10);
      test.done();
    });

    setTimeout(() => {
      this.stepper.decel(300);
      test.equal(this.stepper.position(), 2);
      test.equal(this.digitalWrite.callCount, 8);
    }, 22);
    
  },

  changeDecelMidDecel: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(6);

    let startTime = process.hrtime();
    this.stepper.speed(100).decel(200).to(30, position => {
      let endTime = process.hrtime(startTime);
      test.equal(position, 30);
      test.equal(this.digitalWrite.callCount, 120);
      test.equal(endTime[0], 0);
      test.ok(Math.abs(endTime[1] / 1e6 - 466) < 10);
      test.done();
    });

    setTimeout(() => {
      this.stepper.decel(300);
      test.equal(this.stepper.position(), 9);
      test.equal(this.digitalWrite.callCount, 36);
    }, 100);
    
  }

};

exports["Stepper - accel()"] = {
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

  accel100: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);
    
    let startTime = process.hrtime();
    this.stepper.speed(100).accel(100).to(60, position => {
      let endTime = process.hrtime(startTime);
      test.equal(position, 60);
      test.equal(this.digitalWrite.callCount, 240);
      test.equal(endTime[0], 1);
      test.ok(Math.abs(endTime[1] / 1e6 - 172) < 10);
      test.done();
    });
    
  },

  accel200: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    let startTime = process.hrtime();
    this.stepper.speed(100).accel(200).to(30, position => {
      let endTime = process.hrtime(startTime);test.equal(position, 30);
      test.equal(this.digitalWrite.callCount, 120);
      test.equal(endTime[0], 0);
      test.ok(Math.abs(endTime[1] / 1e6 - 645) < 10);
      test.done();
    });
    
  },

  changeAccelMidAccel: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(6);

    let startTime = process.hrtime();
    this.stepper.speed(100).accel(200).to(30, position => {
      let endTime = process.hrtime(startTime);
      test.equal(position, 30);
      test.equal(this.digitalWrite.callCount, 120);
      test.equal(endTime[0], 0);
      test.ok(Math.abs(endTime[1] / 1e6 - 887) < 10);
      test.done();
    });

    setTimeout(() => {
      this.stepper.accel(100);
      test.equal(this.stepper.position(), 1);
      test.equal(this.digitalWrite.callCount, 4);
    }, 200);
    
  }

};

exports["Stepper - position(val)"] = {
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

  setPosition: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    this.stepper.speed(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 120);
      test.equal(position, 30);
      this.stepper.position(10);
      setTimeout(() => {
        test.equal(this.digitalWrite.callCount, 120);
        test.equal(this.stepper.position(), 10);
        test.done();
      }, 300);
    }); 

  },

  SetPositionWhileMoving: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);
    this.stepper.speed(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 320);
      test.equal(position, 30);
      test.done();
    });

    setTimeout(() => {
      test.equal(this.digitalWrite.callCount, 80);
      test.equal(this.stepper.position(), 20);
      this.stepper.position(90);
    }, 205);

  }

};

exports["Stepper - to(val)"] = {
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

  to: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(2);

    this.stepper.speed(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 120);
      test.equal(position, 30);
      test.done();
    });

  },

  changeTargetWhileMoving: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    this.stepper.speed(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 200);
      test.equal(position, 50);
      test.done();
    });

    setTimeout(() => {
      test.equal(this.digitalWrite.callCount, 80);
      test.equal(this.stepper.position(), 20);
      this.stepper.to(50);
    }, 205);

  },

  changeTargetWithAccelWhileMoving: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    this.stepper.accel(1000).speed(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 200);
      test.equal(position, 50);
      test.done();
    });

    setTimeout(() => {
      test.equal(this.digitalWrite.callCount, 64);
      test.equal(this.stepper.position(), 16);
      this.stepper.to(50);
    }, 205);

  },

  changeTargetWithDecelWhileMoving: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    this.stepper.decel(1000).speed(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 200);
      test.equal(position, 50);
      test.done();
    });

    setTimeout(() => {
      test.equal(this.digitalWrite.callCount, 80);
      test.equal(this.stepper.position(), 20);
      this.stepper.to(50);
    }, 205);

  },

  changeTargetWithAccelAndDecelWhileMoving: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    this.stepper.accel(1000).decel(1000).speed(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 200);
      test.equal(position, 50);
      test.done();
    });

    setTimeout(() => {
      test.equal(this.digitalWrite.callCount, 64);
      test.equal(this.stepper.position(), 16);
      this.stepper.to(50);
    }, 205);

  },

  changeTargetWithoutTimeToCompleteAcceleration: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    this.stepper.speed(100).accel(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 72);
      test.equal(position, 18);
      test.done();
    });

    setTimeout(() => {
      test.equal(this.digitalWrite.callCount, 36);
      test.equal(this.stepper.position(), 9);
      this.stepper.to(18);
    }, 490);

  },

  // I'm not certain this is the correct behavior. 
  // It makes sense to me, but it's a weird situation.
  changeTargetWithoutTimeToCompleteDeceleration: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    this.stepper.speed(100).decel(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 112);
      test.equal(position, 28);
      test.done();
    });

    setTimeout(() => {
      test.equal(this.digitalWrite.callCount, 100);
      test.equal(this.stepper.position(), 25);
      this.stepper.to(28);
    }, 490);

  }

};


exports["Stepper - enable()/disable()"] = {
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

  enable: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(6);

    this.stepper.disable();
    test.equal(this.stepper.isEnabled, false);
  
    this.stepper.speed(10).to(5, () => {
      console.log("enable: This should never happen");
    });
    
    setTimeout(() => {
      test.equal(this.digitalWrite.callCount, 0);
      test.equal(this.stepper.position(), 0);
      this.stepper.enable();
      test.equal(this.stepper.isEnabled, true);
      this.stepper.to(5, position => {
        test.equal(this.digitalWrite.callCount, 20);
        test.equal(position, 5);
        test.done();
      });
    }, 700);

  },

  disable: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(5);

    test.equal(this.stepper.isEnabled, true);
  
    this.stepper.speed(10).to(10, () => {
      console.log("disable: This should never happen");
    });
    
    setTimeout(() => {
      this.stepper.disable();
      test.equal(this.digitalWrite.callCount, 20);
      test.equal(this.stepper.position(), 5);
    }, 510);
    
    setTimeout(() => {
      test.equal(this.digitalWrite.callCount, 20);
      test.equal(this.stepper.position(), 5);
      test.done();
    }, 1000);

  }

};