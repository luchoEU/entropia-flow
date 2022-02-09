interface AboutState {
    expanded: string[]
}

const FEEDBACK = 'feedback'
const DONATIONS = 'donations'
const TUTORIALS = 'tutorials'
const SOURCECODE = 'sourceCode'
const FAQ = 'faq'
const QUESTION = (id: number) => `question${id}`

export {
    AboutState,
    FEEDBACK,
    DONATIONS,
    TUTORIALS,
    SOURCECODE,
    FAQ,
    QUESTION
}
