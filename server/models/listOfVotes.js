const mongoose = require('mongoose');

const listOfVotesSchema = mongoose.Schema({
    votes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'gameVote'
        }
    ]
});

module.exports = mongoose.model('listOfVotes',  listOfVotesSchema);