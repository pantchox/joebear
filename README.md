<div align="center"><img src="joebear.png" height="96"></div>
<div align="center">Joebear</div>

## Joebear is a cute small serial queue job manager
Joebear receives an array of elements (any) and will let you process each element to which ever task is needed.

Joebear can
* Manage your jobs as a serial queue
* Call the next job in queue, when current is complete
* Reset current job in queue in case of an error
* Stop in any given time
* Follow current job in queue
* Give a cute summary when finished 🐻

## Usage
Install `npm install --save joebear`
Examples source available in the examples directory.

### Simple

```js
/* Joebear simple example */
const Joebear = require('joebear');

const myJobs = new Joebear(['A','B','C',100]);

myJobs.on('err', function(error){
    console.log('Jobs Error: ', error);
});

myJobs.on('run', function(currentJob, counter){
    console.log('current job value: ', currentJob);
    console.log('current job index (counter) value: ', counter);
    var randomBool = Math.random() >= 0.5;
    if (!randomBool) {
        // simulate a failed job...
        console.log('Job', currentJob, 'failed!');
        myJobs.resetJob();
        return;
    }
    console.log('Job',currentJob, 'success!');
    myJobs.nextJob();
});

myJobs.on('finished', function(jobsSummary) {
    console.log('Joebear finished, summary:', jobsSummary);
});

// start Joebear
myJobs.start();

```
### Cron
A more complete example for a simple crypto coins values in USD that runs every 15 minutes

## API
### **joebear(jobsArray)**
First argument must be array of elements. 

Returns: `EventEmitter`

#### `jobsArray` Array of your elements where each define a job

### start()
Start joebear

### stop()
Stop joebear (force quit)

### **Event Handlers**

### on('run', callback)
Main handler on current job

#### callback function `(currentJob, counter, originalJobsArray, resetMessage)`
The callback function is responsible to process the job

#### `currentJob` is the current element from the `jobsArray`
#### `counter` is the current progress, current job iteration
#### `originalJobsArray` is the original `jobsArray` for reference if needed
#### `resetMessage` in case of a job being reseted you can pass data along and get it from this argument

### on('err')
Handler in case of error(s)

### on('finished', jobsSummary)
Handler when all jobs were processed **OR** `stop()` was called to force quit.

#### `jobsSummary` is a returned object with these properties:
* `time`- total time in seconds since joebear `start()` executed
* `total` - number of total tasks
* `dispatch` - number of total tasks that successfully processed 

See examples folder for full usage reference.

## License
MIT Licensed. Copyright (c) Arye Shalev 2019.
