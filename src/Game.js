import {Component} from "react";
import axios from "axios";
import './Game.css';


function GameOver(props) {
    return (
        <div className={props.isWon ? "gameStatus" : "hidden"}>
            <h2>Congrats, you won</h2>
        </div>
    )
}

function Pocket(props) {
    return (
        <div className="pocket">
            <div>
                <span className={props.zeros === 0 ? "empty" : ""}>{props.zeros} zeros left</span>
            </div>
            <div className="break" />
            <div>
                <span className={props.ones === 0 ? "empty" : ""}>{props.ones} ones left</span>
            </div>
        </div>
    )
}

function ResetButton(props) {
    return (
        <div className="gameReset">
            <button onClick={() => props.onClick()}>Reset game</button>
        </div>
    )
}

function SwitchButton(props) {
    return (
        <button
            onClick={() => {props.onClick(props.switchValue)}}
            className={props.value === props.switchValue ? "active" : ""}
        >{props.switchValue}
        </button>
    )
}

class Board extends Component {
    constructor(props) {
        super(props);
        this.mappingLines = {
            0: '6',
            1: '5',
            2: '4',
            3: '3',
            4: '2',
            5: '1',
        }
        this.mappingColumns = {
            0: 'A',
            1: 'B',
            2: 'C',
            3: 'D',
            4: 'E',
            5: 'F',
        }
    }

    getCoord(i, j) {
        return this.mappingColumns[j] + this.mappingLines[i];
    }

    renderColumn(i, j) {
        let isPreset = contains(this.props.immutable, [i, j]);
        let boardValue = this.props.board[i][j];
        let displayValue = boardValue !== '-' ? boardValue : " ";
        let coord = this.getCoord(i, j);

        return (
            <td
                key={coord}
                onClick={() => this.props.updateBoard(i, j)}
                className={isPreset ? "preset" : ""}
            >{displayValue}</td>
        );
    }

    renderRow(i) {
        let columns = [];
        for (let j = 0; j < 6; j++) {
            columns.push(this.renderColumn(i, j));
        }

        return (
            <tr key={this.mappingColumns[i]}>
                {columns}
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

class Game extends Component {
    constructor(props) {
        super(props);
        this.initialGame = {};
        this.state = {
            immutable: [],
            pocket: {
                0: 0,
                1: 0,
            },
            value: 1,
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
        this.initialGame.fen.split('/').forEach((row, i) => {
            let rowSplit = row.split('');
            result.push(rowSplit);

            rowSplit.forEach((column, j) => {
                if (column !== '-') {
                    immutable.push([i, j]);
                }
            });
        });
        this.setState({board: result, immutable: immutable});
    }

    async fetchPreset() {
        let response = await axios.get('http://127.0.0.1:5000/api/v1/resources/game');
        this.initialGame.fen = response.data['fen'];
        this.initialGame.pocket = response.data['pocket'];

        this.setState({
            pocket: response.data['pocket'],
            winning: response.data['winning'],
        });
        this.loadFen();
    }

    resetGame() {
        this.setState({pocket: this.initialGame.pocket});
        this.loadFen();
    }

    updateBoard(i, j) {
        let currentBoard = this.state.board;
        let oldValue = parseInt(currentBoard[i][j]);
        let currentValue = this.state.value;
        let oppositeValue = Math.abs(this.state.value - 1); // abs(0 - 1) = 1 || abs(1 - 1) = 0

        if (contains(this.state.immutable, [i, j]) ||
            this.state.pocket[currentValue] === 0) {
            return;
        }

        if (currentValue === 'take') {
            if (isNaN(oldValue)) {
                return;
            }

            let newPocket = this.state.pocket;
            newPocket[oldValue] = this.state.pocket[oldValue] + 1;
            currentBoard[i][j] = "-";
            this.setState({
                board: currentBoard,
                pocket: newPocket
            });

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

    setValue(value) {
        this.setState({value: value});
    }

    componentDidMount() {
        this.fetchPreset();
    }

    renderSwitchButton(value) {
        return (
            <SwitchButton
                switchValue={value}
                onClick={this.setValue.bind(this)}
                value={this.state.value}
            />
        )
    }

    render() {
        let won = this.state.winning === this.fen();

        return (
            <div className="game">
                <GameOver isWon={won}/>
                <Pocket
                    zeros={this.state.pocket[0]}
                    ones={this.state.pocket[1]}
                />
                <ResetButton onClick={this.resetGame.bind(this)}/>
                <div className="gameBoard">
                    <Board
                        immutable={this.state.immutable}
                        board={this.state.board}
                        updateBoard={this.updateBoard.bind(this)}
                    />
                </div>
                <div className="switchButtons">
                    {this.renderSwitchButton(1)}
                    {this.renderSwitchButton(0)}
                    {this.renderSwitchButton('take')}
                </div>
            </div>
        )
    }
}

function contains(arr, item) {
    let itemString = JSON.stringify(item);

    return arr.some(el => {
        return JSON.stringify(el) === itemString;
    });
}

export default Game;