//Setup
const express = require('express');
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');

//Middleware
const cors = require('cors');

//App
const app = express();

//Helpers

async function goOverArray(array) { 
    for (const item of array) {
        const newDocument = new gameInstance(item);
        await newDocument.save();
    }
}

async function importJSONtoDatabase() {

    const data = JSON.parse(fs.readFileSync('./server/steamData.json'));

    //Delete all
    const deletedCount = await gameInstance
        .deleteMany({})
        .exec((err, self) => {
            console.log("Finished Deleting all previous documents", self)
        });

    for (category in data) {
        for (route in data[category]) {
            //Array of data here
            await goOverArray(data[category][route]);
        }
    }

    wrappedLog("Finished importing JSON to Database");

}

function wrappedLog(result) {
    console.log("-------------------------------------------------------------------------");
    console.log(result)
    console.log("-------------------------------------------------------------------------");
}

//Database
mongoose.connect("mongodb://localhost/voting-hub", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', async function(){
    console.log('Connection opened');
    
    const shouldReimport = true;

    if (shouldReimport) {
        importJSONtoDatabase();
    }

    const totalDocs = await gameInstance.estimatedDocumentCount();

    console.log('Current amount of elements', totalDocs)

})

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

    route: String,

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

const gameInstance = mongoose.model('gameInstance', gameInstanceSchema);
const userVoteModel = mongoose.model('gameVote', userVoteSchema);

//Data
const data = {
    ...JSON.parse(fs.readFileSync('./server/paginatedData.json') || null),
    steam: {
        ...JSON.parse(fs.readFileSync('./server/paginatedData.json') || null),
    }
};
 
//Middleware
app.use(express.json());
app.use(cors());
app.use("/overlay", express.static(path.join(__dirname, '../dist/overlay')));

//Routes
app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get('/entire-api', async (req, res) => {
    // res.send(data);
    const data = await gameInstance
    .find({});

    res.send(data);
});

app.get('/games/:provider/:route', async (req, res) => {
    const provider = req.params.provider;
    const route = req.params.route;

    //popularNewReleases

    const data = await gameInstance
    .find({
        route: route,
    })
    .select('-votes, -_id')
    .lean()
    .skip(Math.floor(Math.random() * 10) * 25)
    .limit(25)
    
    res.send(data)
})

app.get('/games/global/:route', async (req, res) => {

    const pageIndex = 3;

    const LIMIT = 25;

    const data = await gameInstance
    .find({})
    .select('-votes -_id')
    .skip(pageIndex * LIMIT)
    .limit(LIMIT)
    .lean();

    res.send(data);
});

//Listen
const listener = app.listen(9999, function(){
    console.log("Listening on port: ", listener.address().port);
});