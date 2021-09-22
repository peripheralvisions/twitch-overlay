import React from 'react'
import './index.scss';

import catFaceSVG from './CatFace.svg';

function OverlayUserStatus(props) {

    const username = props.username;
    const currentVote = props.currentVote;

    return (
        <div id="OverlayUserStatus">
            <div id="OverlayUserStatus-catFace" >
                <img className="light-drop-shadow-filter" src={catFaceSVG} alt="" />
            </div>
            <div id="OverlayUserStatus-separator" className="light-box-shadow"></div>
            <div id="OverlayUserStatus-credentials">
                <h3 className="light-text-shadow">{username || 'TarantulaTom42'}</h3>
                <span className="light-text-shadow">{currentVote || "You haven't voted yet"}</span>
            </div>
        </div>
    )
}

export default OverlayUserStatus
