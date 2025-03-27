import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMaterial } from "../../application/selectors/materials";
import { setMaterialCalculatorQuantity, setMaterialCalculatorTotal, setMaterialCalculatorTotalMU } from "../../application/actions/materials";

const MaterialCalculator = ({ name }: { name: string }) => {
    const dispatch = useDispatch()
    const material = useSelector(getMaterial(name))
    if (!material) return <></>

    return (
        <div className='material-calculator'>
            <img src='img/calculator.png' />
            <table>
                <tbody>
                    <tr>
                        <td>Quantity</td>
                        <td><input type='text' value={material.calc?.quantity ?? ''} onChange={(e) => dispatch(setMaterialCalculatorQuantity(name, e.target.value))} /></td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td><input type='text' value={material.calc?.total ?? ''} onChange={(e) => dispatch(setMaterialCalculatorTotal(name, e.target.value))} /></td>
                    </tr>
                    <tr>
                        <td>Total+MU</td>
                        <td><input type='text' value={material.calc?.totalMU ?? ''} onChange={(e) => dispatch(setMaterialCalculatorTotalMU(name, e.target.value))} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default MaterialCalculator;
