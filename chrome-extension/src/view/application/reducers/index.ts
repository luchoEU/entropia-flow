import { combineReducers } from 'redux'
import menu from './menu'
import status from './status'
import history from './history'
import last from './last'
import calculator from './calculator'
import actives from './actives'
import order from './order'
import sweat from './sweat'
import stackable from './stackable'
import refine from './refine'

export default combineReducers({
    menu, status, history, last, calculator, actives, order, sweat, stackable, refine
})
