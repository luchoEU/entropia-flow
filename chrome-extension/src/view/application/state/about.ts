interface AboutState {
    expanded: string[] // for questions
}

const FEEDBACK = 'feedback'
const TUTORIALS = 'tutorials'
const SOURCECODE = 'sourceCode'
const FAQ = 'faq'
const QUESTION = (id: number) => `question${id}`

export {
    AboutState,
    FEEDBACK,
    TUTORIALS,
    SOURCECODE,
    FAQ,
    QUESTION
}
