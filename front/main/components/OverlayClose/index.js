import React from 'react'

import closeSVG from './../../svg/svg-close.svg'

function OverlayClose(props) {
    return (
        <div className="OverlayClose" onClick={props.onClick} style={{cursor: 'pointer'}}>
            <img src={closeSVG} alt="" />
        </div>
    )
}

export default OverlayClose
