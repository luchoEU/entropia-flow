import React from 'react'
import { clearPendingChanges } from '../../application/actions/sheets'
import { STACKABLE_DILUTED, STACKABLE_LME, STACKABLE_ME, STACKABLE_NB, STACKABLE_NEXUS, STACKABLE_SWEETSTUFF } from '../../application/helpers/stackable'
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
                        <AuctionStackable material={STACKABLE_NEXUS} />
                    </div>
                    <div className='inline'>
                        <AuctionStackable material={STACKABLE_ME} />
                    </div>
                    <div className='inline'>
                        <AuctionStackable material={STACKABLE_SWEETSTUFF} />
                    </div>
                </div>
                <div>
                    <div className='inline'>
                        <AuctionStackable material={STACKABLE_DILUTED} />
                    </div>
                    <div className='inline'>
                        <AuctionStackable material={STACKABLE_LME} />
                    </div>
                    <div className='inline'>
                        <AuctionStackable material={STACKABLE_NB} />
                    </div>
                </div>
                <div>
                    <div className='inline'>
                        <AuctionRefine material={STACKABLE_ME} />
                    </div>
                    <div className='inline'>
                        <AuctionRefine material={STACKABLE_LME} />
                    </div>
                    <div className='inline'>
                        <AuctionRefine material={STACKABLE_NB} />
                    </div>
                </div>
                <div>
                    <div className='inline'>
                        <AuctionUse material={STACKABLE_ME} />
                    </div>
                    <div className='inline'>
                        <AuctionUse material={STACKABLE_LME} />
                    </div>
                    <div className='inline'>
                        <AuctionUse material={STACKABLE_NB} />
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
