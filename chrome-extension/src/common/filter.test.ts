import { multiIncludes } from "./filter";

describe('multiIncludes', () => {
    it('should work with ! as separator', () => {
        expect(multiIncludes('WTB [Rare Mayhem Token]', 'WTB![Rare Mayhem Token]')).toBeTruthy();
    });
});
