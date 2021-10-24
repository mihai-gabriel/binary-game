import {Component} from "react";
import axios from "axios";
import './Game.css';


function contains(arr, item) {
    let itemString = JSON.stringify(item);

    return arr.some(el => {
        return JSON.stringify(el) === itemString;
    });
}

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            immutable: [],
            pocket: {
                0: 0,
                1: 0,
            },
            value: 1,
            initialFen: '',
            initialPocket: {},
            board: [
                ['-', '-', '-', '-', '-', '-'],
                ['-', '-', '-', '-', '-', '-'],
                ['-', '-', '-', '-', '-', '-'],
                ['-', '-', '-', '-', '-', '-'],
                ['-', '-', '-', '-', '-', '-'],
                ['-', '-', '-', '-', '-', '-'],
            ]
        }
    }

    fen() {
        let result = "";
        this.state.board.forEach(row => {
            result += `${row.join("")}/`;
        });
        return result.slice(0, -1);
    }

    loadFen() {
        let result = [];
        let immutable = [];
        this.state.initialFen.split('/').forEach(row => {
            result.push(row.split(""));
        });

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                if (result[i][j] !== '-') {
                    immutable.push([i, j]);
                }
            }
        }
        this.setState({board: result, immutable: immutable});
    }

    async fetchPreset() {
        let response = await axios.get('http://127.0.0.1:5000/api/v1/resources/game');
        this.setState({
            initialFen: response.data['fen'],
            pocket: response.data['pocket'],
            initialPocket: response.data['pocket'],
            winning: response.data['winning'],
        });
        this.loadFen();
    }

    resetGame() {
        this.setState({pocket: this.state.initialPocket});
        this.loadFen();
    }

    componentDidMount() {
        this.fetchPreset();
    }

    updateBoard(i, j) {
        let currentBoard = this.state.board;
        let oldValue = parseInt(currentBoard[i][j]);
        let currentValue = this.state.value;
        let oppositeValue = Math.abs(this.state.value - 1); // abs(0 - 1) = 1 || abs(1 - 1) = 0

        if (contains(this.state.immutable, [i, j])) {
            return;
        }

        if (this.state.pocket[currentValue] === 0) {
            return;
        }

        this.setState({
            pocket: {
                [currentValue]: this.state.pocket[currentValue] - (oldValue === currentValue ? 0 : 1),
                [oppositeValue]: this.state.pocket[oppositeValue] + (oldValue === oppositeValue ? 1 : 0)
            }
        })

        currentBoard[i][j] = this.state.value;
        this.setState({board: currentBoard});
    }

    renderSquare(i, j) {
        let isPreset = contains(this.state.immutable, [i, j]);
        let value = this.state.board[i][j] !== '-' ? this.state.board[i][j] : " ";

        return (
            <td
                onClick={() => this.updateBoard(i, j)}
                className={isPreset ? "preset" : ""}
            >{value}</td>
        );
    }

    renderRow(i) {
        let columns = [];
        for (let j = 0; j < 6; j++) {
            columns.push(this.renderSquare(i, j));
        }

        return (
            <tr>
                {columns}
            </tr>
        )
    }

    renderBoard() {
        let rows = [];
        for (let i = 0; i < 6; i++) {
            rows.push(this.renderRow(i));
        }

        return (
            <table className="gameBoard">
                {rows}
            </table>
        )
    }


    render() {
        let won = this.state.winning === this.fen();

        return (
            <>
                <div className={won ? "gameStatus": "hidden"}>
                    <h2>Congrats, you won</h2>
                </div>
                <div className="pocket">
                    <div>
                        <span>{this.state.pocket[0]} zeros left</span>
                    </div>
                    <div className="break"/>
                    <div>
                        <span>{this.state.pocket[1]} ones left</span>
                    </div>
                </div>
                <div className="gameControls">
                    <button onClick={() => this.resetGame()}>Reset game</button>
                </div>
                <div className="gameBoard">
                    {this.renderBoard()}
                </div>
                <div className="switchButtons">
                    <button
                        onClick={() => {this.setState({value: 1})}}
                        className={this.state.value === 1 ? "active" : ""}
                    >1
                    </button>
                    <button
                        onClick={() => {this.setState({value: 0})}}
                        className={this.state.value === 0 ? "active" : ""}
                    >0
                    </button>
                </div>
            </>

        )
    }
}

export default Game;