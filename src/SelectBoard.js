import {Component} from "react";
import './SelectBoard.css';

export class SelectBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            board: [
                ['-', '-', '-', '-', '-', '-'],
                ['-', '-', '-', '-', '-', '-'],
                ['-', '-', '-', '-', '-', '-'],
                ['-', '-', '-', '-', '-', '-'],
                ['-', '-', '-', '-', '-', '-'],
                ['-', '-', '-', '-', '-', '-'],
            ]
        };
    }

    loadFEN() {
        let result = []
        this.props.fen.split('/').forEach(row => {
            result.push(row.split(""));
        });

        this.setState({
            board: result,
        });
    }

    componentDidMount() {
        this.loadFEN();
    }

    renderSquare(i, j) {
        let boardValue = this.state.board[i][j];
        let displayValue = boardValue !== '-' ? boardValue : " ";
        let isPreset = boardValue !== '-';
        let key = (6 * i) + j + 1;

        return (
            <td key={key} className={isPreset ? "preset" : ""}>{displayValue}</td>
        );
    }

    renderRow(i) {
        let row = [];
        for (let j = 0; j < 6; j++) {
            row.push(this.renderSquare(i, j));
        }

        return (
            <tr key={i}>
                {row}
            </tr>
        )
    }

    render() {
        let rows = [];
        for (let i = 0; i < 6; i++) {
            rows.push(this.renderRow(i));
        }

        return (
            <>
                <table className="mockBoard" onClick={() => {this.props.onClick(this.props.letter)}}>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </>
        )
    }

}