require("./common/bootstrap");

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

      let startTime = process.hrtime();
      console.log("2");
      this.stepper.speed(100).to(30, position => {
        console.log(1);
        test.equal(this.digitalWrite.callCount, 120);
        test.equal(position, 30);
        this.stepper.position(10);
        test.equal(this.digitalWrite.callCount, 120);
        test.equal(position, 10);
        test.done();
      });

    },

  SetPositionWhileMoving: function(test) {
    this.stepper = new Stepper({
      board: this.board,
      pins: [2, 3, 4, 5]
    });

    test.expect(4);

    let startTime = process.hrtime();
    console.log("H");
    this.stepper.speed(100).to(30, position => {
      test.equal(this.digitalWrite.callCount, 120);
      test.equal(this.stepper.position(), 100)
      test.done();
    });

    setTimeout(() => {
      console.log("D");
      test.equal(this.digitalWrite.callCount, 80);
      console.log("E");
      test.equal(this.stepper.position(), 20);
      console.log("F");
      this.stepper.position(90);
      console.log("G");
    }, 205);

  }

};

