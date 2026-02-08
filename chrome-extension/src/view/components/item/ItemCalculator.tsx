import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { getItemAtom, getItemCalculatorAtom, setItemCalculatorQuantityAtom, setItemCalculatorTotalAtom, setItemCalculatorTotalMUAtom } from "../../application/atoms/items";

const ItemCalculator = ({ name }: { name: string }) => {
    const itemWebAtom = useMemo(() => getItemAtom(name), [name])
    const item = useAtomValue(itemWebAtom)
    const calcAtom = useMemo(() => getItemCalculatorAtom(name), [name])
    const calc = useAtomValue(calcAtom)
    const setQuantity = useSetAtom(setItemCalculatorQuantityAtom)
    const setTotal = useSetAtom(setItemCalculatorTotalAtom)
    const setTotalMU = useSetAtom(setItemCalculatorTotalMUAtom)

    if (!item) return <></>

    return (
        <div className='item-calculator'>
            <img src='img/calculator.png' />
            <table>
                <tbody>
                    <tr>
                        <td>Quantity</td>
                        <td><input type='text' value={calc.quantity} onChange={(e) => setQuantity(name, e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td><input type='text' value={calc.total} onChange={(e) => setTotal(name, e.target.value)} /></td>
                    </tr>
                    <tr>
                        <td>Total+MU</td>
                        <td><input type='text' value={calc.totalMU} onChange={(e) => setTotalMU(name, e.target.value)} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default ItemCalculator;
