const mongoose = require('mongoose');

const gameInstanceSchema = mongoose.Schema({
    appId: {type: String},
    images: {
        imageCDN: {type: String},
        routes: {
            coverSmall: {type: String},
            header: {type: String}
        }
    },
    price: {
        originalPrice: {type: String},
        currentPrice: {type: String}
    },
    title: {type: String},
    releaseDate: {type: String},
    reviews: {
        summary: { type: String},
        total: {type: String }
    },
    screenshots: {
        type: [String]
    },
    tags: {
        type: [String]
    },

    provider: {name: String},

    votes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'gameVote'
        }
    ]

    // votes: {     type: mongoose.Types.ObjectId,     ref: 'listOfVotes', }

});

module.exports = mongoose.model('gameInstance', gameInstanceSchema);
