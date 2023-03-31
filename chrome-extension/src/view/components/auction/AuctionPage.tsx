import React from 'react'
import { clearPendingChanges } from '../../application/actions/sheets'
import { MATERIAL_DW, MATERIAL_LME, MATERIAL_ME, MATERIAL_NB, MATERIAL_NX, MATERIAL_ST } from '../../application/helpers/materials'
import AuctionActive from './AuctionActive'
import AuctionButton from './AuctionButton'
import AuctionCalculator from './AuctionCalculator'
import AuctionFruit from './AuctionFruit'
import AuctionOrder from './AuctionOrder'
import AuctionRefine from './AuctionRefine'
import AuctionStackable from './AuctionStackable'
import AuctionSweat from './AuctionSweat'
import AuctionUse from './AuctionUse'

function AuctionPage() {
    return (
        <>
            <div className='inline'>
                <AuctionCalculator />
            </div>
            <div className='inline'>
                <div>
                    <AuctionActive />
                </div>
                <div>
                    <div className='inline'>
                        <AuctionOrder />
                    </div>
                    <div className='inline'>
                        <AuctionSweat />
                    </div>
                    <div className='inline'>
                        <AuctionFruit />
                    </div>
                </div>
                <div>
                    <div className='inline'>
                        <AuctionStackable material={MATERIAL_NX} />
                    </div>
                    <div className='inline'>
                        <AuctionStackable material={MATERIAL_ME} />
                    </div>
                    <div className='inline'>
                        <AuctionStackable material={MATERIAL_ST} />
                    </div>
                </div>
                <div>
                    <div className='inline'>
                        <AuctionStackable material={MATERIAL_DW} />
                    </div>
                    <div className='inline'>
                        <AuctionStackable material={MATERIAL_LME} />
                    </div>
                    <div className='inline'>
                        <AuctionStackable material={MATERIAL_NB} />
                    </div>
                </div>
                <div>
                    <div className='inline'>
                        <AuctionRefine material={MATERIAL_ME} />
                    </div>
                    <div className='inline'>
                        <AuctionRefine material={MATERIAL_LME} />
                    </div>
                    <div className='inline'>
                        <AuctionRefine material={MATERIAL_NB} />
                    </div>
                </div>
                <div>
                    <div className='inline'>
                        <AuctionUse material={MATERIAL_ME} />
                    </div>
                    <div className='inline'>
                        <AuctionUse material={MATERIAL_LME} />
                    </div>
                    <div className='inline'>
                        <AuctionUse material={MATERIAL_NB} />
                    </div>
                </div>
            </div>
            <div>
                <AuctionButton title='Clear pending' pending={false} action={clearPendingChanges} />
            </div>
        </>
    )
}

export default AuctionPage
