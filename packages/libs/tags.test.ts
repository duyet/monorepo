import { normalizeTag } from './tags';

describe('normalizeTag', () => {
    it('should capitalize first letter of single word', () => {
        expect(normalizeTag('javascript')).toBe('Javascript');
        expect(normalizeTag('JAVASCRIPT')).toBe('Javascript');
        expect(normalizeTag('javaScript')).toBe('Javascript');
    });

    it('should capitalize first letter of each word', () => {
        expect(normalizeTag('javascript framework')).toBe('Javascript Framework');
        expect(normalizeTag('JAVASCRIPT FRAMEWORK')).toBe('Javascript Framework');
        expect(normalizeTag('javaScript frameWork')).toBe('Javascript Framework');
    });

    it('should handle empty string', () => {
        expect(normalizeTag('')).toBe('');
    });

    it('should handle multiple spaces between words', () => {
        expect(normalizeTag('javascript    framework')).toBe('Javascript Framework');
    });

    it('should handle special characters', () => {
        expect(normalizeTag('node.js')).toBe('Node.js');
        expect(normalizeTag('c++')).toBe('C++');
    });
});