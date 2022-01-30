import React, { useState } from 'react'
import ExpandableSection from '../common/ExpandableSection'

function AboutPage() {
    const [feedbackExpanded, setFeedbackExpanded] = useState(false)
    const [donationsExpanded, setDonationsExpanded] = useState(false)
    const [youtubeExpanded, setYoutubeExpanded] = useState(false)
    const [githubExpanded, setGithubExpanded] = useState(false)

    return (
        <>
            <section>
                <img src='img/flow128.png'
                    className='img-about' />
                <div className='inline'>
                    <h1>Entropia Flow</h1>
                    <p>A tool to help you see your returns in Entropia Universe.</p>
                    <p>Version: 0.0.6</p>
                    <p>Author: Lucho MUCHO Ireton</p>
                </div>
            </section>
            <div className='inline'>
                <ExpandableSection title='Feedback' expanded={feedbackExpanded} setExpanded={setFeedbackExpanded} block={true}>
                    <p>Any feedback is welcome, positive, negative, suggestions, or whatever, post at Planet Calyso Forum or contact me ingame.</p>
                </ExpandableSection>

                <ExpandableSection title='Donations' expanded={donationsExpanded} setExpanded={setDonationsExpanded} block={true}>
                    <p>If you think this tool is useful consider support its development by buying my Mind Essence ingame, look in Calypso Auction for Mind Essence at 129.99%, check the seller name.
                    <br/>If you want another quantity or donate in another way contact me ingame.</p>
                </ExpandableSection>

                <ExpandableSection title='Tutorial' expanded={youtubeExpanded} setExpanded={setYoutubeExpanded} block={true}>
                    <p>Video (work in progress)</p>
                </ExpandableSection>

                <ExpandableSection title='Source Code' expanded={githubExpanded} setExpanded={setGithubExpanded} block={true}>
                    <p>The source code is available in <a href='https://github.com/luchoEU/entropia-flow' target="_blank">GitHub</a>, so if you are a fellow programmer you can look around or collaborate.</p>
                </ExpandableSection>
            </div>
        </>
    )
}

export default AboutPage
