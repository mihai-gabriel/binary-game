export function Overlay(props) {
    return (
        <div className={props.gameFinished ? "gameFinishedOverlay" : "hidden"}>
            <h2>Congrats, you won</h2>
        </div>
    )
}