import ElementWrapper from './ElementWrapper';

const safetySizeErrorMargin = 2;

/**
 * @param {Element[]} elements
 * @param {Boolean} respectAvoidPageBreak
 */
export function flattenElements(elements, respectAvoidPageBreak = true) {
    return Array.from(elements).reduce((prev, element) => {
        if (isAbsoluteAndFullHeight(element)) {
            return prev; //those elements are ignored - they will be brought back later thanks to unflatten
        }
        if (!canElementBeBroken(element, respectAvoidPageBreak)) {
            return [...prev, element];
        }
        return [...prev, ...flattenElements(element.children, respectAvoidPageBreak)];
    }, []);
}

/**
 * @param {Element} element
 * @param {boolean} respectAvoidPageBreak
 * @return {boolean}
 */
function canElementBeBroken(element, respectAvoidPageBreak) {
    const shouldNotBeBroken = (element.children.length === 0
        || respectAvoidPageBreak && hasAvoidPageBreak(element)
        || hasPageBreakBefore(element)
        || hasPageBreakAfter(element)
        || oneOfChildrenIsNotPositionBelowThePrevOne(element)
        || hasNoElementsEffectDocumentFlow(element)
    );

    return !shouldNotBeBroken;
}

/**
 * @param {ElementWrapper} element
 * @param {ElementWrapper} secondElement
 * @return {number} e.g. 0 - element and second element are equal, 1 - first parent of `element` is common ancestor
 */
function getIndexOfCommonAncesstor(element, secondElement) {
    return Math.max(-1, ...element.path.map(elementInPath => secondElement.path.indexOf(elementInPath)));
}

/**
 * merges second element tree into of the first one, so updates path of flattened element for later use
 * @param {ElementWrapper} firstElement
 * @param {ElementWrapper} secondElement
 * @return {Element} treeToBeMerged
 */
export function mergeToPreviousElement(firstElement, secondElement) {
    const [
        firstElementCommonAncestorPathIndex,
        secondElementCommonAncestorPathIndex
    ] = getPathIndexesOfCommonAncestor(firstElement, secondElement);

    const treeToBeMerged = secondElement.unflattenedPath[secondElementCommonAncestorPathIndex + 1];
    const clonedCommonAncestor = firstElement.unflattenedPath[firstElementCommonAncestorPathIndex];
    clonedCommonAncestor.append(treeToBeMerged);
    secondElement.unflattenedPath = [
        ...firstElement.unflattenedPath.slice(0, firstElementCommonAncestorPathIndex + 1),
        ...secondElement.unflattenedPath.slice(secondElementCommonAncestorPathIndex + 1)
    ];

    return treeToBeMerged;
}

/**
 * @param {ElementWrapper} firstElement
 * @param {ElementWrapper} secondElement
 * @return {[Number, Number]}
 */
function getPathIndexesOfCommonAncestor(firstElement, secondElement) {
    const firstElementCommonAncestorPathIndex = getIndexOfCommonAncesstor(firstElement, secondElement);
    const commonAncestor = firstElement.path[firstElementCommonAncestorPathIndex];
    const secondElementCommonAncestorPathIndex = secondElement.path.indexOf(commonAncestor);
    return [
        firstElementCommonAncestorPathIndex,
        secondElementCommonAncestorPathIndex
    ];
}

/**
 * @param {ElementWrapper|null} element
 * @param {ElementWrapper} previousElement
 * @return {Boolean}
 */
export function canBeMergedToPreviousElement(element, previousElement) {
    const commonAncestorIndex = getIndexOfCommonAncesstor(element, previousElement);
    return (commonAncestorIndex > 0); //0 means those are the same elements
}

/**
 * This method should ignore elements that are not affect document flow (absolute, display:none etc)
 * @param {Element} element
 * @return {boolean}
 */
function oneOfChildrenIsNotPositionBelowThePrevOne(element) {
    return Array.from(element.children)
        .filter(child => window.getComputedStyle(child).position !== 'absolute')
        .filter(child => window.getComputedStyle(child).display !== 'none')
        .some((element, index, array) => {
            const prevElement = array[index - 1];
            if (!prevElement) {
                return false;
            }
            const prevElementBottom = prevElement.offsetHeight + prevElement.offsetTop;

            if ((element.offsetTop + safetySizeErrorMargin) < prevElementBottom) {
                return true;
            }
            return false;
        });
}

function hasNoElementsEffectDocumentFlow(element) {
    const atLeastOneChildIsPositionedAbsolutely = Array.from(element.children)
        .some(element => window.getComputedStyle(element).position !== 'absolute');
    return !atLeastOneChildIsPositionedAbsolutely; //not even once is positioned absolutely
}

/**
 * @param {Element} element
 * @return {Boolean}
 */
