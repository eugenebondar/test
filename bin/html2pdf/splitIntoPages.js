import { canBeMergedToPreviousElement, flattenElements, mergeToPreviousElement, splitTextNode } from './flattenChildren';
import ElementWrapper from './ElementWrapper';
import ElementChainProcessor from './ElementChainProcessor';

/**
 * @param {ElementWrapper[]} elementWrappers
 * @param {Number} maxHeight
 * @param {function(this:null):Element} pageInserter
 * @param {function(this:null,Element):Element} pageContentContainerSelector
 */
export function splitElementsBetweenPages(elementWrappers, maxHeight, pageInserter, pageContentContainerSelector) {
    const elementProcessorChain = new ElementChainProcessor(pageInserter, pageContentContainerSelector, maxHeight);

    //page break before
    elementProcessorChain.addProcessor(
        (elementWrapper, info, prevElementWrapper) => (
            !info.isPageEmpty &&
            (elementWrapper.isPageBreakBefore || (prevElementWrapper && prevElementWrapper.isPageBreakAfter))
        ),
        (elementWrapper, prevElementWrapper, actions) => actions.newPage()
    );

    //explode not fitting text node
    elementProcessorChain.addProcessor(
        (elementWrapper, info) => !info.canFitIntoCurrentPage && elementWrapper.isTextNode && elementWrapper.canBeExploded,
        (elementWrapper, prevElementWrapper, actions) => {
            const textNodeWrappers = splitTextNode(elementWrapper);
            actions.replaceCurrentElement(textNodeWrappers);
        }
    );

    //explode not fitting element to whole page
    elementProcessorChain.addProcessor(
        (elementWrapper, info) => {
            const explodableCannotFit = !info.canFitIntoCurrentPage && elementWrapper.canBeExploded;
            const respectsPageBreakInsideAvoid = (info.isPageEmpty && elementWrapper.isPageBreakInsideAvoid)
                || !elementWrapper.isPageBreakInsideAvoid;
            return explodableCannotFit && respectsPageBreakInsideAvoid;
        },
        (elementWrapper, prevElementWrapper, actions) => {
            elementWrapper.unflattened.remove();
            elementWrapper.unflattenedPathCache = null;
            const respectPageBreakAvoid = !elementWrapper.isPageBreakInsideAvoid;
            const flattenedElements = flattenElements([elementWrapper.element], respectPageBreakAvoid)
                .map(element => new ElementWrapper(element));

            if (elementWrapper.isPageBreakAfter) {
                flattenedElements[flattenedElements.length - 1].isPageBreakAfter = true;
            }

            if (flattenedElements.length === 1 && flattenedElements[0].element === elementWrapper.element) {
                flattenedElements[0].forbidFurtherExploding(); //forbid further exploding if element was not successfully flattened
            }
            actions.replaceCurrentElement(flattenedElements);
        }
    );

    //merge to previous element
    elementProcessorChain.addProcessor(
        (elementWrapper, info, prevElementWrapper) => {
            return !info.isPageEmpty && canBeMergedToPreviousElement(prevElementWrapper, elementWrapper);
        },
        (elementWrapper, prevElementWrapper, actions, pageContent) => {
            const mergedTree = mergeToPreviousElement(prevElementWrapper, elementWrapper);
            const currentsPageHeightAfterAddingElement = pageContent.offsetHeight;
            if (currentsPageHeightAfterAddingElement > (maxHeight + 1 )) {
                mergedTree.remove();
                elementWrapper.unflattenedPathCache = null;
                actions.newPage();
            } else {
                actions.nextElement();
            }
        }
    );

    //simply add element to page
    elementProcessorChain.addProcessor(
        (elementWrapper, info, prevElementWrapper) => true,
        (elementWrapper, prevElementWrapper, actions, pageContent) => {
            const wasPageEmpty = pageContent.offsetHeight === 0;

            pageContent.appendChild(elementWrapper.unflattened);
            const currentsPageHeightAfterAddingElement = pageContent.offsetHeight;

            //after appending unflattened element, it may appear that it actually does not fit the page
            const currentElementActuallyDoesNotFitThePage = currentsPageHeightAfterAddingElement > (maxHeight + 1 );
            if (wasPageEmpty && currentElementActuallyDoesNotFitThePage) {
                actions.nextElement();
                console.warn('Element', elementWrapper.element, 'does not fit on the whole page, and was not exploded into smaller one');
            } else if (!wasPageEmpty && currentElementActuallyDoesNotFitThePage) {
                actions.newPage();
            } else {
                actions.nextElement();
            }
        }
    );

    elementProcessorChain.start(elementWrappers);
}
