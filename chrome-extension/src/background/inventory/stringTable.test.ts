import StringTable from './stringTable'

describe('test empty', () => {
    let st: StringTable
    beforeEach(() => st = new StringTable([]))

    test('should start empty', () => {
        expect(st.getToStore()).toEqual([])
    })

    test('add 1', () => {
        st.add('B')
        expect(st.getToStore()).toEqual(['B'])
    })

    test('add 2', () => {
        st.add('B')
        st.add('A')
        expect(st.getToStore()).toEqual(['A', 'B'])
    })
})

describe('same', () => {
    let st: StringTable
    beforeEach(() => st = new StringTable(['A']))

    test('init', () => {
        expect(st.getToStore()).toEqual(['A'])
    })

    test('add', () => {
        st.add('A')
        expect(st.getToStore()).toEqual(['A'])
    })
})

describe('position add', () => {
    let st: StringTable
    beforeEach(() => st = new StringTable(['B', 'D']))

    test('add before', () => {
        st.add('A')
        expect(st.getToStore()).toEqual(['A', 'B', 'D'])
    })

    test('add middle', () => {
        st.add('C')
        expect(st.getToStore()).toEqual(['B', 'C', 'D'])
    })

    test('add after', () => {
        st.add('E')
        expect(st.getToStore()).toEqual(['B', 'D', 'E'])
    })
})