function hasAvoidPageBreak(element) {
    return window.getComputedStyle(element).pageBreakInside === 'avoid';
}

/**
 * @param {Element} element
 * @return {Boolean}
 */
function hasPageBreakBefore(element) {
    return window.getComputedStyle(element).pageBreakBefore === 'always';
}

/**
 * @param {Element} element
 * @return {Boolean}
 */
function hasPageBreakAfter(element) {
    return window.getComputedStyle(element).pageBreakAfter === 'always';
}

/**
 * @param {Element} element
 * @return {boolean}
 */
function oneOfChildrenIsNotFullWidth(element) {
    return Array.from(element.children)
        .filter(child => child.offsetHeight !== 0 && child.offsetWidth !== 0) //ignore elements as </br>
        .some(child => !isElementFullWidth(child));
}

/**
 * @param {Element} element
 * @return {boolean}
 */
function elementHasPageBreakControl(element) {
    const styles = window.getComputedStyle(element);
    return (styles.pageBreakBefore === 'always' || styles.pageBreakAfter === 'always');
}

/**
 * @param {Element} element
 */
function isElementFullWidth(element) {
    const parent = element.parentNode;
    const parentsInnerWidth = (
        parent.offsetWidth
        - parseInt(window.getComputedStyle(parent)['padding-right'])
        - parseInt(window.getComputedStyle(parent)['padding-left'])
        - parseInt(window.getComputedStyle(parent)['border-left-width'])
        - parseInt(window.getComputedStyle(parent)['border-right-width'])
    );

    return parentsInnerWidth === element.offsetWidth;
}

/**
 * @param {Element} element
 * @return {Element[]} e.g. [top parent, elements second parent, elements first parent] or []. First element of array is the closest to body.
 */
export function getElementsPathToParent(element, path = [], targetParentSelector = null) {
    if (!element.parentNode || (targetParentSelector && element.parentNode.matches(targetParentSelector))) {
        return [element, ...path];
    }

    const result = getElementsPathToParent(element.parentNode, [element, ...path], targetParentSelector);
    if (result === path) {
        console.warn('Could not find parent for ', element);
    }
    return result;
}

/**
 * @param {Element[]} path
 * @return {Element[]}
 */
export function cloneTreeAndKeepSingleLeaf(path) {
    return path.reduceRight((prev, element, index) => {
        const isLeaf = prev.length === 0;
        const clonedElement = element.cloneNode(isLeaf ? true : 0);
        const previousClonedElement = prev[0];
        const previousElement = path[index + 1];
        if (previousClonedElement) {
            const elementsChildren = Array.from(element.children);
            const previousElementIndex = elementsChildren.findIndex(child => child === previousElement);

            const a = elementsChildren.slice(0, previousElementIndex) //bring back ignored elements during flatten
                .filter(isAbsoluteAndFullHeight).map(child => child.cloneNode(true));
            a.forEach(clone => clonedElement.appendChild(clone));

            clonedElement.append(previousClonedElement); //cloned element to be connected to its parent

            const b = elementsChildren.slice(previousElementIndex + 1) //bring back ignored elements during flatten
                .filter(isAbsoluteAndFullHeight).map(child => child.cloneNode(true));
            b.forEach(clone => clonedElement.appendChild(clone));
        }
        return [clonedElement, ...prev];
    }, []);
}

/**
 * @param {Element} element
 */
function isAbsoluteAndFullHeight(element) {
    const parentsContentHeight = getContentHeight(element.parentElement);
    return window.getComputedStyle(element).position === 'absolute' && isSizeEqual(parentsContentHeight, element.offsetHeight);
}

/**
 * @param {Number} size1
 * @param {Number} size2
 * @return {boolean}
 */
function isSizeEqual(size1, size2) {
    return (Math.abs(size1 - size2) <= safetySizeErrorMargin);
}

/**
 * @param {Element} element
 * @return {Number}
 */
function getContentHeight(element) {
    const style = window.getComputedStyle(element);
    return element.offsetHeight
        - parseInt(style.borderTopWidth)
        - parseInt(style.borderBottomWidth)
        - parseInt(style.paddingTop)
        - parseInt(style.paddingBottom);
}

/**
 * @param {ElementWrapper} textNodeWrapper
 */
export function splitTextNode(textNodeWrapper) {
    const originalTextNodeParent = textNodeWrapper.element;
    const textLines = textNodeWrapper.element.innerText.split(/\r?\n/);
    const textNodeClone = textNodeWrapper.element.cloneNode(false);
    textNodeClone.innerHTML = '';
    originalTextNodeParent.innerHTML = '';

    const elements = textLines.map(textLine => {
        const element = textNodeClone.cloneNode(false);
        element.innerText = textLine + '\r\n';
        originalTextNodeParent.append(element);
        return element;
    });

    return elements.map(element => new ElementWrapper(element));
}

