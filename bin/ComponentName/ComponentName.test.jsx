import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
    describe('with default set of props', () => {
        let component, errorConsole;

        beforeAll(() => {
            errorConsole = spyOn(console, 'error');
        });

        beforeEach(() => {
            component = shallow(<ComponentName/>);
        });

        it('matches snapshot', () => {
            expect(shallowToJson(component)).toMatchSnapshot();
        });

        it('prints no errors from propTypes validation', () => {
            expect(errorConsole).not.toHaveBeenCalled();
        })
    })
});
