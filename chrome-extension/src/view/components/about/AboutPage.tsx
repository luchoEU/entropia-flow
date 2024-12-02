import React from 'react'
import { useSelector } from 'react-redux'
import { setExpanded } from '../../application/actions/about'
import { isExpanded } from '../../application/selectors/about'
import { DONATIONS, FAQ, FEEDBACK, QUESTION, SOURCECODE, TUTORIALS } from '../../application/state/about'
import ExpandableSection from '../common/ExpandableSection'
import ExpandableArrowButton from '../common/ExpandableArrowButton'

const VERSION = '0.4.5'

const ExpandableQuestion = (p: { q: Question }) => {
    const expanded = useSelector(isExpanded(QUESTION(p.q.id)))
    const expand = setExpanded(QUESTION(p.q.id))

    return (
        <>
            <h3>{p.q.question} <ExpandableArrowButton expanded={expanded} setExpanded={expand} /></h3>
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
            'This extension only reads the items list from the Entropia Universe (EU) website, and while it does require access to your EU account page, there’s no direct security risk beyond that.',
            'Since it’s a Chrome extension, it can technically view anything on the EU website once you log in with your credentials, but it cannot access or interfere with the game client itself, your in-game actions remain private. More importantly, sensitive actions like deposits, withdrawals, or item transfers require additional inputs that the extension cannot perform. The extension has access to view information from your “My Account” page, but it doesn’t. Also it doesn’t collect or send this data anywhere, in fact, I don’t even have a server for this extension.',
            'I’ve been playing Entropia Universe since 2007, and I created this tool simply to share something I found useful.',
            'At the end of the day, like with any extension, trust in the author is key. To ensure transparency, I’ve made the source code available for review.'
        ],
        link: 'https://www.planetcalypsoforum.com/forum/index.php?threads/entropia-flow-chrome-extension.286300/post-3804891'
    },
    {
        id: 2,
        question: 'I remember a similar tool for tracking took the my item page down for few days',
        response: [
            'MindArk implemented a limit on how frequently you can refresh the page.',
            'This tool takes that into account—it only requests data every 3 minutes, or you can choose to refresh manually if you prefer.',
            'I’ve been using it for years, and I only encountered an issue once because I was testing some changes on the extension. If MindArk blocks your access, you’ll see an HTTP 425 error. In that case, you’d need to open a support ticket with MindArk to get your account unblocked.',
            'This issue only happens if you refresh the “My Items” page too frequently within a short window, like less than 3 minutes.',
            'If you want to play it safe, you can stop the automatic refresh and manually visit the “My Items” page on the Entropia Universe website. The extension will then capture the data without sending any additional requests.'
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
        <div className='about-page'>
            <section>
                <img src='img/flow128.png'
                    className='img-about' />
                <div className='inline'>
                    <h1>Entropia Flow</h1>
                    <p>A tool to help you see your returns in Entropia Universe.</p>
                    <p>Version: {VERSION}</p>
                    <p>Author: Lucho MUCHO Ireton</p>
                </div>
            </section>
            <ExpandableSection title='Feedback' expanded={isFeedbackExpanded} setExpanded={setExpanded(FEEDBACK)}>
                <p>Any feedback is welcome, positive, negative, suggestions, or whatever, post at <a href="https://www.planetcalypsoforum.com/forum/index.php?threads/entropia-flow-chrome-extension.286300/">Planet Calyso Forum</a> or contact me ingame.</p>
            </ExpandableSection>

            <ExpandableSection title='Donations' expanded={isDonationsExpanded} setExpanded={setExpanded(DONATIONS)}>
                <p>If you think this tool is useful consider support its development by buying my Mind Essence ingame, just contact me ingame (my full avatar name is Lucho MUCHO Ireton).</p>
            </ExpandableSection>

            <ExpandableSection title='Tutorials' expanded={isTutorialsExpanded} setExpanded={setExpanded(TUTORIALS)}>
                <p><a href="https://youtu.be/aZoQd8j1jSA">Tutorial about how to tracking your returns</a></p>
                <p><a href="https://youtu.be/VGPJic1s5R8">Tutorial about how to see your items to sell</a></p>
            </ExpandableSection>

            <ExpandableSection title='Source Code' expanded={isSourceCodeExpanded} setExpanded={setExpanded(SOURCECODE)}>
                <p>The source code is available in <a href='https://github.com/luchoEU/entropia-flow' target="_blank">GitHub</a>, so if you are a fellow programmer you can look around or collaborate.</p>
            </ExpandableSection>

            <ExpandableSection title='FAQ' expanded={isFaqExpanded} setExpanded={setExpanded(FAQ)}>
                { faq.map((q: Question) => <ExpandableQuestion q={q} key={q.id}/>) }
            </ExpandableSection>
        </div>
    )
}

export default AboutPage
