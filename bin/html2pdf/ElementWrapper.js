import { cloneTreeAndKeepSingleLeaf, getElementsPathToParent } from './flattenChildren';

/**
 * Instances of ElementWrapper hold useful information about an element, that stops being accessible after detaching the element from DOM.
 */
export default class ElementWrapper {

    /**
     * @param {Element} element
     */
    constructor(element) {
        /**
         * @type {Element}
         */
        this.element = element;
        this.computedStyles = Object.assign({}, window.getComputedStyle(element));

        this.height = this.getRealElementHeight();

        //resetting pageBreaks so there is no collision between manual and printer's splitter
        this.element.style.pageBreakBefore = 'auto';
        this.element.style.pageBreakAfter = 'auto';

        /**
         * @private
         * @type {Element[]}
         */
        this.pathCache = null;
        /**
         * @private
         * @type {Element[]}
         */
        this.unflattenedPathCache = null;

        /**
         * @type {boolean}
         */
        this.isFurtherExplodingForbidden = false;
    }

    get isPageBreakBefore() {
        return this.computedStyles.pageBreakBefore === 'always';
    }

    get isPageBreakAfter() {
        return this.computedStyles.pageBreakAfter === 'always';
    }

    /**
     * @param {Boolean} [setToTrue]
     */
    set isPageBreakAfter(setToTrue) {
        this.computedStyles.pageBreakAfter = setToTrue ? 'always' : '';
    }

    get isPageBreakInsideAvoid() {
        return this.computedStyles.pageBreakInside === 'avoid';
    }

    get isTextNode() {
        return this.element.innerText.trim() && this.element.childElementCount === 0;
    }

    /**
     * chain of parents of original element to content container
     * @return {Element[]}
     */
    get path() {
        if (!this.pathCache) {
            this.pathCache = getElementsPathToParent(this.element, [], 'article');
        }
        return this.pathCache;
    }

    /**
     * returns a top parent of flattened f
     * @return {Element}
     */
    get unflattened() {
        if (!this.unflattenedPathCache) {
            this.unflattenedPathCache = cloneTreeAndKeepSingleLeaf(this.path);
        }
        return this.unflattenedPathCache[0];
    }

    /**
     * returns a path of elements starting from top parent ending on leaf
     * @return {Element[]}
     */
    get unflattenedPath() {
        if (!this.unflattenedPathCache) {
            this.unflattenedPathCache = cloneTreeAndKeepSingleLeaf(this.path);
        }
        return this.unflattenedPathCache;
    }

    /**
     * @param {Element[]} path
     */
    set unflattenedPath(path) {
        this.unflattenedPathCache = path;
    }

    /**
     * this should have similar logic to canElementBeBroken in flattenChildren
     * @return {boolean}
     */
    get canBeExploded() {
        if (this.isFurtherExplodingForbidden) {
            return false;
        } else if (this.isTextNode) {
            return ElementWrapper.EOL_CHARACTER_REGEX.test(this.element.innerText); //for now only text nodes with multiple lines can be exploded
        } else if (this.element.childElementCount > 0) {
            return true;
        }

        return false;
    }

    forbidFurtherExploding() {
        this.isFurtherExplodingForbidden = true;
    }

    /**
     * @private
     */
    getRealElementHeight() {
        if (this.element.matches('br')) {
            return parseInt(this.computedStyles.lineHeight);
        }

        return this.element.offsetHeight;
    }
}

ElementWrapper.EOL_CHARACTER_REGEX = /\r?\n/;
