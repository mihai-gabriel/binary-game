import {Component} from "react";
import axios from "axios";
import './Game.css';
import contains from "./Utility";
import {Board} from "./Board";
import {GameOver} from "./GameOver";
import {SwitchButton} from "./SwitchButton";
import {ResetButton} from "./ResetButton";
import {Pocket} from "./Pocket";


export class Game extends Component {
    constructor(props) {
        super(props);
        this.initialGame = {};
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
                        faultyLines={this.state.faultyLines}
                        validateBoard={this.validateBoard.bind(this)}
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
