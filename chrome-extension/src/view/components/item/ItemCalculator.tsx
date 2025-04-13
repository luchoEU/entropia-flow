import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getItem } from "../../application/selectors/items";
import { setItemCalculatorQuantity, setItemCalculatorTotal, setItemCalculatorTotalMU } from "../../application/actions/items";

const ItemCalculator = ({ name }: { name: string }) => {
    const dispatch = useDispatch()
    const item = useSelector(getItem(name))
    if (!item) return <></>

    return (
        <div className='item-calculator'>
            <img src='img/calculator.png' />
            <table>
                <tbody>
                    <tr>
                        <td>Quantity</td>
                        <td><input type='text' value={item.calc?.quantity ?? ''} onChange={(e) => dispatch(setItemCalculatorQuantity(name, e.target.value))} /></td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td><input type='text' value={item.calc?.total ?? ''} onChange={(e) => dispatch(setItemCalculatorTotal(name, e.target.value))} /></td>
                    </tr>
                    <tr>
                        <td>Total+MU</td>
                        <td><input type='text' value={item.calc?.totalMU ?? ''} onChange={(e) => dispatch(setItemCalculatorTotalMU(name, e.target.value))} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default ItemCalculator;
