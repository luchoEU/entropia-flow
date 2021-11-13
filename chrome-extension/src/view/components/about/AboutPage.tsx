import React, { useState } from 'react'

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
                    <p>A tool to help you track your returns in Entropia Universe.</p>
                    <p>Version: 0.0.2</p>
                    <p>Author: Lucho MUCHO Ireton</p>
                </div>
            </section>
            <div className='inline'>
                <section className='block'>
                    <h1>Feedback
                        {feedbackExpanded ?
                            <img className='hide' src='img/up.png' onClick={() => setFeedbackExpanded(false)} /> :
                            <img src='img/down.png' onClick={() => setFeedbackExpanded(true)} />}
                    </h1>
                    {
                        feedbackExpanded ?
                            <p>Any feedback is welcome, positive, negative, suggestions, or whatever, post at Planet Calyso Forum or contact me ingame.</p>
                            : ''
                    }
                </section>
                <section className='block'>
                    <h1>Donations
                        {donationsExpanded ?
                            <img className='hide' src='img/up.png' onClick={() => setDonationsExpanded(false)} /> :
                            <img src='img/down.png' onClick={() => setDonationsExpanded(true)} />}
                    </h1>
                    {
                        donationsExpanded ?
                            <p>If you think this tool is useful consider support its development by buying my Mind Essence ingame, look in Calypso Auction for Mind Essence at 129.99%, check the seller name.
                            <br/>If you want another quantity or donate in another way contact me ingame.</p>
                            : ''
                    }
                </section>
                <section className='block'>
                    <h1>Tutorial
                        {youtubeExpanded ?
                            <img className='hide' src='img/up.png' onClick={() => setYoutubeExpanded(false)} /> :
                            <img src='img/down.png' onClick={() => setYoutubeExpanded(true)} />}
                    </h1>
                    {
                        youtubeExpanded ?
                            <p>Video</p>
                            : ''
                    }
                </section>
                <section className='block'>
                    <h1>Source Code
                        {githubExpanded ?
                            <img className='hide' src='img/up.png' onClick={() => setGithubExpanded(false)} /> :
                            <img src='img/down.png' onClick={() => setGithubExpanded(true)} />}
                    </h1>
                    {
                        githubExpanded ?
                            <p>The source code is available in <a href='https://github.com/luchoEU/entropia-flow' target="_blank">GitHub</a>, so if you are a fellow programmer you can look around or collaborate.</p>
                            : ''
                    }
                </section>
            </div>
        </>
    )
}

export default AboutPage
