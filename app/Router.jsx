import React from 'react';
import Main from './Modules/Main/Main';

import { useRouterHistory, Router, Route } from 'react-router';
import { createHashHistory } from 'history';

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

function redirect() {
    appHistory.push('/');
}

const Routes = (
    <Router history={appHistory}>
        <Route path='/' component={Main} childRoutes={[
            {
                path: '*',
                onEnter: redirect
            }
        ]}>
        </Route>
    </Router>
);

export default Routes;
