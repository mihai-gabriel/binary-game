export function ResetButton(props) {
    return (
        <div className="gameReset">
            <button onClick={() => props.onClick()}>Reset game</button>
        </div>
    )
}