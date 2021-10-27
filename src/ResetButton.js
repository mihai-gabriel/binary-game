export function ResetButton(props) {
    return (
        <div className="gameReset">
            <button onClick={() => props.onClick()}><i className="fas fa-undo"/> {props.message}</button>
        </div>
    )
}