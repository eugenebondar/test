import React from 'react';
import classNames from 'classnames';
import './Main.less'; //todo add there some styles or remove

export default class Main extends React.PureComponent {

    static propTypes = {
        className: React.PropTypes.string,
        isError: React.PropTypes.bool,
        isLoading: React.PropTypes.bool,
        text: React.PropTypes.string
    };

    static defaultProps = {
        className : ''
    };

    render() {
        const finalClassName = classNames('main', this.props.className);
        return <div className={finalClassName}>
            Hello world
            {this.props.isError && <div>There was error</div>}
            {this.props.isLoading && <div>Loading</div>}
            <div>{this.props.text}</div>
        </div>;
    }
}
