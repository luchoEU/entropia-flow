import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { SHOW_AUCTION_PAGE } from '../../config';
import { ABOUT_PAGE, AUCTION_PAGE, INVENTORY_PAGE, selectMenu } from '../application/actions/menu';
import { getSelectedMenu } from '../application/selectors/menu';

const Navigation = () => {
    const dispatch = useDispatch()
    const menu = useSelector(getSelectedMenu)

    return (
        <nav>
            <div>
                <img src='img/flow128.png'></img>
                <strong>Entropia Flow</strong>
            </div>
            <button
                className={menu === INVENTORY_PAGE ? 'selected-menu' : ''}
                onClick={() => dispatch(selectMenu(INVENTORY_PAGE))}>
                Inventory
            </button>
            {SHOW_AUCTION_PAGE ?
                <button
                    className={menu === AUCTION_PAGE ? 'selected-menu' : ''}
                    onClick={() => dispatch(selectMenu(AUCTION_PAGE))}>
                    Auction
                </button> : ''
            }
            <button
                className={menu === ABOUT_PAGE ? 'selected-menu' : ''}
                onClick={() => dispatch(selectMenu(ABOUT_PAGE))}>
                About
            </button>
        </nav>
    )
}

export default Navigation