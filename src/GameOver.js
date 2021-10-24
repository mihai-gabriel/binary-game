export function GameOver(props) {
    return (
        <div className={props.isWon ? "gameStatus" : "hidden"}>
            <h2>Congrats, you won</h2>
        </div>
    )
}