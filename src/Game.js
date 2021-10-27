import {Component} from "react";
import axios from "axios";
import './Game.css';
import contains from "./Utility";
import {Board} from "./Board";
import {Overlay} from "./Overlay";
import {SwitchButton} from "./SwitchButton";
import {ResetButton} from "./ResetButton";
import {Pocket} from "./Pocket";
import {BackButton} from "./BackButton";


export class Game extends Component {
    constructor(props) {
        super(props);
        this.initialGame = {};
        this.url = `http://127.0.0.1:5000/api/v2/resources/game/${props.letter}/`;
        this.state = {
            faultyLines: {
                columns: [],
                rows: []
            },
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
            let rowList = [];

            row.split('').forEach((column, j) => {
                if (column !== '-') {
                    immutable.push([i, j]);
                    rowList.push(parseInt(column));
                } else {
                    rowList.push(column);
                }
            });
            result.push(rowList);
        });
        this.setState({board: result, immutable: immutable});
    }

    async fetchPreset() {
        let response = await axios.get(this.url);
        this.initialGame.fen = response.data['fen'];
        this.initialGame.pocket = response.data['pocket'];

        this.setState({
            pocket: response.data['pocket'],
            winning: response.data['winning'],
        });
        return response;
    }

    resetGame() {
        this.setState({
            pocket: this.initialGame.pocket,
            faultyLines: {
                columns: [],
                rows: []
            }
        });
        this.loadFen();
    }

    checkLine(line) {
        let zeros = (line.match(/0/g) || []).length;
        let ones = (line.match(/1/g) || []).length;

        if (ones > 3 || zeros > 3) {
            return true;
        }

        return /1{3}|0{3}/.test(line);
    }

    validateBoard() {
        let board = this.state.board;
        let faultyColumns = [];
        let faultyRows = [];
        for (let i = 0; i < 6; i++) {
            let row = "";
            let column = "";
            for (let j = 0; j < 6; j++) {
                row += board[i][j].toString();
                column += board[j][i].toString();
            }

            if (this.checkLine(column)) {
                faultyColumns.push(i);
            }

            if (this.checkLine(row)) {
                faultyRows.push(i);
            }
        }
        this.setState({
            faultyLines: {
                columns: faultyColumns,
                rows: faultyRows,
            }
        });
    }

    getOpposite(value) {
        return Math.abs(value - 1); // abs(0 - 1) = 1 || abs(1 - 1) = 0
    }

    updateBoard(e, i, j) {
        const immutable = contains(this.state.immutable, [i, j]);
        let currentBoard = this.state.board;
        let oldValue = parseInt(currentBoard[i][j]);
        let currentValue = this.state.value;
        let oppositeValue = this.getOpposite(currentValue);

        if (e.type === 'contextmenu') {
            e.preventDefault();
            if (isNaN(oldValue) || immutable) {
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

        if (immutable || this.state.pocket[currentValue] === 0) {
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

    switchValue(value) {
        let oppositeValue = this.getOpposite(value);
        this.setState({value: oppositeValue});
    }

    componentDidMount() {
        this.fetchPreset().then(response => {
            this.loadFen();
        });
    }

    render() {
        let won;
        if (this.state.pocket[0] + this.state.pocket[1] === 0) {
            won = this.state.winning === this.fen()
        }

        return (
            <div className="game">
                <div className="gameHeader">
                    <Pocket
                        zeros={this.state.pocket[0]}
                        ones={this.state.pocket[1]}
                    />
                    <div className="controlButtons">
                        <ResetButton onClick={this.resetGame.bind(this)} message="Reset"/>
                        <BackButton onClick={() => {this.props.back()}}/>
                    </div>
                </div>
                <div className="gameBoard">
                    <h1>Puzzle {this.props.letter}</h1>

                    <Overlay gameFinished={won}/>
                    <Board
                        immutable={this.state.immutable}
                        board={this.state.board}
                        updateBoard={this.updateBoard.bind(this)}
                        faultyLines={this.state.faultyLines}
                        validateBoard={this.validateBoard.bind(this)}
                        gameFinished={won}
                    />
                    <SwitchButton onClick={this.switchValue.bind(this)} value={this.state.value}/>

                </div>
                <div className="gameInfo">
                    <div className="gameRules">
                        <h1>Aim</h1>
                        <p>
                            Solve the grid by placing a 1 or  <br/>
                            a 0 in each remaining spot
                        </p>
                        <h1>Game Rules</h1>
                        <ul>
                            <li>Each row and column contains the same amount of 1's and 0's</li>
                            <li>Each row and column forms a unique pattern</li>
                            <li>There are never more than two 1's or 0's next to each other, horizontally or vertically</li>
                        </ul>
                    </div>
                    <p><small>Pro tip:</small> <br/>Right-click to remove</p>
                </div>
            </div>
        )
    }
}
