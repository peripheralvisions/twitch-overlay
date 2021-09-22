import React, { useRef } from 'react';

import './index.scss';

function GameCard(props) {

    const data = props.data;

    const imageURL = data.images.imageCDN;
    const imageROUTE = data.images.routes.header;

    const sendVote = props.sendVote;

    let interv = null;
    let maxWidth = 0;

    const fillLine = useRef(null)

    let screenshotInterval = null;


    const checkCardFillStatus = () => {
        const curr = fillLine.current.offsetWidth;
        if (curr >= maxWidth) {
            clearInterval(interv);
            sendVote(data);
        } 
    }

    const onMouseDown = (evt) => {
        evt.stopPropagation();
        maxWidth = fillLine.current.parentElement.offsetWidth;
        evt.currentTarget.classList.add('GameCard-beingVoted');
        interv = setInterval(() => {
            checkCardFillStatus();
        }, 100);
    }

    const onMouseUp = (evt) => {
        evt.stopPropagation();
        evt.currentTarget.classList.remove('GameCard-beingVoted');
        clearInterval(interv);
        clearInterval(screenshotInterval)
    }

    const onMouseEnter = (evt) => {
        const screenshotsDom = evt.currentTarget.querySelector(".GameCard-screenshots");
        let idx = 0;

        //Reset all images to being invisible
        if (screenshotsDom.children.length <= 0) {
            return;
        }
        Array.from(screenshotsDom.children).forEach(each => each.style.opacity = 0);
        screenshotsDom.children[0].style.opacity = 1;
        screenshotInterval = setInterval(() => {
            screenshotsDom.children[idx].style.opacity = 0;
            idx++;

            if (idx >= screenshotsDom.children.length - 1) {
                idx = 0;
            }
            
            screenshotsDom.children[idx].style.opacity = 1;
        }, 1000);
    }

    return (
        <div    className="GameCard" 
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onMouseEnter={onMouseEnter}>
            <div className="GameCard-header" style={{position: 'relative'}}>
                {/* <LazyLoad> */}
                    <img src={imageURL + imageROUTE} alt=""/>
                {/* </LazyLoad> */}
            </div>
            <div className="GameCard-details">
                <div>
                <h2 className="GameCard-title">{data.title}</h2>
                </div>

                <div>
                    {
                        data.tags ? data.tags.slice(0, 3).map(each => <span className="GameCard-tag light-text-shadow">{each}</span>) : null
                    }
                </div>
            </div>

            <div className="GameCard-dash light-box-shadow">
                <div ref={fillLine} className="GameCard-dash-fill"></div>
            </div>

            <div className="GameCard-screenshots">
                {
                    data.screenshots.map(each => <img src={each} />)
                }
            </div>

        </div>
    )
}

export default GameCard;