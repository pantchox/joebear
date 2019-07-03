/* Joebear simple example */
const Joebear = require('../index');

const myJobs = new Joebear(['A','B','C',100]);

myJobs.on('err', function(error) {
    console.log('Jobs Error: ', error);
});

myJobs.on('run', function(currentJob, counter) {
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

myJobs.start();
