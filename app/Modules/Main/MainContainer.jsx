import { Component } from 'reflux';
import React from 'react';
import MainStore from './MainStore';
import Main from './Main';
import mainActions from './mainActions';

export default class MainContainer extends Component.extend(React.PureComponent) {

    static propTypes = {};

    static defaultProps = {};

    constructor() {
        super();

        this.store = MainStore;

        this.mapStoreToState(MainStore, () => {
            //todo implement logic here or remove it
        });
    }

    componentDidMount() {
        mainActions.init();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        mainActions.destroy();
    }

    render() {
        return <Main
            {...this.state}
        />;
    }
}
