import React from 'react'
import voteSVG from './../../svg/svg-vote.svg';

function OverlayHelp(props) {

    const styles = {
        fontFamily: 'Arial',
        color: 'white',
        // opacity: '0.4',
        margin: '20px 0',
        // marginBottom: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
        justifyContent: 'center'
    }

    return (
        <div style={styles} className="OverlayHelp">
            <img src={voteSVG} className="light-drop-shadow-filter" alt="" style={{
                marginRight: 5,
                // transform: 'scale(1.5)'
                height: 24,
            }} />
            <span className="light-text-shadow">Hold <strong>LMB</strong> to vote!</span>
        </div>
    )
}

export default OverlayHelp
