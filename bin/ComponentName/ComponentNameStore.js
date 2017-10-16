import Reflux from 'reflux';
import componentNameActions from './componentNameActions';

export const defaultState = {
    isLoading: false,
    isError: false
};

class ComponentNameStore extends Reflux.Store {

    constructor() {
        super();

        this.listenables = componentNameActions;

        this.state = { ...defaultState };
    }

    /**
     * @listens componentNameActions.init
     */
    onInit() {
        this.setState({
            isLoading: true
        });
    }

    /**
     * @listens componentNameActions.init.completed
     */
    onInitCompleted({ text }) {
        this.setState({
            text,
            isLoading: false
        });
    }

    /**
     * @listens componentNameActions.init.failed
     */
    onInitFailed() {
        this.setState({
            isLoading: false,
            isError: true
        });
    }

    /**
     * @listens componentNameActions.destroy
     */
    onDestroy() {
        this.setState(defaultState);
    }
}

export default Reflux.initStore(ComponentNameStore);
