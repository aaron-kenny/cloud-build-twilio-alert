/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.buildStatusSms = (event, context) => {
    const data = JSON.parse(Buffer.from(event.data, 'base64').toString());

    // Only send alert if it's the final build event.
    if(data.status != 'QUEUED' && data.status != 'WORKING') {
        const accountSid = 'your_account_sid';
        const authToken = 'your_auth_token';
        const client = require('twilio')(accountSid, authToken);
        const repoName = data.source.repoSource.repoName;
        const tag = data.source.repoSource.tagName;

        var statusTitle = '';
        var statusPhrase = '';
        switch(data.status) {
            case 'SUCCESS': // build succeeds
                statusTitle = 'BUILD SUCCESS';
                statusPhrase = 'successfully deployed.';
                break;
            case 'FAILURE': // build fails
                statusTitle = 'BUILD FAILURE';
                statusPhrase = 'failed to deploy.';
                break;
            case 'CANCELLED': // build cancelled by user
                statusTitle = 'BUILD CANCELLED';
                statusPhrase = 'was cancelled.';
                break;
            case 'TIMEOUT': // build times out
                statusTitle = 'BUILD TIMEOUT';
                statusPhrase = 'timed out.';
                break;
            case 'FAILED': // step times out
                statusTitle = 'STEP TIMEOUT';
                statusPhrase = 'timed out on a step.';
                break;
        }

        client.messages
        .create({
            body: statusTitle + '\n' + repoName + ' ' + tag + ' ' + statusPhrase,
            from: '+15555555555',
            to: '+15555555555'
        })
        .then(message => console.log(message.sid));
    }
};