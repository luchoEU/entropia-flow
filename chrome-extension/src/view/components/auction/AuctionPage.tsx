import React from 'react'
import { clearPendingChanges } from '../../application/actions/sheets'
import { STACKABLE_DILUTED, STACKABLE_LME, STACKABLE_ME, STACKABLE_NEXUS } from '../../application/helpers/stackable'
import AuctionActive from './AuctionActive'
import AuctionButton from './AuctionButton'
import AuctionCalculator from './AuctionCalculator'
import AuctionOrder from './AuctionOrder'
import AuctionRefine from './AuctionRefine'
import AuctionStackable from './AuctionStackable'
import AuctionSweat from './AuctionSweat'

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
                </div>
                <div>
                    <div className='inline'>
                        <AuctionStackable material={STACKABLE_NEXUS} />
                    </div>
                    <div className='inline'>
                        <AuctionStackable material={STACKABLE_ME} />
                    </div>
                </div>
                <div>
                    <div className='inline'>
                        <AuctionStackable material={STACKABLE_DILUTED} />
                    </div>
                    <div className='inline'>
                        <AuctionStackable material={STACKABLE_LME} />
                    </div>
                </div>
                <div>
                    <div className='inline'>
                        <AuctionRefine material={STACKABLE_ME} />
                    </div>
                    <div className='inline'>
                        <AuctionRefine material={STACKABLE_LME} />
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
