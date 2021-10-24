export function Pocket(props) {
    return (
        <div className="pocket">
            <div>
                <span className={props.zeros === 0 ? "empty" : ""}>{props.zeros} zeros left</span>
            </div>
            <div className="break"/>
            <div>
                <span className={props.ones === 0 ? "empty" : ""}>{props.ones} ones left</span>
            </div>
        </div>
    )
}