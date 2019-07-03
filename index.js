var util = require('util');
var inherits = require('util').inherits;  
var EventEmitter = require('events').EventEmitter;

module.exports = Joebear;

function Joebear(jobsArray) {
    if (!(this instanceof Joebear)) return new Joebear(jobsArray);
    this._started = false;
    this._initError = false;
    this._jobsCounter = 0;

    EventEmitter.call(this);
    this._originalJobsArray = Object.assign([], jobsArray);
    this._jobsArray = Object.assign([], this._originalJobsArray);
    
    // check if job array empty or else
    if (!util.isArray(this._jobsArray) || this._jobsArray.length === 0) {
        this._initError = true;
        this.emit('err', 'Joebear init array is empty or not array!');
        return;
    }
}

inherits(Joebear, EventEmitter);

Joebear.prototype.summary = function summary() {
    var self = this;
    var totalTime = (Date.now() - self._started) / 1000;
    var jobsSummary = {
        time: totalTime,
        total: self._originalJobsArray.length,
        dispatched: self._jobsCounter
    };
    return jobsSummary;
}

Joebear.prototype.start = function start() {
    var self = this;

    if (self._initError) {
        this.emit('err', 'Joebear init array is empty or not array!');
        return;
    }

    if (self._started) {
        return;
    }
    self._started = Date.now();
    self._currentJob = self._jobsArray.shift();
    self._jobsCounter++;
    self.emit('run', self._currentJob, self._jobsCounter, self._originalJobsArray);
}

Joebear.prototype.stop = function stop() {
    var self = this;
    var jobsSummary = self.summary();
    self.emit('finished', jobsSummary);
}

Joebear.prototype.nextJob = function nextJob() {
    var self = this;

    if (self._jobsArray.length > 0) {
        self._currentJob = self._jobsArray.shift();
        self._jobsCounter++;
        self.emit('run', self._currentJob, self._jobsCounter, self._originalJobsArray);
    } else {
        var jobsSummary = self.summary();
        self.emit('finished', jobsSummary);
    }
}

// message in the resetJob ONLY for recurring data
Joebear.prototype.resetJob = function resetJob(message) {
    var self = this;
    self.emit('run', self._currentJob, self._jobsCounter, self._originalJobsArray, message);
} 

Joebear.prototype.restart = function restart() {
    var self = this;
    self._jobsArray = Object.assign([],self._originalJobsArray);
    self._jobsCounter = 0;
    self._started = false;
    self.start();
}
