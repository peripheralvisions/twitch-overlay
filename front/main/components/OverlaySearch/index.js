import React from 'react';
import './index.scss';

//SVGS
import steamSVG from './../../svg/svg-steam.svg';
import worldSVG from './../../svg/svg-world.svg';
import controllerSVG from './../../svg/svg-controller.svg';

function OverlaySearch(props) {

    const selectedCategory = props.selectedCategory;

    const menuOptions = [
        {
            displayName: 'STEAM',
            disabled: false,
            value: 'steam',
            defaultRoute: 'popularNewReleases',
            svg: steamSVG,
            subMenu: [
                {
                    value: 'popularNewReleases',
                    title: 'POPULAR'
                }, {
                    value: 'newReleases',
                    title: 'NEW'
                }
            ]
        }, {
            disabled: true,
            displayName: 'GLOBAL',
            defaultRoute: 'all',
            value: 'global',
            svg: worldSVG
        }, {
            disabled: true,
            displayName: "OTHER",
            defaultRoute: 'popularNewReleases',
            value: 'other',
            svg: controllerSVG,
        }
    ];

    menuOptions.forEach(each => {
        each.subMenu = null;
    })

    const selectedMenu = menuOptions.find(curr => {
        return curr.value === selectedCategory.category;
    });

    const handleInput = (evt) => {
        const isEnter = evt.keyCode === 13;
        const isEmpty = evt.target.value === '';


        if (isEmpty) {
            props.setSearchValue("");
        } else if (isEnter) {
            props.setSearchValue(evt.target.value);
        }
        
    }

    const clickHandler = (each) => {
        return props.changeCategory({
            category: each.value,
            subCategory: each.subMenu ? each.subMenu[0].value : each.defaultRoute,
        })
    }

    return (
        <div id="OverlaySearch">
            {console.log('Setting up Search')}
            <ul className="OverlaySearch-categories">
                {menuOptions.map(each => {

                    let classList = selectedCategory.category === each.displayName.toLowerCase() ? "selected " : ""

                    classList += 'light-text-shadow'

                    return <li className={classList} onClick={() => {
                        if (each.disabled)
                            return null
                        else
                            return clickHandler(each)
                    }}>
                        <img src={each.svg}/>
                        <span>{each.displayName}</span>
                    </li>
                })} 
            </ul>


            {selectedMenu.subMenu
                ?   <ul className="OverlaySearch-submenu">
                        {selectedMenu.subMenu.map(each => <li>{each.title}</li>)}
                    </ul>
                : null
            }
            <input onKeyUp={handleInput} type="text" placeholder="Search for titles"/>
        </div>
    )
}

export default OverlaySearch