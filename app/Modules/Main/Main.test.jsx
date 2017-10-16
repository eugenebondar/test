import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import Main from './Main';

describe('Main', () => {
    describe('with default set of props', () => {
        let component, errorConsole;

        beforeAll(() => {
            errorConsole = spyOn(console, 'error');
        });

        beforeEach(() => {
            component = shallow(<Main/>);
        });

        it('matches snapshot', () => {
            expect(shallowToJson(component)).toMatchSnapshot();
        });

        it('prints no errors from propTypes validation', () => {
            expect(errorConsole).not.toHaveBeenCalled();
        })
    })
});
