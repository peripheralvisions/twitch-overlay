import React from 'react'
import './index.scss'

function OverlayButton(props) {

    const styles = {
        position: 'fixed',
        right: '50%',
        top: '50%',
        display: props.overlayVisibility === true ? 'none' : 'block',
    }

    const onClick = (evt) => {
        console.log('clicked bttn');
    }


    const buttonMessage = props.buttonMessage;

    return (
        <div className="OverlayButton" style={styles} onClick={props.toggleOverlayVisibility}>
            <h2>{buttonMessage}</h2>
        </div>
    )
}

export default OverlayButton
