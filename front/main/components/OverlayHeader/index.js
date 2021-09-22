import React from 'react'

import './index.scss';
import logoSVG from './OverlayHeaderLogo.svg';
import developerSVG from './../../svg/svg-developer-terminal.svg'
import OverlayClose from './../OverlayClose';

function OverlayHeader(props) {

    return (
        <div id="OverlayHeader">
            <div className="OverlayHeader-top">
                <div
                    id="credit">
                    <img
                        className="light-drop-shadow-filter"
                        id="OverlayHeader-developer-svg"
                        src={developerSVG}
                        alt=""/>
                    <span className="light-text-shadow">Crafted by
                        <strong> @developername</strong>
                    </span>
                </div>
                <OverlayClose onClick={props.changeOverlayVisibility}/>
            </div>
            <div id="OverlayHeader-logo">
                <img src={logoSVG} alt=""/>
            </div>
        </div>
    )
}

export default OverlayHeader