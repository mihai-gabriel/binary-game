import './SwitchButton.css'

export function SwitchButton(props) {
    let switchButton;
    if (props.value === 1) {
        switchButton = (<i className="fas fa-toggle-off toggleButton" onClick={() => {props.onClick(props.value)}}/>)
    } else {
        switchButton = (<i className="fas fa-toggle-on toggleButton" onClick={() => {props.onClick(props.value)}}/>)
    }

    return (
        <div className="switchButtons">
            <p className={props.value === 1 ? "active" : ""}>1</p>
            {switchButton}
            <p className={props.value === 0 ? "active" : ""}>0</p>
        </div>
    );
}