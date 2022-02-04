const express = require('express');
const Firestore = require('@google-cloud/firestore')
const db = new Firestore();
 // Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');
const app = express();
app.use(express.json());
const port = process.env.PORT || 8082;
app.listen(port, () => {
    console.log(`Sample Rest API listening on port ${port}`);
});

app.get('/', async (req, res) => {
    res.json({status: 'Ready to roll.'});
})

app.post('/sendToPubSub', async (msg, res) => {
    
    // push to pubsub
    const topicName = 'MyPubSub01';
    const maxMessages = 10;
    const maxWaitTime = 10;

    // Creates a client; cache this for further use
    const pubSubClient = new PubSub();    
    const batchPublisher = pubSubClient.topic(topicName, {
        batching: {
          maxMessages: maxMessages,
          maxMilliseconds: maxWaitTime * 1000,
        },
    });
    
    try {

        let msgIds = "";
        let jsonArray = msg.body;
        console.log(`json array length ${jsonArray.length}.`);
        let promises = [];
        for (let i = 0; i < jsonArray.length; i++) {
            
            /*
            console.log(`Message content ${JSON.stringify(jsonArray[i])} to be published.`);
            const dataBuffer = Buffer.from(JSON.stringify(jsonArray[i]));
            const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
            console.log(`Message ${messageId} published.`); */
            
            //msgIds += messageId + ",";

            console.log(`Message content3 ${JSON.stringify(jsonArray[i])} to be published.`);
            const dataBuffer = Buffer.from(JSON.stringify(jsonArray[i]));
            promises.push(batchPublisher.publish(dataBuffer));// batching logic
        }

        Promise.all(promises)
            .then((results) => {
                console.log(`results ${results}.`);
                for (let j = 0; j < results.length; j++) {
                    msgIds += results[j] + ",";
                    console.log(`Message3 ${results[j]} published.`);
                }
                res.json({ status: 'success', data: `Messages3 ${msgIds} pushed to pubsub successfully.` });
            })
        .catch((e) => {
            // handle errors here
            console.error(`Error occurred while publishing: ${e.message}`);
        });

        //res.json({ status: 'success', data: `Messages ${msgIds} pushed to pubsub successfully.` });
       
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        res.json({ status: 'error', data: `Received error while publishing: ${error.message}.` });
        process.exitCode = 1;
    }
})


app.get('/:breed', async (req, res) => {
    const breed = req.params.breed;
    const query = db.collection('dogs').where('name', '==', breed);
    const querySnapshot = await query.get();
    if (querySnapshot.size > 0) {
        res.json(querySnapshot.docs[0].data());
    }
    else {
        res.json({status: 'Not found'});
    }
})

app.post('/', async (req, res) => {
    const data = {
        name: req.body.name,
        origin: req.body.origin,
        lifeExpectancy: req.body.lifeExpectancy,
        type: req.body.type
    }
    await db.collection('dogs').doc().set(data);
    res.json({ status: 'success', data: { dog: data } });
})