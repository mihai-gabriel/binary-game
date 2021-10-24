import {Component} from "react";
import contains from "./Utility";

export class Board extends Component {
    constructor(props) {
        super(props);
        this.mappingLines = {
            0: '6',
            1: '5',
            2: '4',
            3: '3',
            4: '2',
            5: '1',
        };
        this.mappingColumns = {
            0: 'A',
            1: 'B',
            2: 'C',
            3: 'D',
            4: 'E',
            5: 'F',
        };
    }

    getCoord(i, j) {
        return this.mappingColumns[j] + this.mappingLines[i];
    }

    isFaulty(i, j) {
        let faultyColumns = this.props.faultyLines.columns;
        let faultyRows = this.props.faultyLines.rows;

        return faultyColumns.includes(j) || faultyRows.includes(i);
    }

    update(i, j) {
        this.props.updateBoard(i, j);
        this.props.validateBoard();
    }

    renderSquare(i, j) {
        let isPreset = contains(this.props.immutable, [i, j]);
        let boardValue = this.props.board[i][j];
        let displayValue = boardValue !== '-' ? boardValue : " ";
        let coord = this.getCoord(i, j);
        let faulty = this.isFaulty(i, j);

        return (
            <td
                key={coord}
                onClick={() => this.update(i, j)}
                className={(isPreset ? "preset " : "") + (faulty ? "invalid": "")}
            >{displayValue}</td>
        );
    }

    renderRow(i) {
        let row = [];
        for (let j = 0; j < 6; j++) {
            row.push(this.renderSquare(i, j));
        }

        return (
            <tr key={this.mappingColumns[i]}>
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
            <table className="gameBoard">
                <tbody>
                    {rows}
                </tbody>
            </table>
        )
    }
}