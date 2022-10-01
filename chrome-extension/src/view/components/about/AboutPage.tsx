import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setExpanded } from '../../application/actions/about'
import { isExpanded } from '../../application/selectors/about'
import { DONATIONS, FAQ, FEEDBACK, QUESTION, SOURCECODE, TUTORIALS } from '../../application/state/about'
import ExpandableSection from '../common/ExpandableSection'

const ExpandableQuestion = (p: { q: Question }) => {
    const expanded = useSelector(isExpanded(QUESTION(p.q.id)))
    const dispatch = useDispatch()
    const expand = (expanded: boolean) => () => dispatch(setExpanded(QUESTION(p.q.id))(expanded))

    return (
        <>
            <h3>{p.q.question}
                { expanded ?
                    <img className='hide' src='img/up.png' onClick={expand(false)} /> :
                    <img src='img/down.png' onClick={expand(true)} />}
            </h3>
            {  
                expanded ? <>
                
                    { p.q.response.map((str: string) => <p key={str}>{str}</p>) }
                    <p><a href={p.q.link}></a></p>
                </> : ''
            }
        </>
    )
}

interface Question {
    id: number,
    question: string,
    response: string[],
    link: string
}

const faq = [
    {
        id: 1,
        question: 'Is there any security vulnerability by allowing this plugin to access potentially sensitive information on the EU account page?',
        response: [
            'This extension only calls a service that returns the list of items.',
            'Technically for a chrome extension like this, you are letting it communicate to the entropia server with your credentials, it can see anything in the website. But only stuff in the website. Not something’s like you do ingame because there you log in a different application, the game client. Also it can\'t do any harmful like deposit, withdraw or transfer your stuff to other player, because it requires more input.',
            'I play the game since 2007. I don\'t want to steal any information or anything. Just want to share the tool that it is useful to me.',
            'To answer you question, it can technically see your information in your My Account page, but it doesn\’t. What I was trying to say about privacy in the video is that all the information about your items it gets from the Entropia Universe site isn’t sent to any server, in fact I don’t have a server for this.',
            'It is the same with any extension, you have to trust the author. I am trying to be transparent by releasing the source code.'
        ],
        link: 'https://www.planetcalypsoforum.com/forum/index.php?threads/entropia-flow-chrome-extension.286300/post-3804891'
    },
    {
        id: 2,
        question: 'I remember a similar tool for tracking took the my item page down for few days',
        response: [
            'MindArk fixed that by putting a limit on how often you can refresh. This tool considers that and only asks for the items every 3 minutes or 6 minutes after a manual refresh.',
            'I have been using it for months and never had a problem.',
            'Of course, if you click the manual refresh like a maniac the items list may be offline for you for a few hours.  I only recommend refreshing manually once then waiting for autorefresh.'
        ],
        link: 'https://www.planetcalypsoforum.com/forum/index.php?threads/entropia-flow-chrome-extension.286300/post-3805320'
    }
]

function AboutPage() {
    const isFeedbackExpanded = useSelector(isExpanded(FEEDBACK))
    const isDonationsExpanded = useSelector(isExpanded(DONATIONS))
    const isTutorialsExpanded = useSelector(isExpanded(TUTORIALS))
    const isSourceCodeExpanded = useSelector(isExpanded(SOURCECODE))
    const isFaqExpanded = useSelector(isExpanded(FAQ))

    return (
        <>
            <section>
                <img src='img/flow128.png'
                    className='img-about' />
                <div className='inline'>
                    <h1>Entropia Flow</h1>
                    <p>A tool to help you see your returns in Entropia Universe.</p>
                    <p>Version: 0.1.4</p>
                    <p>Author: Lucho MUCHO Ireton</p>
                </div>
            </section>
            <div className='inline'>
                <ExpandableSection title='Feedback' expanded={isFeedbackExpanded} setExpanded={setExpanded(FEEDBACK)} block={true}>
                    <p>Any feedback is welcome, positive, negative, suggestions, or whatever, post at <a href="https://www.planetcalypsoforum.com/forum/index.php?threads/entropia-flow-chrome-extension.286300/">Planet Calyso Forum</a> or contact me ingame.</p>
                </ExpandableSection>

                <ExpandableSection title='Donations' expanded={isDonationsExpanded} setExpanded={setExpanded(DONATIONS)} block={true}>
                    <p>If you think this tool is useful consider support its development by buying my Mind Essence ingame, just contact me ingame.</p>
                </ExpandableSection>

                <ExpandableSection title='Tutorials' expanded={isTutorialsExpanded} setExpanded={setExpanded(TUTORIALS)} block={true}>
                    <p><a href="https://youtu.be/aZoQd8j1jSA">Tutorial about how to tracking your returns</a></p>
                    <p><a href="https://youtu.be/VGPJic1s5R8">Tutorial about how to see your items to sell</a></p>
                </ExpandableSection>

                <ExpandableSection title='Source Code' expanded={isSourceCodeExpanded} setExpanded={setExpanded(SOURCECODE)} block={true}>
                    <p>The source code is available in <a href='https://github.com/luchoEU/entropia-flow' target="_blank">GitHub</a>, so if you are a fellow programmer you can look around or collaborate.</p>
                </ExpandableSection>

                <ExpandableSection title='FAQ' expanded={isFaqExpanded} setExpanded={setExpanded(FAQ)} block={true}>
                    { faq.map((q: Question) => <ExpandableQuestion q={q} key={q.id}/>) }
                </ExpandableSection>
            </div>
        </>
    )
}

export default AboutPage
