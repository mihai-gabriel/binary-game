import {Component} from "react";
import axios from "axios";
import {SelectBoard} from "./SelectBoard";
import './App.css'
import {Game} from "./Game";


export class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            boardsFEN: {},
            gameChosen: false,
            chosenGame: '',
        };
    }

    async fetchGamesData() {
        return axios('http://127.0.0.1:5000/api/v2/resources/games');
    }

    componentDidMount() {
        this.fetchGamesData().then(response => {
            this.setState({
                boardsFEN: response.data
            })
        });
    }

    loadGame(letter) {
        this.setState({
            gameChosen: true,
            chosenGame: letter,
        });
    }

    renderSelectBoard(fen, letter) {
        return (
            <SelectBoard
                key={letter}
                fen={fen}
                letter={letter}
                onClick={this.loadGame.bind(this)}
            />
        )
    }

    renderSelectBoards() {
        let boards = [];
        Object.entries(this.state.boardsFEN)
            .forEach(([key, val]) => {
                boards.push(this.renderSelectBoard(val, key));
            });

        return boards;
    }

    backToWelcome() {
        this.setState({
            gameChosen: false,
        });
    }

    render() {
        let toRender;

        if (this.state.gameChosen) {
            toRender = (
                <div className="beginGame">
                    <Game letter={this.state.chosenGame} back={this.backToWelcome.bind(this)}/>
                </div>
            );
        } else {
            toRender = (
                <div className="welcomeScreen">
                    <h1 className="title">Binary game</h1>
                    <h4 className="subtitle">Choose a board</h4>
                    <div className="mockBoards">
                        {this.renderSelectBoards()}
                    </div>
                </div>
            );
        }

        return (
            <section className="content">
                {toRender}
            </section>
        );
    }
}