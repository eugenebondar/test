import Reflux from 'reflux';

const componentNameActions = {
    init: Reflux.createAction({ asyncResult: true }),
    destroy: Reflux.createAction({ sync: true })
};

const text = 'this is data coming from action';

componentNameActions.init.listen(function() {
    (Math.random() > 0.5) ? this.completed({ text }) : this.failed();
});

export default componentNameActions;
