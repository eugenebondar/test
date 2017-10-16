import React from 'react';
import classNames from 'classnames';
import './ComponentName.less'; //todo add there some styles or remove

export default class ComponentName extends React.PureComponent {

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
        const finalClassName = classNames('component-name', this.props.className);
        return <div className={finalClassName}>
            Hello world
            {this.props.isError && <div>There was error</div>}
            {this.props.isLoading && <div>Loading</div>}
            <div>{this.props.text}</div>
        </div>;
    }
}
