import { flattenElements } from './flattenChildren';
import { splitElementsBetweenPages } from './splitIntoPages';
import ElementWrapper from './ElementWrapper';

/**
 * @param {Element} initialPage
 * @return {ElementWrapper[]}
 */
function getFlattenedElements(initialPage) {
    const firstPageContentContainer = initialPage.querySelector('article');

    return flattenElements(firstPageContentContainer.children).map(element => new ElementWrapper(element));
}

/**
 * @param {Element} initialPage
 * @return {number}
 */
function getMaxPegeHeight(initialPage) {
    const firstPageContentMain = initialPage.querySelector('.content__main');
    const height = firstPageContentMain.offsetHeight;

    return height;
}

/**
 * @param {Element} initialPage
 */
function createTemplatePage(initialPage) {
    const templatePage = initialPage.cloneNode(true);
    templatePage.querySelector('article').innerHTML = '';
    return templatePage;
}

/**
 * @param {Element} page
 * @param {number} pageIndex
 * @param {number} pagesCount
 */
function putContentIntoPagesFooter(page, pageIndex, pagesCount) {
    const pagesNumberContainer = Array.from(page.querySelectorAll('.content__footer span')).pop();
    pagesNumberContainer.textContent = pagesNumberContainer.textContent
        .replace('{{pages}}', pagesCount)
        .replace('{{page}}', '' + (pageIndex + 1));
}

function start(body) {
    const pagesContainer = body.querySelector('.content-wrap');
    const initialPage = pagesContainer && pagesContainer.querySelector('.content');
    if (!pagesContainer || !initialPage) {
        return;
    }

    const maxPageHeight = getMaxPegeHeight(initialPage);
    const elementWrappers = getFlattenedElements(initialPage);
    const templatePage = createTemplatePage(initialPage);

    /** @type {function(this:null):Element} */
    const pageInserter = () => {
        const currentPage = templatePage.cloneNode(true);
        pagesContainer.append(currentPage);
        return currentPage;
    };
    /** @type {function(this:null,Element):Element}*/
    const pageContentContainerSelector = (page) => page.querySelector('article');

    splitElementsBetweenPages(elementWrappers, maxPageHeight, pageInserter, pageContentContainerSelector);

    initialPage.remove();
    const pages = Array.from(pagesContainer.children);
    pages.forEach((page, index) => putContentIntoPagesFooter(page, index, pages.length));
}

start(document.querySelector('body'));
