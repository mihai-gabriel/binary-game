import './BackButton.css'

export function BackButton(props) {
    return (
        <button onClick={() => {props.onClick()}}><i className="fas fa-arrow-left"/> Back</button>
    );
}