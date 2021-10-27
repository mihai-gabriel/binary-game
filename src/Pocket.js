import './Pocket.css'

export function Pocket(props) {
    return (
        <div className="pocket">
            <p>ones: {props.ones}</p>
            <p>zeros: {props.zeros}</p>
        </div>
    )
}