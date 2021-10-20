const mongoose = require('mongoose');

const userVoteSchema = mongoose.Schema({
    username: String,
    dateVoted: Date,
    game: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "gameInstance"
    }
});

module.exports = mongoose.model('gameVote', userVoteSchema);