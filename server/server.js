//Node

const fs   = require('fs');
const path = require('path');

//Server

const mongoose = require('mongoose');
const express  = require('express');
const app      = express();


const PAGINATION_LIMIT = 25;
let   PAGINATION_MAX_PAGES = 0;


//Middleware

app.use(express.json());

//Connect

mongoose.connect('mongodb://localhost/subsunday-overlay-database', {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

//Schema

const gameInstanceSchema = mongoose.Schema({
    appId: {
        type: String
    },
    images: {
        imageCDN: {
            type: String
        },
        routes: {
            coverSmall: {
                type: String
            },
            header: {
                type: String
            }
        }
    },
    price: {
        originalPrice: {
            type: String
        },
        currentPrice: {
            type: String
        }
    },
    title: {
        type: String
    },
    releaseDate: {
        type: String
    },
    reviews: {
        summary: {
            type: String
        },
        total: {
            type: String
        }
    },
    screenshots: {
        type: [String]
    },
    tags: {
        type: [String]
    },

    provider: {
        name: String
    },

    votes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'gameVote'
        }
    ]

    // votes: {     type: mongoose.Types.ObjectId,     ref: 'listOfVotes', }

});

const userVoteSchema = mongoose.Schema({
    username: String,
    dateVoted: Date,
    game: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "gameInstance"
    }
});

const listOfVotesSchema = mongoose.Schema({
    votes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'gameVote'
        }
    ]
})

//Models

const gameInstance     = mongoose.model('gameInstance', gameInstanceSchema);
const userVoteModel    = mongoose.model('gameVote',     userVoteSchema);
const listOfVotesModel = mongoose.model('listOfVotes',  listOfVotesSchema);

//Connection

const db = mongoose.connection;

db.once('open', async() => {

    const shouldReimport = true;

    if (shouldReimport) {
        console.log("Initiating reimport");
        // await gameInstance.deleteMany({});
        await importJSONtoDatabase();
    }

    const totalDocs = await gameInstance.estimatedDocumentCount();

    PAGINATION_MAX_PAGES = Math.round(totalDocs / PAGINATION_LIMIT) - 1;

    console.log('Total database documents', totalDocs)
})

//Helpers

async function goOverArray(array) {

    const promises = [];

    let added = 0;
    let ignored = 0;

    for (const item of array) {

        promises.push(new Promise(async(resolve, reject) => {
            //See if appId exists in Database
            const existing = await gameInstance.findOne({appId: item.appId});

            if (existing === null) {
                const newDocument = new gameInstance(item);
                await newDocument.save();
                resolve(true);
            } else {
                resolve(false);
            }
        }));
    }

    await Promise
        .all(promises)
        .then((results) => {
            results.forEach(each => {
                each === true
                    ? added++
                    : ignored++;
            });
        })
        .then(() => console.log(`Added items: ${added} Ignored: ${ignored}`))

    return;

}

async function importJSONtoDatabase(fileNames) {

    //Check if json file exists Check if json file is older than a week

    const exists = fs.existsSync('./server/steamData.json');

    if (exists) {

        const file = fs.readFileSync('./server/steamData.json', 'utf-8');
        const jsonData = JSON.parse(file);

        for (category in jsonData) {
            for (route in jsonData[category]) {
                await goOverArray(jsonData[category][route]);
            }
        }

    } else {
        console.log('No JSON file available');
    }
    
}

//Overlay

app.use("/overlay", express.static(path.join(__dirname, '../dist/overlay')));

//Routes Lists

app.get('/all', async(req, res) => {
    // .select('-votes')
    const data = await gameInstance
        .find({})
        .lean();
    res.send(data);
})

app.get('/votes', async(req, res) => {

    const queries = req.query;
    const data = await userVoteModel
        .find({})
        .populate('game')
        .lean();

    res.send(data);
})

app.get('/gamesWithVotes', async(req, res) => {
    const data = await gameInstance.find({
        'votes.1': {
            $exists: true
        }
    });
    res.send(data);
});

app.get('/games/:provider/:route/:page', async(req, res, next) => {

    const {provider, page} = req.params;

    if (!provider) 
        return res.status(404).send("Provider not passed in");
    
    const data = await gameInstance
        .find({})
        .lean()
        .skip(page * PAGINATION_LIMIT)
        .limit(PAGINATION_LIMIT);

    if (data.length <= 0)
        return res
        .send({
            message: "Provider doesnt have any games"
        })
        .status(404)
    
    return res
        .status(200)
        .send({
            maxPages: PAGINATION_MAX_PAGES,
            data: data,
        });
})

//Search

app.get('/search/:title', async(req, res) => {

    const {title} = req.params;

    res.send(await gameInstance.find({
        title: {
            $regex: title,
            $options: 'i'
        }
    }).lean());
})

//Post

app.post('/vote', async(req, res) => {
    const {username, title} = req.body;

    //Selecting game to be updated
    const selectedGame = await gameInstance.findOne({title});

    //If game not in database
    if (!selectedGame) {
        return res.send("Game doesn't exist in database");
    }

    //Check if user has existing vote in database
    const existingUserVote = await userVoteModel
        .findOne({username})
        .populate('game');

    //Check whether user exists in database
    if (existingUserVote) {

        //If user is voting for the same game exit
        if (existingUserVote.game.title === title || existingUserVote.game.title === selectedGame.title) {
            return res.send("You already voted for " + selectedGame.title);
        }

        const previousGame = gameInstance.findById(existingUserVote.game._id);

        //Update the selected game
        await previousGame.updateOne({
            $pullAll: {
                votes: [existingUserVote._id]
            }
        });

        await selectedGame.updateOne({
            $push: {
                votes: existingUserVote._id
            }
        })

        //Update existing vote
        await existingUserVote.updateOne({game: selectedGame._id});

    } else {

        //Setting up new vote
        const newVote = await new userVoteModel({username, title, game: selectedGame._id}).save();

        //Push new vote to array
        await selectedGame.updateOne({
            $push: {
                votes: newVote._id
            }
        });
    }

    const message = `Vote received, ${username} voted for ${selectedGame.title}`;

    return res
        .status(201)
        .send(message);
});

//Action

app.get('/clear-votes', async(req, res) => {
    const deleted = await userVoteModel.deleteMany({});

    res.send(deleted);
})

app.get('/clear-all', async(req, res) => {
    const deletedA = await userVoteModel.deleteMany({});
    const deletedB = await gameInstance.deleteMany({});
    res.send(deletedA + ' ' + deletedB);
})

//Listener

const listener = app.listen(5555, () => {
    console.log('APP listening on port:', listener.address().port);
    console.log("Available Routes:");

    const routes = [];

    for (layer of app._router.stack) {
        if (layer.route) 
            routes.push(layer.route.path);
        }
    
    for (route of routes) {
        console.log(`→ localhost:${listener.address().port}${route}`)
    }
});