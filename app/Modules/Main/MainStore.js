import Reflux from 'reflux';
import mainActions from './mainActions';

export const defaultState = {
    isLoading: false,
    isError: false
};

class MainStore extends Reflux.Store {

    constructor() {
        super();

        this.listenables = mainActions;

        this.state = { ...defaultState };
    }

    /**
     * @listens mainActions.init
     */
    onInit() {
        this.setState({
            isLoading: true
        });
    }

    /**
     * @listens mainActions.init.completed
     */
    onInitCompleted({ text }) {
        this.setState({
            text,
            isLoading: false
        });
    }

    /**
     * @listens mainActions.init.failed
     */
    onInitFailed() {
        this.setState({
            isLoading: false,
            isError: true
        });
    }

    /**
     * @listens mainActions.destroy
     */
    onDestroy() {
        this.setState(defaultState);
    }
}

export default Reflux.initStore(MainStore);
