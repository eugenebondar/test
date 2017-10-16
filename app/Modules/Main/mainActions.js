import Reflux from 'reflux';

const mainActions = {
    init: Reflux.createAction({ asyncResult: true }),
    destroy: Reflux.createAction({ sync: true })
};

const text = 'this is data coming from action';

mainActions.init.listen(function() {
    (Math.random() > 0.5) ? this.completed({ text }) : this.failed();
});

export default mainActions;
