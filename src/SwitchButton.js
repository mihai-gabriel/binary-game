export function SwitchButton(props) {
    return (
        <button
            onClick={() => {
                props.onClick(props.switchValue)
            }}
            className={props.value === props.switchValue ? "active" : ""}
        >
            {props.switchValue}
        </button>
    )
}