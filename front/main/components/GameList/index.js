import React from 'react'
import GameCard from '../GameCard';

function GameList(props) {

    const games = props.data;

    const searchValue = props.searchValue;

    const ErrorMessage = (<h1 style={{textAlign: 'center'}}>
        API UNAVAILABLE
    </h1>);

    return (
        <div>
            {
                games.length < 1 ? 
                    ErrorMessage
                : 
                searchValue === "" ?
                games.map(each => {
                    return (
                    <GameCard sendVote={props.sendVote} data={{...each}} />)
                }) 
                :
                games.filter((gameObj, idx, arr) => {
                    const title = gameObj.title.toLowerCase();
                    return title.includes(searchValue.toLowerCase());
                }).map(each => {
                    return (
                    <GameCard sendVote={props.sendVote} data={{...each}} />)
                }) 
            }
        </div>
    )
}

export default GameList
