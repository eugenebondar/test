export default class ElementProcessorChain {

    /**
     * @param {function(this:null):Element} pageInserter
     * @param {function(this:null,Element):Element} pageContentContainerSelector
     * @param {Number} maxHeight
     */
    constructor(pageInserter, pageContentContainerSelector, maxHeight) {
        /** @type {{condition: Function, processor: function}[]} */
        this.chainOfProcessors = [];

        /** @type {function(this:null):Element} */
        this.pageInserter = pageInserter;

        /** @type {function(this:null,Element):Element} */
        this.pageContentContainerSelector = pageContentContainerSelector;

        /** @type {Number} */
        this.maxHeight = maxHeight;
    }

    /**
     * @param {function(this:null,elementWrapper:ElementWrapper,info:info,prevElementWrapper:ElementWrapper):Boolean} [condition]
     * @param {function(this:null,elementWrapper:ElementWrapper,prevElementWrapper:ElementWrapper,actions:actions,pageContent:Element):Boolean} [processor]
     */
    addProcessor(condition, processor) {
        this.chainOfProcessors.push({
            condition,
            processor
        });
    }

    /**
     * @param {ElementWrapper[]} elementWrappers
     */
    start(elementWrappers) {
        let index = 0;
        let debug = { previousIndex: 0, countCurrentIndex: 0 };
        let elementToCycleThrough = [...elementWrappers];
        let currentPage = this.pageInserter();
        while (index < elementToCycleThrough.length) {
            debug.countCurrentIndex++;
            if (debug.previousIndex !== index) {
                debug.previousIndex = index;
                debug.countCurrentIndex = 0;
            }
            const currentElementWrapper = elementToCycleThrough[index];
            const prevElementWrapper = elementToCycleThrough[index - 1];
            const currentPageContent = this.pageContentContainerSelector(currentPage);
            /** @type {info} */
            const info = {
                maxHeight: this.maxHeight,
                currentPageContentHeight: currentPageContent.offsetHeight,
                canFitIntoCurrentPage: canElementFitIntoPage(
                    this.maxHeight, currentElementWrapper, prevElementWrapper, currentPageContent.offsetHeight
                ),
                isPageEmpty: currentPageContent.offsetHeight === 0 //this ignores 0 height elements
            };

            const wasChainBroken = this.chainOfProcessors.some(processor => {
                const isConditionMet = processor.condition(currentElementWrapper, info, prevElementWrapper);
                if (!isConditionMet) {
                    return false; //continue 'some' loop
                }

                let skipRestOfChain = false;
                processor.processor(
                    currentElementWrapper,
                    prevElementWrapper,
                    {
                        newPage: () => {
                            currentPage = this.pageInserter();
                            skipRestOfChain = true;
                        },
                        /** @param {ElementWrapper[]} [elements] */
                        replaceCurrentElement: (elements) => {
                            const arrayOfElements = Array.isArray(elements) ? elements : [elements];
                            elementToCycleThrough.splice(index, 1, ...arrayOfElements);
                            skipRestOfChain = true;
                        },
                        nextElement: () => {
                            skipRestOfChain = true;
                            ++index;
                        }
                    },
                    currentPageContent
                );

                return skipRestOfChain; //breaks 'some' loop if skipRestOfChain===true
            });

            if (!wasChainBroken) {
                console.warn(
                    'Chain of processors was not broken for element: ', currentElementWrapper.element,
                    'index number', index,
                    'Page number: ', Array.from(currentPage.parentElement.children).findIndex(page => page === currentPage)
                );
            }
            if (debug.countCurrentIndex > 4) {
                console.warn(
                    'The same index element was processed by chain: ', currentElementWrapper.element,
                    'index number', index,
                    'Page number: ', Array.from(currentPage.parentElement.children).findIndex(page => page === currentPage),
                );
            }
            if (debug.countCurrentIndex > 8) {
                throw new Error(
                    'The same index element was processed more than 8 times by chain: ', currentElementWrapper.element,
                    'index number', index,
                    'Page number: ', Array.from(currentPage.parentElement.children).findIndex(page => page === currentPage),
                );
            }
        }
    }
}

/**
 * @param {Number} maxPageHeight
 * @param {ElementWrapper} [elementWrapper]
 * @param {ElementWrapper|null} [prevElementWrapper]
 * @param currentsPageElementsHeight
 * @return {boolean}
 */
function canElementFitIntoPage(maxPageHeight, elementWrapper, prevElementWrapper, currentsPageElementsHeight) {
    const extraSpaceToPreviousElement = !prevElementWrapper ? 0 : (
        elementWrapper.element.getBoundingClientRect().top
        - prevElementWrapper.element.getBoundingClientRect().top
        - prevElementWrapper.element.getBoundingClientRect().height
    );

    //ignores bottomMargin.
    const currentPageHeightAfterAddingElement = currentsPageElementsHeight
        + elementWrapper.element.offsetHeight
        + extraSpaceToPreviousElement;

    return currentPageHeightAfterAddingElement < maxPageHeight;
}

/* eslint-disable no-unused-vars */
/** @typedef {{isPageEmpty:Boolean, canFitIntoCurrentPage: Boolean, maxHeight: Number, currentPageContentHeight: Number}} */
const info = {};

/** @typedef {{newPage:function, replaceCurrentElement:function(this:null,ElementWrapper[]), nextElement: function}} */
const actions = {};
/* eslint-enable no-unused-vars */
