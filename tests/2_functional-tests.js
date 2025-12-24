const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

chai.use(chaiHttp);

suite('Functional Tests', () => {

  test('Solve a puzzle with valid puzzle string: POST /api/solve', (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    const solution = puzzlesAndSolutions[0][1];
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { solution });
        done();
      });
  });

  test('Solve a puzzle with missing puzzle string: POST /api/solve', (done) => {
    chai.request(server)
      .post('/api/solve')
      .send({})
      .end((err, res) => {
        assert.equal(res.body.error, 'Required field missing');
        done();
      });
  });

  test('Solve a puzzle with invalid characters: POST /api/solve', (done) => {
    const puzzle = puzzlesAndSolutions[0][0].replace('.', '@');
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.equal(res.body.error, 'Invalid characters in puzzle');
        done();
      });
  });

  test('Solve a puzzle with incorrect length: POST /api/solve', (done) => {
    const puzzle = puzzlesAndSolutions[0][0].slice(0, 80);
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  test('Solve a puzzle that cannot be solved: POST /api/solve', (done) => {
    const puzzle = puzzlesAndSolutions[0][0].replace('.', '1'); // introduce a duplicate in the row
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.equal(res.body.error, 'Puzzle cannot be solved');
        done();
      });
  });

  test('Check a puzzle placement with all fields: POST /api/check', (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A2', value: '3' })
      .end((err, res) => {
        assert.property(res.body, 'valid');
        assert.isTrue(res.body.valid);
        done();
      });
  });

  test('Check a puzzle placement with single placement conflict: POST /api/check', (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A2', value: '4' }) // row conflict only
      .end((err, res) => {
        assert.isFalse(res.body.valid);
        assert.deepEqual(res.body.conflict, ['row']);
        done();
      });
  });

  test('Check a puzzle placement with multiple placement conflicts: POST /api/check', (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A2', value: '5' }) // row + region
      .end((err, res) => {
        assert.isFalse(res.body.valid);
        assert.includeMembers(res.body.conflict, ['row', 'region']);
        done();
      });
  });

  test('Check a puzzle placement with all placement conflicts: POST /api/check', (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A2', value: '2' }) // row + column + region
      .end((err, res) => {
        assert.isFalse(res.body.valid);
        assert.includeMembers(res.body.conflict, ['row', 'column', 'region']);
        done();
      });
  });

  test('Check a puzzle placement with missing required fields: POST /api/check', (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, value: '2' })
      .end((err, res) => {
        assert.equal(res.body.error, 'Required field(s) missing');
        done();
      });
  });

  test('Check a puzzle placement with invalid characters: POST /api/check', (done) => {
    const puzzle = puzzlesAndSolutions[0][0].replace('.', 'x');
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: '2' })
      .end((err, res) => {
        assert.equal(res.body.error, 'Invalid characters in puzzle');
        done();
      });
  });

  test('Check a puzzle placement with incorrect length: POST /api/check', (done) => {
    const puzzle = puzzlesAndSolutions[0][0].slice(0, 80);
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: '2' })
      .end((err, res) => {
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  test('Check a puzzle placement with invalid placement coordinate: POST /api/check', (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'Z9', value: '2' })
      .end((err, res) => {
        assert.equal(res.body.error, 'Invalid coordinate');
        done();
      });
  });

  test('Check a puzzle placement with invalid placement value: POST /api/check', (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: '0' })
      .end((err, res) => {
        assert.equal(res.body.error, 'Invalid value');
        done();
      });
  });
});

