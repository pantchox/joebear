/* 
    Joebear cron job style example 
    This is a more "complete" example, it will check crypto coins value in USD
    for every 15 minutes
*/
const https = require('https');
const Joebear = require('../index');

const TICKER_API_URL = 'https://api.alternative.me/v1/ticker/'
const coins = ['bitcoin', 'litecoin', 'ethereum'];

const myJobs = new Joebear(coins);

myJobs.on('err', (error) => {
    console.log('Jobs Error: ', error);
});

myJobs.on('run',  (currentJob, counter, orgJobsArray, resetMessage) => {
    const coin = currentJob;

    https.get(TICKER_API_URL + coin + '/', (res) => {
        console.log(`getting ticker value for: ${coin}`);
        
        if (!res) {
            let backoffTimeout = 60;
            if (resetMessage) {
                // job was restarted, so we use backoff strategy for delay
                backoffTimeout = resetMessage.timeout;
                backoffTimeout *= 2;
                console.log(`Trying again in ${backoffTimeout / 60} minutes`)
            } else {
                // this is current job first try that failed
                console.log('Trying again in 1 minute');
            }
            
            setTimeout( () => {
                // reset the job and pass timeout data to implement backoff strategy
                myJobs.resetJob({timeout: backoffTimeout});
            }, backoffTimeout * 1000);
            return;
        }

        res.on('data', (data) => {
            // do what ever you need with your data
            const coinData = JSON.parse(data)[0];
            console.log(`${currentJob} - value is ${coinData.price_usd} USD\n`)
            
            
            // call next job on current one success
            myJobs.nextJob();
        });

    }).on('error', (e) => {
        console.log('Job error: ', e);
        myJobs.resetJob();
    });
});

let restartTimeoutHandler = null;
myJobs.on('finished', (jobsSummary) => {
    console.log('Joebear finished, summary:', jobsSummary);
    // if all jobs finihsed, start it again in 15 minutes, else it means a forced stop!
    if (jobsSummary.total === jobsSummary.dispatched && !restartTimeoutHandler) {
        const restartInMinutes = 15;
        restartTimeoutHandler= setTimeout(() => {
            myJobs.restart();
            restartTimeoutHandler = null;
        }, restartInMinutes * 60 * 1000); // simple seconds -> minutes
        console.log(`Sleeping for ${restartInMinutes} minutes...`)
        return;
    }
    
    console.log('force quit');
    process.exit(0);
});

myJobs.start();

// in case the process was forced to be stopped we handle this case
process.on("SIGINT",  () => {
    console.log('coin ticker info stopped');
    myJobs.stop();
});
