import { Component } from 'reflux';
import React from 'react';
import ComponentNameStore from './ComponentNameStore';
import ComponentName from './ComponentName';
import componentNameActions from './componentNameActions';

export default class ComponentNameContainer extends Component.extend(React.PureComponent) {

    static propTypes = {};

    static defaultProps = {};

    constructor() {
        super();

        this.store = ComponentNameStore;

        this.mapStoreToState(ComponentNameStore, () => {
            //todo implement logic here or remove it
        });
    }

    componentDidMount() {
        componentNameActions.init();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        componentNameActions.destroy();
    }

    render() {
        return <ComponentName
            {...this.state}
        />;
    }
}
